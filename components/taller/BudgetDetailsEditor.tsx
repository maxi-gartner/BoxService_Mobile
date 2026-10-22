import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatMoney } from "@/lib/utils";
import type { BudgetDetail, BudgetDetailRequest } from "@/types/entities";

type EditableDetail = BudgetDetailRequest & { key: string };

function toEditable(details: BudgetDetail[]): EditableDetail[] {
  return details.map((d) => ({
    key: `d-${d.detailId}`,
    type: d.type,
    description: d.description,
    quantity: d.quantity,
    unitPrice: d.unitPrice,
  }));
}

// Editor de ítems de un presupuesto no finalizado — se usa tanto desde
// "Realizar trabajo" como para editar uno que todavía espera aprobación.
export function BudgetDetailsEditor({
  details,
  onSave,
  saving,
  saveLabel = "Guardar cambios",
  onFinalize,
  finalizing,
  finalizeLabel = "Finalizar trabajo",
}: {
  details: BudgetDetail[];
  onSave: (details: BudgetDetailRequest[]) => void;
  saving: boolean;
  saveLabel?: string;
  onFinalize?: (details: BudgetDetailRequest[]) => void;
  finalizing?: boolean;
  finalizeLabel?: string;
}) {
  const [items, setItems] = useState<EditableDetail[]>(() => toEditable(details));
  const [nextKey, setNextKey] = useState(1);

  function update(key: string, patch: Partial<EditableDetail>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  function remove(key: string) {
    setItems((prev) => prev.filter((it) => it.key !== key));
  }

  function addItem() {
    setItems((prev) => [...prev, { key: `new-${nextKey}`, type: "part", description: "", quantity: 1, unitPrice: 0 }]);
    setNextKey((n) => n + 1);
  }

  const total = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const valid = items.length > 0 && items.every((it) => it.description.trim() && it.quantity > 0 && it.unitPrice >= 0);
  const strip = (items: EditableDetail[]) => items.map(({ key, ...rest }) => rest);

  return (
    <View className="gap-3">
      {items.map((item) => (
        <View key={item.key} className="gap-2 rounded-lg border border-border bg-surface-2 p-3">
          <Input placeholder="Descripción" value={item.description} onChangeText={(v) => update(item.key, { description: v })} />
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => update(item.key, { type: "labor" })}
              className={`flex-1 items-center rounded-md py-2 ${item.type === "labor" ? "bg-accent" : "border border-border bg-surface"}`}
            >
              <Text className={`text-xs ${item.type === "labor" ? "font-semibold text-bg" : "text-light"}`}>Mano de obra</Text>
            </Pressable>
            <Pressable
              onPress={() => update(item.key, { type: "part" })}
              className={`flex-1 items-center rounded-md py-2 ${item.type === "part" ? "bg-accent" : "border border-border bg-surface"}`}
            >
              <Text className={`text-xs ${item.type === "part" ? "font-semibold text-bg" : "text-light"}`}>Repuesto</Text>
            </Pressable>
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Input
                placeholder="Cantidad"
                keyboardType="numeric"
                value={String(item.quantity)}
                onChangeText={(v) => update(item.key, { quantity: Number(v) || 0 })}
              />
            </View>
            <View className="flex-1">
              <Input
                placeholder="Precio"
                keyboardType="numeric"
                value={String(item.unitPrice)}
                onChangeText={(v) => update(item.key, { unitPrice: Number(v) || 0 })}
              />
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-muted">{formatMoney(item.quantity * item.unitPrice)}</Text>
            <Button size="sm" variant="danger" onPress={() => remove(item.key)}>
              Quitar
            </Button>
          </View>
        </View>
      ))}

      <Button size="sm" variant="secondary" onPress={addItem}>
        + Agregar ítem
      </Button>

      <View className="flex-row items-center justify-between border-t border-border pt-3">
        <Text className="font-semibold text-light">
          Total: <Text className="text-accent">{formatMoney(total)}</Text>
        </Text>
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1">
          <Button variant="secondary" disabled={!valid || saving} loading={saving} onPress={() => onSave(strip(items))}>
            {saveLabel}
          </Button>
        </View>
        {onFinalize && (
          <View className="flex-1">
            <Button disabled={!valid || finalizing} loading={finalizing} onPress={() => onFinalize(strip(items))}>
              {finalizeLabel}
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}

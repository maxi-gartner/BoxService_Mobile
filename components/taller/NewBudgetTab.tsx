import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useCatalog } from "@/hooks/useCatalog";
import { useCreateBudget } from "@/hooks/useBudgets";
import { ApiClientError } from "@/lib/api/client";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { SelectField } from "@/components/ui/SelectField";
import { formatMoney } from "@/lib/utils";
import type { BudgetDetailRequest, Vehicle } from "@/types/entities";

type ItemRow = BudgetDetailRequest & { key: number };

let keySeq = 0;

export function NewBudgetTab({ vehicle, onCreated }: { vehicle: Vehicle; onCreated: () => void }) {
  const { data: catalog } = useCatalog();
  const createBudget = useCreateBudget();

  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemRow[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const total = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

  function addItem(preset?: { type: "labor" | "part"; description: string; unitPrice: number }) {
    keySeq += 1;
    setItems((prev) => [
      ...prev,
      {
        key: keySeq,
        type: preset?.type ?? "labor",
        description: preset?.description ?? "",
        quantity: 1,
        unitPrice: preset?.unitPrice ?? 0,
      },
    ]);
  }

  function addFromCatalog(catalogId: string) {
    const item = catalog?.find((c) => String(c.catalogId) === catalogId);
    if (!item) return;
    addItem({ type: item.type, description: item.name, unitPrice: item.price });
  }

  function updateItem(key: number, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  function removeItem(key: number) {
    setItems((prev) => prev.filter((it) => it.key !== key));
  }

  async function handleSave() {
    setMessage(null);
    if (!items.length) {
      setMessage({ type: "error", text: "Agregá al menos un ítem." });
      return;
    }

    try {
      const created = await createBudget.mutateAsync({
        vehicleId: vehicle.vehicleId,
        notes: notes || null,
        details: items.map(({ key: _key, ...rest }) => rest),
      });
      setMessage({ type: "ok", text: `Presupuesto ${created.number} creado.` });
      setItems([]);
      setNotes("");
      onCreated();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo crear el presupuesto." });
    }
  }

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-4 p-4" keyboardShouldPersistTaps="handled">
      {message && <Banner type={message.type}>{message.text}</Banner>}

      <Input label="Notas (opcional)" value={notes} onChangeText={setNotes} placeholder="Ej: revisar suspensión también" />

      <SelectField
        label="Agregar del catálogo"
        value=""
        placeholder="Elegir ítem del catálogo…"
        options={(catalog ?? []).map((c) => ({ value: String(c.catalogId), label: `${c.name} — ${formatMoney(c.price)}` }))}
        onChange={addFromCatalog}
      />
      <Button variant="secondary" size="sm" onPress={() => addItem()}>
        + Ítem manual
      </Button>

      <View className="gap-3">
        {items.map((item) => (
          <View key={item.key} className="gap-2 rounded-lg border border-border bg-surface p-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row gap-2">
                <Chip label="Mano de obra" active={item.type === "labor"} onPress={() => updateItem(item.key, { type: "labor" })} />
                <Chip label="Repuesto" active={item.type === "part"} onPress={() => updateItem(item.key, { type: "part" })} />
              </View>
              <Pressable onPress={() => removeItem(item.key)}>
                <Text className="text-danger">✕</Text>
              </Pressable>
            </View>
            <Input
              label="Descripción"
              value={item.description}
              onChangeText={(v) => updateItem(item.key, { description: v })}
            />
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Input
                  label="Cantidad"
                  keyboardType="numeric"
                  value={String(item.quantity)}
                  onChangeText={(v) => updateItem(item.key, { quantity: Number(v) || 0 })}
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Precio unitario"
                  keyboardType="decimal-pad"
                  value={String(item.unitPrice)}
                  onChangeText={(v) => updateItem(item.key, { unitPrice: Number(v) || 0 })}
                />
              </View>
            </View>
            <Text className="text-right text-sm font-bold text-accent">
              {formatMoney(item.quantity * item.unitPrice)}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row items-center justify-between border-t border-border pt-4">
        <Text className="text-xs font-bold uppercase text-muted">Total estimado</Text>
        <Text className="text-2xl font-bold text-accent">{formatMoney(total)}</Text>
      </View>

      <Button onPress={handleSave} loading={createBudget.isPending}>
        Guardar presupuesto
      </Button>
    </ScrollView>
  );
}

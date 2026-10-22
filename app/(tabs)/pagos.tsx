import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { usePaymentsOverview } from "@/hooks/usePayments";
import { useTenants, useRecordPayment } from "@/hooks/useTenants";
import { ApiClientError } from "@/lib/api/client";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SelectField } from "@/components/ui/SelectField";
import { Screen } from "@/components/ui/Screen";
import type { TenantPaymentStatus } from "@/types/entities";

const currentPeriod = new Date().toISOString().slice(0, 7);

type Message = { type: "ok" | "error"; text: string } | null;

function formatMoney(value: number) {
  return `$${value.toLocaleString("es-AR")}`;
}

export default function PagosScreen() {
  const { data: overview, isLoading } = usePaymentsOverview();
  const { data: tenants } = useTenants();
  const recordPayment = useRecordPayment();

  const [showForm, setShowForm] = useState(false);
  const [tenantIdStr, setTenantIdStr] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState(currentPeriod);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<Message>(null);

  async function handleSubmit() {
    if (!tenantIdStr || !amount.trim() || Number(amount) <= 0) {
      setMessage({ type: "error", text: "Elegí un taller e ingresá un monto válido." });
      return;
    }
    setMessage(null);
    try {
      await recordPayment.mutateAsync({
        tenantId: Number(tenantIdStr),
        data: { amount: Number(amount), period, notes: notes.trim() || undefined },
      });
      setMessage({ type: "ok", text: "Pago registrado." });
      setAmount("");
      setNotes("");
      setShowForm(false);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo registrar el pago." });
    }
  }

  return (
    <Screen>
      <View className="flex-row items-center justify-between border-b border-border bg-surface px-4 py-3">
        <Text className="text-lg font-bold text-light">Pagos</Text>
        <Pressable onPress={() => setShowForm((v) => !v)}>
          <Text className="text-sm text-accent">{showForm ? "Cancelar" : "+ Registrar"}</Text>
        </Pressable>
      </View>

      <FlatList
        className="flex-1"
        contentContainerClassName="gap-3 p-4"
        keyboardShouldPersistTaps="handled"
        data={overview ?? []}
        keyExtractor={(t) => String(t.tenantId)}
        ListHeaderComponent={
          <View className="mb-1 gap-3">
            {showForm && (
              <View className="gap-3 rounded-lg border border-border bg-surface p-4">
                <SelectField
                  label="Taller"
                  value={tenantIdStr}
                  options={tenants?.map((t) => ({ value: String(t.tenantId), label: t.name })) ?? []}
                  placeholder="Elegí un taller"
                  onChange={setTenantIdStr}
                />
                <Input placeholder="Monto" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                <Input placeholder="Período (AAAA-MM)" value={period} onChangeText={setPeriod} />
                <Input placeholder="Notas (opcional)" value={notes} onChangeText={setNotes} />
                <Button onPress={handleSubmit} loading={recordPayment.isPending}>
                  Registrar pago
                </Button>
              </View>
            )}
            {message && <Banner type={message.type}>{message.text}</Banner>}
            {!showForm && <Text className="text-xs text-muted">Estado de pago — {currentPeriod}</Text>}
          </View>
        }
        ListEmptyComponent={
          <Text className="mt-8 text-center text-sm text-muted">{isLoading ? "Cargando..." : "No hay talleres todavía."}</Text>
        }
        renderItem={({ item }: { item: TenantPaymentStatus }) => (
          <View className="gap-1 rounded-lg border border-border bg-surface p-4">
            <Text className="font-semibold text-light">{item.tenantName}</Text>
            <Text className={`text-xs ${item.paidCurrentPeriod ? "text-success" : "text-danger"}`}>
              {item.paidCurrentPeriod ? "Pagado este mes" : "Pendiente este mes"}
            </Text>
            {item.lastAmount != null && (
              <Text className="text-xs text-muted">
                Último pago: {formatMoney(item.lastAmount)} · {item.lastPeriod} ({item.lastPaymentDate})
              </Text>
            )}
          </View>
        )}
      />
    </Screen>
  );
}

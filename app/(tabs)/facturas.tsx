import { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import { useInvoices } from "@/hooks/useInvoices";
import { useServices } from "@/hooks/useServices";
import { useVehicles } from "@/hooks/useVehicles";
import { Badge } from "@/components/ui/Badge";
import { Screen } from "@/components/ui/Screen";
import { formatDate, formatMoney } from "@/lib/utils";

export default function FacturasScreen() {
  const { data: invoices, isLoading } = useInvoices();
  const { data: services } = useServices();
  const { data: vehicles } = useVehicles();

  const vehicleByService = useMemo(() => {
    const vById = new Map((vehicles ?? []).map((v) => [v.vehicleId, v]));
    const map = new Map<number, string>();
    for (const s of services ?? []) {
      const v = vById.get(s.vehicleId);
      map.set(s.serviceId, v ? `${v.plate} — ${v.brand} ${v.model}` : `Service #${s.serviceId}`);
    }
    return map;
  }, [services, vehicles]);

  const rows = (invoices ?? []).slice().sort((a, b) => b.invoiceId - a.invoiceId);

  return (
    <Screen>
      <FlatList
        className="flex-1"
        contentContainerClassName="gap-3 p-4"
        data={rows}
        keyExtractor={(i) => String(i.invoiceId)}
        ListHeaderComponent={
          <View className="mb-1 rounded-lg border border-accent/40 bg-accent-dim p-3">
            <Text className="text-sm text-accent">
              Emitir y cobrar facturas desde la app está próximamente. Acá ya podés ver las que emitió el
              taller. Para dejar un comprobante de un trabajo, usá “Comprobante” desde Taller.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text className="mt-8 text-center text-sm text-muted">
            {isLoading ? "Cargando..." : "Todavía no hay facturas."}
          </Text>
        }
        renderItem={({ item }) => (
          <View className="gap-1.5 rounded-lg border border-border bg-surface p-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-semibold text-accent">{item.number}</Text>
              <Badge status={item.status} />
            </View>
            <Text className="text-sm text-light">{vehicleByService.get(item.serviceId) ?? `Service #${item.serviceId}`}</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-muted">{formatDate(item.date)}</Text>
              <Text className="font-bold text-light">{formatMoney(item.total)}</Text>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}

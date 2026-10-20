import { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useInvoices } from "@/hooks/useInvoices";
import { useServices } from "@/hooks/useServices";
import { useVehicles } from "@/hooks/useVehicles";
import { useClients } from "@/hooks/useClients";
import { budgetsApi } from "@/lib/api/budgets";
import { ApiClientError } from "@/lib/api/client";
import { printFactura } from "@/lib/pdf";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { formatDate, formatMoney } from "@/lib/utils";
import type { Invoice, Service, Vehicle } from "@/types/entities";

export default function FacturasScreen() {
  const { data: invoices, isLoading } = useInvoices();
  const { data: services } = useServices();
  const { data: vehicles } = useVehicles();
  const { data: clients } = useClients();

  const [printingId, setPrintingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const servicesById = useMemo(() => new Map((services ?? []).map((s) => [s.serviceId, s])), [services]);
  const vehiclesById = useMemo(() => new Map((vehicles ?? []).map((v) => [v.vehicleId, v])), [vehicles]);
  const clientsById = useMemo(() => new Map((clients ?? []).map((c) => [c.clientId, c])), [clients]);

  const vehicleByService = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of services ?? []) {
      const v = vehiclesById.get(s.vehicleId);
      map.set(s.serviceId, v ? `${v.plate} — ${v.brand} ${v.model}` : `Service #${s.serviceId}`);
    }
    return map;
  }, [services, vehiclesById]);

  async function handlePrint(invoice: Invoice) {
    const service: Service | undefined = servicesById.get(invoice.serviceId);
    const vehicle: Vehicle | undefined = service ? vehiclesById.get(service.vehicleId) : undefined;
    const client = vehicle ? clientsById.get(vehicle.clientId) : undefined;
    if (!service || !vehicle || !client) {
      setError("Todavía se están cargando los datos del service — probá de nuevo en un segundo.");
      return;
    }

    setError(null);
    setPrintingId(invoice.invoiceId);
    try {
      const budget = invoice.budgetId ? await budgetsApi.getById(invoice.budgetId) : null;
      await printFactura({
        number: invoice.number,
        status: invoice.status,
        date: invoice.date,
        client,
        vehicle,
        total: invoice.total,
        serviceId: invoice.serviceId,
        serviceType: service.serviceType,
        budgetDetails: budget?.details,
      });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "No se pudo generar el PDF.");
    } finally {
      setPrintingId(null);
    }
  }

  const rows = (invoices ?? []).slice().sort((a, b) => b.invoiceId - a.invoiceId);

  return (
    <Screen>
      <FlatList
        className="flex-1"
        contentContainerClassName="gap-3 p-4"
        data={rows}
        keyExtractor={(i) => String(i.invoiceId)}
        ListHeaderComponent={
          <View className="mb-1 gap-3">
            <View className="rounded-lg border border-accent/40 bg-accent-dim p-3">
              <Text className="text-sm text-accent">
                Emitir y cobrar facturas desde la app está próximamente. Acá ya podés ver las que emitió el
                taller. Para dejar un comprobante de un trabajo, usá “Comprobante” desde Taller.
              </Text>
            </View>
            {error && <Banner type="error">{error}</Banner>}
          </View>
        }
        ListEmptyComponent={
          <Text className="mt-8 text-center text-sm text-muted">
            {isLoading ? "Cargando..." : "Todavía no hay facturas."}
          </Text>
        }
        renderItem={({ item }) => (
          <View className="gap-2 rounded-lg border border-border bg-surface p-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-semibold text-accent">{item.number}</Text>
              <Badge status={item.status} />
            </View>
            <Text className="text-sm text-light">{vehicleByService.get(item.serviceId) ?? `Service #${item.serviceId}`}</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-muted">{formatDate(item.date)}</Text>
              <Text className="font-bold text-light">{formatMoney(item.total)}</Text>
            </View>
            <Button size="sm" variant="secondary" disabled={printingId === item.invoiceId} onPress={() => handlePrint(item)}>
              {printingId === item.invoiceId ? "Generando..." : "Imprimir / PDF"}
            </Button>
          </View>
        )}
      />
    </Screen>
  );
}

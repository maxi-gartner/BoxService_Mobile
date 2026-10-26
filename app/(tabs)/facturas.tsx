import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useInvoices } from "@/hooks/useInvoices";
import { usePagedItems } from "@/hooks/usePagedItems";
import { servicesApi } from "@/lib/api/services";
import { vehiclesApi } from "@/lib/api/vehicles";
import { clientsApi } from "@/lib/api/clients";
import { budgetsApi } from "@/lib/api/budgets";
import { ApiClientError } from "@/lib/api/client";
import { printFactura } from "@/lib/pdf";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { formatDate, formatMoney } from "@/lib/utils";
import type { Invoice } from "@/types/entities";

export default function FacturasScreen() {
  const [page, setPage] = useState(1);
  const { data: invoicesPage, isLoading, isFetching } = useInvoices({ page, pageSize: 20 });
  const rows = usePagedItems(invoicesPage);
  const canLoadMore = !!invoicesPage && invoicesPage.page < invoicesPage.totalPages;

  const [printingId, setPrintingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Antes esta pantalla bajaba TODOS los services, vehículos y clientes
  // del tenant solo para poder resolverlos al imprimir — ahora se piden
  // uno por uno, recién al tocar "Imprimir", igual que ya se hacía con
  // el presupuesto (budgetsApi.getById).
  async function handlePrint(invoice: Invoice) {
    setError(null);
    setPrintingId(invoice.invoiceId);
    try {
      const service = await servicesApi.getById(invoice.serviceId);
      const vehicle = await vehiclesApi.getById(service.vehicleId);
      const client = await clientsApi.getById(vehicle.clientId);
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
            <Text className="text-sm text-light">
              {item.vehiclePlate ? `${item.vehiclePlate} — ${item.vehicleBrand} ${item.vehicleModel}` : `Service #${item.serviceId}`}
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-muted">{formatDate(item.date)}</Text>
              <Text className="font-bold text-light">{formatMoney(item.total)}</Text>
            </View>
            <Button size="sm" variant="secondary" disabled={printingId === item.invoiceId} onPress={() => handlePrint(item)}>
              {printingId === item.invoiceId ? "Generando..." : "Imprimir / PDF"}
            </Button>
          </View>
        )}
        ListFooterComponent={
          canLoadMore ? (
            <View className="mt-1">
              <Button variant="secondary" loading={isFetching} onPress={() => setPage((p) => p + 1)}>
                Cargar más
              </Button>
            </View>
          ) : null
        }
      />
    </Screen>
  );
}

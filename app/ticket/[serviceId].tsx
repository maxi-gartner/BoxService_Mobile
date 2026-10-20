import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Share, Text, View } from "react-native";
import { clientsApi } from "@/lib/api/clients";
import { servicesApi } from "@/lib/api/services";
import { vehiclesApi } from "@/lib/api/vehicles";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { formatDate } from "@/lib/utils";

/**
 * Comprobante de trabajo — no es una factura (eso sigue "Próximamente" en
 * mobile, ver app/(tabs)/facturas.tsx). Es el mismo documento que genera
 * la web en /ticket: deja constancia de lo que se hizo, no de un cobro.
 * No depende de que el service esté facturado.
 */
export default function TicketScreen() {
  const { serviceId: serviceIdParam } = useLocalSearchParams<{ serviceId: string }>();
  const serviceId = Number(serviceIdParam);

  const { data: service } = useQuery({
    queryKey: ["services", serviceId],
    queryFn: () => servicesApi.getById(serviceId),
    enabled: !!serviceId,
  });
  const { data: details } = useQuery({
    queryKey: ["services", serviceId, "details"],
    queryFn: () => servicesApi.getDetails(serviceId),
    enabled: !!serviceId,
  });
  const { data: vehicle } = useQuery({
    queryKey: ["vehicles", service?.vehicleId],
    queryFn: () => vehiclesApi.getById(service!.vehicleId),
    enabled: !!service,
  });
  const { data: client } = useQuery({
    queryKey: ["clients", vehicle?.clientId],
    queryFn: () => clientsApi.getById(vehicle!.clientId),
    enabled: !!vehicle,
  });

  if (!service || !vehicle || !client) {
    return (
      <Screen>
        <Text className="mt-20 text-center text-muted">Cargando...</Text>
      </Screen>
    );
  }

  const lines = [
    `Fecha: ${formatDate(service.date)}`,
    `Cliente: ${client.name}`,
    `Vehículo: ${vehicle.brand} ${vehicle.model}`,
    `Patente: ${vehicle.plate}`,
    `Kilometraje: ${service.mileage}`,
    `Tipo de service: ${service.serviceType}`,
    "",
    "Detalle del trabajo:",
    ...(details?.length ? details.map((d) => `• ${d.description}`) : ["Sin detalle cargado."]),
    "",
    `Service #${service.serviceId} — generado desde BoxService`,
  ];

  async function handleShare() {
    await Share.share({
      message: `Comprobante de trabajo — no válido como factura\n\n${lines.join("\n")}`,
    });
  }

  const row = (label: string, value: string) => (
    <View className="flex-row justify-between border-b border-border-light py-2">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="text-sm text-light">{value}</Text>
    </View>
  );

  return (
    <Screen>
      <View className="flex-1 gap-4 p-4">
        <View className="gap-4 rounded-xl border border-border bg-surface p-5">
          <View className="items-center gap-1 border-b border-dashed border-border pb-4">
            <Text className="text-xl font-bold text-accent">⚙ BoxService</Text>
            <Text className="text-xs uppercase tracking-wide text-muted">
              Comprobante de trabajo — no válido como factura
            </Text>
          </View>

          {row("Fecha", formatDate(service.date))}
          {row("Cliente", client.name)}
          {row("Vehículo", `${vehicle.brand} ${vehicle.model}`)}
          {row("Patente", vehicle.plate)}
          {row("Kilometraje", String(service.mileage))}
          {row("Tipo de service", service.serviceType)}

          <View className="gap-1 pt-2">
            <Text className="font-bold text-light">Detalle del trabajo</Text>
            {details?.length ? (
              details.map((d) => (
                <Text key={d.detailId} className="text-sm text-light">
                  • {d.description}
                </Text>
              ))
            ) : (
              <Text className="text-sm text-muted">Sin detalle cargado.</Text>
            )}
          </View>

          <Text className="border-t border-dashed border-border pt-3 text-center text-xs text-muted">
            Service #{service.serviceId} — generado desde BoxService
          </Text>
        </View>

        <Button onPress={handleShare}>Compartir comprobante</Button>
      </View>
    </Screen>
  );
}

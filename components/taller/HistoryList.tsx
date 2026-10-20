import { FlatList, Text, View } from "react-native";
import { useVehicleHistory } from "@/hooks/useVehicles";
import { formatDate } from "@/lib/utils";
import type { Vehicle } from "@/types/entities";

export function HistoryList({ vehicle }: { vehicle: Vehicle }) {
  const { data: history, isLoading } = useVehicleHistory(vehicle.vehicleId);

  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="gap-3 p-4"
      data={history ?? []}
      keyExtractor={(s) => String(s.serviceId)}
      ListEmptyComponent={
        <Text className="mt-8 text-center text-sm text-muted">
          {isLoading ? "Cargando..." : "Este vehículo todavía no tiene services registrados."}
        </Text>
      }
      renderItem={({ item: s }) => (
        <View className="gap-1.5 rounded-lg border border-border bg-surface p-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold text-light">{s.serviceType}</Text>
            <Text className="text-xs text-muted">{formatDate(s.date)}</Text>
          </View>
          <Text className="text-sm text-muted">{s.mileage.toLocaleString("es-AR")} km</Text>
          {s.notes ? <Text className="text-sm text-muted">{s.notes}</Text> : null}
          {(s.nextMileage || s.nextDate) && (
            <Text className="text-xs text-accent">
              Próximo: {s.nextMileage ? `${s.nextMileage.toLocaleString("es-AR")} km` : ""}
              {s.nextMileage && s.nextDate ? " · " : ""}
              {s.nextDate ? formatDate(s.nextDate) : ""}
            </Text>
          )}
        </View>
      )}
    />
  );
}

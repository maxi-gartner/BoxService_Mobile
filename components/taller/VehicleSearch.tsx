import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useVehicles } from "@/hooks/useVehicles";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePagedItems } from "@/hooks/usePagedItems";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Vehicle } from "@/types/entities";

export function VehicleSearch({ onSelect }: { onSelect: (vehicle: Vehicle) => void }) {
  const [page, setPage] = useState(1);
  const [term, setTerm] = useState("");
  const debouncedTerm = useDebouncedValue(term);
  // Búsqueda server-side (patente/marca/modelo/cliente, ver
  // VehicleRepository.GetPaged) — antes esto bajaba TODOS los vehículos
  // del tenant para filtrar acá en el dispositivo.
  const { data: vehiclesPage, isLoading, isFetching } = useVehicles({ page, pageSize: 20, search: debouncedTerm || undefined });
  const vehicles = usePagedItems(vehiclesPage);
  const canLoadMore = !!vehiclesPage && vehiclesPage.page < vehiclesPage.totalPages;

  // Reset de página al cambiar el buscador — ajuste de estado durante el
  // render (patrón recomendado por React), no un efecto.
  const [termForPage, setTermForPage] = useState(debouncedTerm);
  if (debouncedTerm !== termForPage) {
    setTermForPage(debouncedTerm);
    setPage(1);
  }

  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="p-4 gap-3"
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View className="mb-3">
          <Input
            label="Buscar cliente / vehículo"
            placeholder="Ej: ABC123 · Juan Pérez · Toyota"
            value={term}
            onChangeText={setTerm}
            autoCapitalize="none"
          />
        </View>
      }
      data={vehicles}
      keyExtractor={(v) => String(v.vehicleId)}
      ListEmptyComponent={
        <Text className="mt-8 text-center text-sm text-muted">
          {isLoading ? "Cargando..." : "No se encontraron vehículos."}
        </Text>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onSelect(item)}
          className="mb-3 flex-row items-center justify-between rounded-lg border border-border bg-surface p-4"
        >
          <View className="flex-1 gap-0.5">
            <Text className="font-semibold text-light">
              {item.brand} {item.model}
            </Text>
            <Text className="text-sm text-accent">{item.plate}</Text>
            <Text className="text-xs text-muted">{item.clientName ?? `Cliente #${item.clientId}`}</Text>
          </View>
          <Text className="text-xl text-muted">›</Text>
        </Pressable>
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
  );
}

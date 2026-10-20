import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useClients } from "@/hooks/useClients";
import { useVehicles } from "@/hooks/useVehicles";
import { Input } from "@/components/ui/Input";
import type { Vehicle } from "@/types/entities";

export function VehicleSearch({ onSelect }: { onSelect: (vehicle: Vehicle) => void }) {
  const [term, setTerm] = useState("");
  const { data: vehicles, isLoading } = useVehicles();
  const { data: clients } = useClients();

  const clientsById = useMemo(() => {
    const map = new Map<number, string>();
    clients?.forEach((c) => map.set(c.clientId, c.name));
    return map;
  }, [clients]);

  const filtered = useMemo(() => {
    if (!vehicles) return [];
    const words = term.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!words.length) return vehicles;
    return vehicles.filter((v) => {
      const haystack = `${clientsById.get(v.clientId) ?? ""} ${v.plate} ${v.brand} ${v.model}`.toLowerCase();
      return words.every((w) => haystack.includes(w));
    });
  }, [vehicles, term, clientsById]);

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
      data={filtered}
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
            <Text className="text-xs text-muted">{clientsById.get(item.clientId) ?? `Cliente #${item.clientId}`}</Text>
          </View>
          <Text className="text-xl text-muted">›</Text>
        </Pressable>
      )}
    />
  );
}

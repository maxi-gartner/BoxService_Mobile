import { useQuery } from "@tanstack/react-query";
import { Pressable, ScrollView, Text, View } from "react-native";
import { clientsApi } from "@/lib/api/clients";
import { Button } from "@/components/ui/Button";
import type { Vehicle } from "@/types/entities";

export type TallerSection = "resumen" | "presupuestos" | "historial";

const SECTIONS: { id: TallerSection; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "presupuestos", label: "Presupuestos" },
  { id: "historial", label: "Historial" },
];

export function VehicleWorkspaceHeader({
  vehicle,
  section,
  onChangeSection,
  onChangeVehicle,
  onNewBudget,
  onNewService,
}: {
  vehicle: Vehicle;
  section: TallerSection;
  onChangeSection: (section: TallerSection) => void;
  onChangeVehicle: () => void;
  onNewBudget: () => void;
  onNewService: () => void;
}) {
  const { data: client } = useQuery({
    queryKey: ["clients", vehicle.clientId],
    queryFn: () => clientsApi.getById(vehicle.clientId),
  });

  return (
    <View className="border-b border-border bg-surface px-4 pt-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-0.5">
          <Text className="text-lg font-bold text-light">
            {vehicle.brand} {vehicle.model}
          </Text>
          <Text className="text-sm text-accent">{vehicle.plate}</Text>
          <Text className="text-xs text-muted">
            {client?.name ?? `Cliente #${vehicle.clientId}`} · {vehicle.currentMileage.toLocaleString("es-AR")} km
          </Text>
        </View>
        <Pressable onPress={onChangeVehicle}>
          <Text className="text-xs text-muted">Cambiar</Text>
        </Pressable>
      </View>

      <View className="mt-3 flex-row gap-2">
        <View className="flex-1">
          <Button size="sm" variant="secondary" onPress={onNewBudget}>
            + Presupuesto
          </Button>
        </View>
        <View className="flex-1">
          <Button size="sm" onPress={onNewService}>
            + Service
          </Button>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
        <View className="flex-row gap-1">
          {SECTIONS.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => onChangeSection(s.id)}
              className={`border-b-2 px-3 py-2.5 ${section === s.id ? "border-accent" : "border-transparent"}`}
            >
              <Text className={`text-sm ${section === s.id ? "font-semibold text-accent" : "text-muted"}`}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

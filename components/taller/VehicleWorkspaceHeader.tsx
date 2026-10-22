import { useQuery } from "@tanstack/react-query";
import { Pressable, ScrollView, Text, View } from "react-native";
import { clientsApi } from "@/lib/api/clients";
import type { Vehicle } from "@/types/entities";

export type TallerSection = "resumen" | "presupuestos" | "historial" | "nuevo-presupuesto" | "nuevo-service";

const SECTIONS: { id: TallerSection; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "presupuestos", label: "Presupuestos" },
  { id: "historial", label: "Historial" },
];

// Mismos tabs que SECTIONS (misma barra, mismo resaltado) en vez de
// botones aparte arriba — armar un presupuesto se ve como "entrar a
// otra sección", no como una acción fuera de lugar.
const ACTIONS: { id: TallerSection; label: string }[] = [
  { id: "nuevo-presupuesto", label: "+ Presupuesto" },
  { id: "nuevo-service", label: "+ Service" },
];

export function VehicleWorkspaceHeader({
  vehicle,
  section,
  onChangeSection,
  onChangeVehicle,
}: {
  vehicle: Vehicle;
  section: TallerSection;
  onChangeSection: (section: TallerSection) => void;
  onChangeVehicle: () => void;
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
        <View className="flex-row gap-1">
          {[...SECTIONS, ...ACTIONS].map((s) => (
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

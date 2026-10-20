import { ScrollView, Text, View } from "react-native";
import { useBudgets } from "@/hooks/useBudgets";
import { useServices } from "@/hooks/useServices";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { Vehicle } from "@/types/entities";

export function VehicleOverview({ vehicle }: { vehicle: Vehicle }) {
  const { data: budgets = [], isLoading: loadingBudgets } = useBudgets();
  const { data: services = [], isLoading: loadingServices } = useServices();

  const vehicleBudgets = budgets.filter((b) => b.vehicleId === vehicle.vehicleId);
  const vehicleServices = services
    .filter((s) => s.vehicleId === vehicle.vehicleId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const pendingBudgets = vehicleBudgets.filter((b) => b.status === "draft" || b.status === "sent").length;
  const latestService = vehicleServices[0];
  const loading = loadingBudgets || loadingServices;

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-4 p-4">
      <View className="flex-row gap-3">
        <Card className="flex-1 items-center gap-1">
          <Text className="text-2xl font-bold text-accent">{loading ? "…" : pendingBudgets}</Text>
          <Text className="text-center text-xs text-muted">Presupuestos pendientes</Text>
        </Card>
        <Card className="flex-1 items-center gap-1">
          <Text className="text-2xl font-bold text-light">{loading ? "…" : vehicleServices.length}</Text>
          <Text className="text-center text-xs text-muted">Services realizados</Text>
        </Card>
      </View>

      <Card className="gap-2">
        <Text className="font-semibold text-light">Próximo mantenimiento</Text>
        {latestService ? (
          <>
            <Text className="text-xl font-bold text-accent">
              {latestService.nextMileage?.toLocaleString("es-AR") ?? "Sin definir"}
              {latestService.nextMileage ? " km" : ""}
            </Text>
            <Text className="text-sm text-muted">Próxima fecha: {formatDate(latestService.nextDate)}</Text>
          </>
        ) : (
          <Text className="text-sm text-muted">Registrá el primer service para calcular el próximo mantenimiento.</Text>
        )}
      </Card>
    </ScrollView>
  );
}

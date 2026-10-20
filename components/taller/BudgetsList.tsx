import { useState } from "react";
import { Alert as NativeAlert, FlatList, Text, View } from "react-native";
import { useAssignServiceToBudget, useBudgets, useUpdateBudgetStatus } from "@/hooks/useBudgets";
import { useCreateService, useCreateServiceDetail } from "@/hooks/useServices";
import { budgetsApi } from "@/lib/api/budgets";
import { ApiClientError } from "@/lib/api/client";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { Budget, Vehicle } from "@/types/entities";

function isCompleted(b: Budget) {
  return b.status === "completed" || (b.status === "approved" && !!b.serviceId);
}

export function BudgetsList({ vehicle }: { vehicle: Vehicle }) {
  const { data: budgets, isLoading } = useBudgets();
  const updateStatus = useUpdateBudgetStatus();
  const assignService = useAssignServiceToBudget();
  const createService = useCreateService();
  const createServiceDetail = useCreateServiceDetail();

  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [workingId, setWorkingId] = useState<number | null>(null);

  const mine = (budgets ?? []).filter((b) => b.vehicleId === vehicle.vehicleId);

  async function handleApprove(id: number) {
    setWorkingId(id);
    try {
      await updateStatus.mutateAsync({ id, status: "approved" });
      setMessage({ type: "ok", text: "Presupuesto aprobado." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo aprobar." });
    } finally {
      setWorkingId(null);
    }
  }

  function confirmReject(id: number, isCancel: boolean) {
    NativeAlert.alert(
      isCancel ? "Cancelar trabajo" : "Rechazar presupuesto",
      isCancel ? "¿Cancelar este trabajo? El presupuesto queda como rechazado." : "¿Rechazar este presupuesto?",
      [
        { text: "No", style: "cancel" },
        { text: "Sí", style: "destructive", onPress: () => handleReject(id, isCancel) },
      ],
    );
  }

  async function handleReject(id: number, isCancel: boolean) {
    setWorkingId(id);
    try {
      await updateStatus.mutateAsync({ id, status: "rejected" });
      setMessage({ type: "ok", text: isCancel ? "Trabajo cancelado." : "Presupuesto rechazado." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo actualizar." });
    } finally {
      setWorkingId(null);
    }
  }

  async function handleGenerateService(budget: Budget) {
    setWorkingId(budget.budgetId);
    try {
      let mileage = vehicle.currentMileage;
      if (!mileage || mileage <= 0) {
        setMessage({ type: "error", text: "Cargá el kilometraje actual del vehículo antes de generar el service." });
        return;
      }

      const detail = await budgetsApi.getById(budget.budgetId);
      const descriptions = detail.details.map((d) => d.description).filter((d) => d.length > 0);
      if (!descriptions.length) throw new Error("El presupuesto no tiene detalles para cargar en el service.");

      const service = await createService.mutateAsync({
        vehicleId: budget.vehicleId,
        date: new Date().toISOString().slice(0, 10),
        mileage,
        serviceType: "Service desde presupuesto",
        notes: `Generado desde presupuesto ${budget.number}.`,
      });

      for (const description of descriptions) {
        await createServiceDetail.mutateAsync({ serviceId: service.serviceId, data: { description, done: true } });
      }

      await assignService.mutateAsync({ budgetId: budget.budgetId, serviceId: service.serviceId });
      setMessage({ type: "ok", text: "Service creado correctamente desde el presupuesto aprobado." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "No se pudo generar el service." });
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="gap-3 p-4"
      data={mine}
      keyExtractor={(b) => String(b.budgetId)}
      ListHeaderComponent={message ? <Banner type={message.type}>{message.text}</Banner> : null}
      ListEmptyComponent={
        <Text className="mt-8 text-center text-sm text-muted">
          {isLoading ? "Cargando..." : "Este vehículo todavía no tiene presupuestos."}
        </Text>
      }
      renderItem={({ item: b }) => {
        const completed = isCompleted(b);
        const busy = workingId === b.budgetId;

        return (
          <View className="gap-3 rounded-lg border border-border bg-surface p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-semibold text-accent">{b.number}</Text>
                <Text className="text-xs text-muted">{formatDate(b.date)}</Text>
              </View>
              <Badge status={completed ? "completed" : b.status} />
            </View>

            {(b.status === "draft" || b.status === "sent") && (
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Button size="sm" disabled={busy} onPress={() => handleApprove(b.budgetId)}>
                    Aprobar
                  </Button>
                </View>
                <View className="flex-1">
                  <Button size="sm" variant="danger" disabled={busy} onPress={() => confirmReject(b.budgetId, false)}>
                    Rechazar
                  </Button>
                </View>
              </View>
            )}

            {b.status === "approved" && !completed && (
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Button size="sm" disabled={busy} onPress={() => handleGenerateService(b)}>
                    Trabajo realizado
                  </Button>
                </View>
                <View className="flex-1">
                  <Button size="sm" variant="danger" disabled={busy} onPress={() => confirmReject(b.budgetId, true)}>
                    Cancelar
                  </Button>
                </View>
              </View>
            )}
          </View>
        );
      }}
    />
  );
}

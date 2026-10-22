import { useState } from "react";
import { Alert as NativeAlert, FlatList, Text, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  useAssignServiceToBudget,
  useBudget,
  useBudgets,
  useUpdateBudgetDetails,
  useUpdateBudgetStatus,
} from "@/hooks/useBudgets";
import { useCreateService, useCreateServiceDetail } from "@/hooks/useServices";
import { budgetsApi } from "@/lib/api/budgets";
import { clientsApi } from "@/lib/api/clients";
import { ApiClientError } from "@/lib/api/client";
import { printPresupuesto } from "@/lib/pdf";
import { BudgetDetailsEditor } from "@/components/taller/BudgetDetailsEditor";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { Budget, BudgetDetailRequest, Vehicle } from "@/types/entities";

type Message = { type: "ok" | "error"; text: string } | null;

function isCompleted(b: Budget) {
  return b.status === "completed" || (b.status === "approved" && !!b.serviceId);
}

function EditablePanel({ budgetId, canFinalize, onSave, onFinalize, busy }: {
  budgetId: number;
  canFinalize: boolean;
  onSave: (budgetId: number, details: BudgetDetailRequest[]) => void;
  onFinalize: (budgetId: number, details: BudgetDetailRequest[]) => void;
  busy: boolean;
}) {
  const { data, isLoading } = useBudget(budgetId);
  return (
    <View className="gap-3 rounded-lg border border-border bg-surface-2 p-3">
      {isLoading && <Text className="text-sm text-muted">Cargando ítems...</Text>}
      {data && (
        <BudgetDetailsEditor
          details={data.details}
          saving={busy}
          onSave={(details) => onSave(budgetId, details)}
          onFinalize={canFinalize ? (details) => onFinalize(budgetId, details) : undefined}
          finalizing={busy}
        />
      )}
    </View>
  );
}

export function BudgetsList({ vehicle }: { vehicle: Vehicle }) {
  const { data: budgets, isLoading } = useBudgets();
  const { data: client } = useQuery({
    queryKey: ["clients", vehicle.clientId],
    queryFn: () => clientsApi.getById(vehicle.clientId),
  });
  const updateStatus = useUpdateBudgetStatus();
  const assignService = useAssignServiceToBudget();
  const createService = useCreateService();
  const createServiceDetail = useCreateServiceDetail();
  const updateDetails = useUpdateBudgetDetails();

  const [message, setMessage] = useState<Message>(null);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [printingId, setPrintingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

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

  async function handlePrint(b: Budget) {
    if (!client) return;
    setPrintingId(b.budgetId);
    try {
      const detail = await budgetsApi.getById(b.budgetId);
      await printPresupuesto({
        number: b.number,
        status: b.status,
        date: b.date,
        client,
        vehicle,
        details: detail.details,
        total: detail.total,
        notes: b.notes,
      });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo generar el PDF." });
    } finally {
      setPrintingId(null);
    }
  }

  function handleInvoice() {
    NativeAlert.alert(
      "Facturación",
      "Emitir y cobrar facturas desde la app está próximamente. Mientras tanto, se sigue haciendo desde la web.",
    );
  }

  async function handleSaveDetails(budgetId: number, details: BudgetDetailRequest[]) {
    setWorkingId(budgetId);
    setMessage(null);
    try {
      await updateDetails.mutateAsync({ id: budgetId, details });
      setMessage({ type: "ok", text: "Presupuesto actualizado." });
      setEditingId(null);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo actualizar." });
    } finally {
      setWorkingId(null);
    }
  }

  // "Realizar trabajo": guarda los ítems (editados si hacía falta sumar
  // o sacar algo) y recién ahí genera el service — sin tener que
  // cancelar el presupuesto si algo cambió a último momento.
  async function handleFinalize(budgetId: number, details: BudgetDetailRequest[]) {
    const budget = mine.find((b) => b.budgetId === budgetId);
    if (!budget) return;

    setWorkingId(budgetId);
    setMessage(null);
    try {
      await updateDetails.mutateAsync({ id: budgetId, details });

      const mileage = vehicle.currentMileage;
      if (!mileage || mileage <= 0) {
        setMessage({ type: "error", text: "Cargá el kilometraje actual del vehículo antes de generar el service." });
        return;
      }

      const descriptions = details.map((d) => d.description).filter((d) => d.length > 0);
      if (!descriptions.length) throw new Error("El presupuesto no tiene ítems para cargar en el service.");

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
      setEditingId(null);
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
        const editable = b.status === "draft" || b.status === "sent" || (b.status === "approved" && !completed);

        return (
          <View className="gap-3 rounded-lg border border-border bg-surface p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-semibold text-accent">{b.number}</Text>
                <Text className="text-xs text-muted">{formatDate(b.date)}</Text>
              </View>
              <Badge status={completed ? "completed" : b.status} />
            </View>

            <Button
              size="sm"
              variant="secondary"
              disabled={!client || printingId === b.budgetId}
              onPress={() => handlePrint(b)}
            >
              {printingId === b.budgetId ? "Generando..." : "Imprimir / PDF"}
            </Button>

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
              <Button size="sm" variant="danger" disabled={busy} onPress={() => confirmReject(b.budgetId, true)}>
                Cancelar
              </Button>
            )}

            {editable && (
              <Button size="sm" variant="secondary" onPress={() => setEditingId(editingId === b.budgetId ? null : b.budgetId)}>
                {editingId === b.budgetId ? "Cerrar" : b.status === "approved" ? "Realizar trabajo" : "Editar"}
              </Button>
            )}

            {editingId === b.budgetId && (
              <EditablePanel
                budgetId={b.budgetId}
                canFinalize={b.status === "approved" && !completed}
                onSave={handleSaveDetails}
                onFinalize={handleFinalize}
                busy={busy}
              />
            )}

            {completed && b.serviceId && (
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Button size="sm" variant="secondary" onPress={handleInvoice}>
                    Facturar
                  </Button>
                </View>
                <View className="flex-1">
                  <Button size="sm" onPress={() => router.push(`/ticket/${b.serviceId!}`)}>
                    Comprobante
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

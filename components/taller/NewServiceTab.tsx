import { useState } from "react";
import { ScrollView } from "react-native";
import { useCreateService, useCreateServiceDetail } from "@/hooks/useServices";
import { ApiClientError } from "@/lib/api/client";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SelectField } from "@/components/ui/SelectField";
import type { Vehicle } from "@/types/entities";

const SERVICE_TYPES = [
  "Service completo",
  "Cambio de aceite",
  "Revisión general",
  "Pre-viaje",
  "Mantenimiento preventivo",
  "Otro",
];

export function NewServiceTab({ vehicle, onCreated }: { vehicle: Vehicle; onCreated: () => void }) {
  const createService = useCreateService();
  const createServiceDetail = useCreateServiceDetail();

  const [date] = useState(new Date().toISOString().slice(0, 10));
  const [mileage, setMileage] = useState(vehicle.currentMileage ? String(vehicle.currentMileage) : "");
  const [serviceType, setServiceType] = useState("");
  const [notes, setNotes] = useState("");
  const [detail, setDetail] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSubmit() {
    setMessage(null);

    if (!detail.trim()) {
      setMessage({ type: "error", text: "Tenés que completar el detalle del trabajo realizado." });
      return;
    }

    try {
      const service = await createService.mutateAsync({
        vehicleId: vehicle.vehicleId,
        date,
        mileage: Number(mileage),
        serviceType,
        notes,
      });

      const detailResult = await createServiceDetail.mutateAsync({
        serviceId: service.serviceId,
        data: { description: detail.trim(), done: true },
      });

      if (!detailResult) throw new Error("El service se creó, pero no se pudo guardar el detalle.");

      setMessage({ type: "ok", text: "Service y detalle creados correctamente." });
      setServiceType("");
      setNotes("");
      setDetail("");
      onCreated();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof ApiClientError ? err.message : err instanceof Error ? err.message : "No se pudo crear el service.",
      });
    }
  }

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-4 p-4" keyboardShouldPersistTaps="handled">
      {message && <Banner type={message.type}>{message.text}</Banner>}

      <Input label="Kilometraje" keyboardType="numeric" placeholder="Ej: 85000" value={mileage} onChangeText={setMileage} />

      <SelectField
        label="Tipo de service"
        value={serviceType}
        placeholder="Seleccionar tipo"
        options={SERVICE_TYPES.map((t) => ({ value: t, label: t }))}
        onChange={setServiceType}
      />

      <Input
        label="Observaciones"
        placeholder="Ej: Cliente viaja a Córdoba, revisar antes de salir"
        value={notes}
        onChangeText={setNotes}
      />

      <Input
        label="Detalle del trabajo realizado"
        placeholder="Ej: Cambio de aceite, filtro de aire, revisión de frenos"
        value={detail}
        onChangeText={setDetail}
      />

      <Button onPress={handleSubmit} loading={createService.isPending}>
        Crear service
      </Button>
    </ScrollView>
  );
}

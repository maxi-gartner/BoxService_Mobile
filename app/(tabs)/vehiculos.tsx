import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useClients } from "@/hooks/useClients";
import { useCreateVehicle, useVehicles } from "@/hooks/useVehicles";
import { ApiClientError } from "@/lib/api/client";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { SelectField } from "@/components/ui/SelectField";

export default function VehiculosScreen() {
  const { data: vehicles, isLoading } = useVehicles();
  const { data: clients } = useClients();
  const createVehicle = useCreateVehicle();

  const clientsById = useMemo(() => {
    const map = new Map<number, string>();
    clients?.forEach((c) => map.set(c.clientId, c.name));
    return map;
  }, [clients]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [clientId, setClientId] = useState("");
  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleCreate() {
    if (!clientId) {
      setMessage({ type: "error", text: "Elegí un cliente." });
      return;
    }
    if (!plate.trim() || !brand.trim() || !model.trim()) {
      setMessage({ type: "error", text: "Completá patente, marca y modelo." });
      return;
    }
    setMessage(null);
    try {
      const created = await createVehicle.mutateAsync({
        clientId: Number(clientId),
        plate: plate.trim().toUpperCase(),
        brand: brand.trim(),
        model: model.trim(),
        year: year ? Number(year) : null,
        currentMileage: mileage ? Number(mileage) : 0,
      });
      setMessage({ type: "ok", text: `Vehículo ${created.plate} registrado.` });
      setClientId("");
      setPlate("");
      setBrand("");
      setModel("");
      setYear("");
      setMileage("");
      setShowForm(false);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo registrar el vehículo." });
    }
  }

  const term = search.trim().toLowerCase();
  const filtered = (vehicles ?? []).filter((v) => {
    if (!term) return true;
    const clientName = clientsById.get(v.clientId) ?? "";
    return [v.plate, v.brand, v.model, clientName].join(" ").toLowerCase().includes(term);
  });

  return (
    <Screen>
      <View className="flex-row items-center justify-between border-b border-border bg-surface px-4 py-3">
        <Text className="text-lg font-bold text-light">Vehículos</Text>
        <Pressable onPress={() => setShowForm((v) => !v)}>
          <Text className="text-sm text-accent">{showForm ? "Cancelar" : "+ Nuevo"}</Text>
        </Pressable>
      </View>

      <FlatList
        className="flex-1"
        contentContainerClassName="gap-3 p-4"
        keyboardShouldPersistTaps="handled"
        data={filtered}
        keyExtractor={(v) => String(v.vehicleId)}
        ListHeaderComponent={
          <View className="mb-1 gap-3">
            {showForm && (
              <View className="gap-3 rounded-lg border border-border bg-surface p-4">
                {message && <Banner type={message.type}>{message.text}</Banner>}
                <SelectField
                  label="Cliente"
                  value={clientId}
                  placeholder="Elegí un cliente…"
                  options={(clients ?? []).map((c) => ({ value: String(c.clientId), label: c.name }))}
                  onChange={setClientId}
                />
                <Input label="Patente" placeholder="AB123CD" autoCapitalize="characters" value={plate} onChangeText={setPlate} />
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Input label="Marca" placeholder="Toyota" value={brand} onChangeText={setBrand} />
                  </View>
                  <View className="flex-1">
                    <Input label="Modelo" placeholder="Corolla" value={model} onChangeText={setModel} />
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Input label="Año" placeholder="2020" keyboardType="numeric" value={year} onChangeText={setYear} />
                  </View>
                  <View className="flex-1">
                    <Input label="Kilometraje" placeholder="55000" keyboardType="numeric" value={mileage} onChangeText={setMileage} />
                  </View>
                </View>
                <Button onPress={handleCreate} loading={createVehicle.isPending}>
                  Guardar vehículo
                </Button>
              </View>
            )}
            <Input
              placeholder="Buscar por patente, marca, modelo o cliente…"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
          </View>
        }
        ListEmptyComponent={
          <Text className="mt-8 text-center text-sm text-muted">
            {isLoading ? "Cargando..." : term ? "Ningún vehículo coincide con la búsqueda." : "No hay vehículos registrados."}
          </Text>
        }
        renderItem={({ item }) => (
          <View className="gap-1 rounded-lg border border-border bg-surface p-4">
            <Text className="font-semibold text-light">
              {item.brand} {item.model}
            </Text>
            <Text className="text-sm text-accent">{item.plate}</Text>
            <Text className="text-xs text-muted">
              {clientsById.get(item.clientId) ?? `Cliente #${item.clientId}`}
              {item.year ? ` · ${item.year}` : ""} · {item.currentMileage.toLocaleString("es-AR")} km
            </Text>
          </View>
        )}
      />
    </Screen>
  );
}

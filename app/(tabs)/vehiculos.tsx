import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useClients } from "@/hooks/useClients";
import { useCreateVehicle, useVehicles } from "@/hooks/useVehicles";
import { useVehicleBrands, useVehicleModels, useVehicleVersions } from "@/hooks/useVehicleCatalog";
import { ApiClientError } from "@/lib/api/client";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { SelectField } from "@/components/ui/SelectField";

const OTHER_BRAND = "__otra__";
const OTHER_MODEL = "__otro__";
const OTHER_VERSION = "__otra_version__";

export default function VehiculosScreen() {
  const { data: vehicles, isLoading } = useVehicles();
  const { data: clients } = useClients();
  const createVehicle = useCreateVehicle();

  const clientsById = useMemo(() => {
    const map = new Map<number, string>();
    clients?.forEach((c) => map.set(c.clientId, c.name));
    return map;
  }, [clients]);

  const { data: brands } = useVehicleBrands();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [clientId, setClientId] = useState("");
  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState(false);
  const [model, setModel] = useState("");
  const [customModel, setCustomModel] = useState(false);
  const [version, setVersion] = useState("");
  const [customVersion, setCustomVersion] = useState(false);
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  // Modelo y versión dependen en cascada de la marca/modelo elegidos —
  // se resuelven por nombre contra el catálogo de ArgAutos.
  const brandId = brands?.find((b) => b.name === brand)?.id ?? null;
  const { data: models } = useVehicleModels(brandId);
  const modelId = models?.find((m) => m.name === model)?.id ?? null;
  const { data: versions } = useVehicleVersions(brandId, modelId);

  function resetModelAndVersion() {
    setModel("");
    setVersion("");
    setCustomModel(false);
    setCustomVersion(false);
  }

  function handleBrandChange(value: string) {
    if (value === OTHER_BRAND) {
      setCustomBrand(true);
      setBrand("");
    } else {
      setBrand(value);
    }
    resetModelAndVersion();
  }

  function handleModelChange(value: string) {
    if (value === OTHER_MODEL) {
      setCustomModel(true);
      setModel("");
    } else {
      setModel(value);
    }
    setVersion("");
    setCustomVersion(false);
  }

  function handleVersionChange(value: string) {
    if (value === OTHER_VERSION) {
      setCustomVersion(true);
      setVersion("");
    } else {
      setVersion(value);
    }
  }

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
        version: version.trim() || undefined,
        year: year ? Number(year) : null,
        currentMileage: mileage ? Number(mileage) : 0,
      });
      setMessage({ type: "ok", text: `Vehículo ${created.plate} registrado.` });
      setClientId("");
      setPlate("");
      setBrand("");
      setCustomBrand(false);
      setModel("");
      setCustomModel(false);
      setVersion("");
      setCustomVersion(false);
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

                {customBrand || !brands?.length ? (
                  <Input label="Marca" placeholder="Toyota" value={brand} onChangeText={setBrand} />
                ) : (
                  <SelectField
                    label="Marca"
                    value={brand}
                    placeholder="Elegí una marca…"
                    options={[...brands.map((b) => ({ value: b.name, label: b.name })), { value: OTHER_BRAND, label: "Otra (escribir)…" }]}
                    onChange={handleBrandChange}
                  />
                )}
                {customBrand && (
                  <Pressable onPress={() => { setCustomBrand(false); setBrand(""); resetModelAndVersion(); }}>
                    <Text className="text-xs text-accent">Elegir de la lista</Text>
                  </Pressable>
                )}

                {customModel || !brandId || !models?.length ? (
                  <Input label="Modelo" placeholder="Corolla" value={model} onChangeText={setModel} />
                ) : (
                  <SelectField
                    label="Modelo"
                    value={model}
                    placeholder="Elegí un modelo…"
                    options={[...models.map((m) => ({ value: m.name, label: m.name })), { value: OTHER_MODEL, label: "Otro (escribir)…" }]}
                    onChange={handleModelChange}
                  />
                )}
                {customModel && brandId && !!models?.length && (
                  <Pressable onPress={() => { setCustomModel(false); setModel(""); setVersion(""); setCustomVersion(false); }}>
                    <Text className="text-xs text-accent">Elegir de la lista</Text>
                  </Pressable>
                )}

                {customVersion || !modelId || !versions?.length ? (
                  <Input label="Versión (opcional)" placeholder="XEI 1.8" value={version} onChangeText={setVersion} />
                ) : (
                  <SelectField
                    label="Versión (opcional)"
                    value={version}
                    placeholder="Sin especificar"
                    options={[...versions.map((v) => ({ value: v.name, label: v.name })), { value: OTHER_VERSION, label: "Otra (escribir)…" }]}
                    onChange={handleVersionChange}
                  />
                )}
                {customVersion && modelId && !!versions?.length && (
                  <Pressable onPress={() => { setCustomVersion(false); setVersion(""); }}>
                    <Text className="text-xs text-accent">Elegir de la lista</Text>
                  </Pressable>
                )}

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
            {!!item.version && <Text className="text-xs text-muted">{item.version}</Text>}
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

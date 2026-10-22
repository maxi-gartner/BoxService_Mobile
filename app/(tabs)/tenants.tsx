import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useCreateTenant, useSetTenantActive, useTenants } from "@/hooks/useTenants";
import { ApiClientError } from "@/lib/api/client";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import type { Tenant } from "@/types/entities";

export default function TenantsScreen() {
  const { data: tenants, isLoading } = useTenants();
  const createTenant = useCreateTenant();
  const setActive = useSetTenantActive();

  const [showForm, setShowForm] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formMessage, setFormMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [workingId, setWorkingId] = useState<number | null>(null);

  async function handleCreate() {
    if (!businessName.trim() || !ownerName.trim() || !username.trim() || !password.trim()) {
      setFormMessage({ type: "error", text: "Completá todos los campos." });
      return;
    }
    setFormMessage(null);
    try {
      const result = await createTenant.mutateAsync({
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        username: username.trim(),
        password,
      });
      setFormMessage({ type: "ok", text: `"${result.name}" creado, usuario "${result.owner.username}".` });
      setBusinessName("");
      setOwnerName("");
      setUsername("");
      setPassword("");
      setShowForm(false);
    } catch (err) {
      setFormMessage({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo crear el taller." });
    }
  }

  async function toggleActive(tenant: Tenant) {
    setWorkingId(tenant.tenantId);
    setFormMessage(null);
    try {
      await setActive.mutateAsync({ id: tenant.tenantId, active: !tenant.active });
    } catch (err) {
      setFormMessage({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo actualizar." });
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <Screen>
      <View className="flex-row items-center justify-between border-b border-border bg-surface px-4 py-3">
        <Text className="text-lg font-bold text-light">Talleres</Text>
        <Pressable onPress={() => setShowForm((v) => !v)}>
          <Text className="text-sm text-accent">{showForm ? "Cancelar" : "+ Nuevo"}</Text>
        </Pressable>
      </View>

      <FlatList
        className="flex-1"
        contentContainerClassName="gap-3 p-4"
        keyboardShouldPersistTaps="handled"
        data={tenants ?? []}
        keyExtractor={(t) => String(t.tenantId)}
        ListHeaderComponent={
          <View className="mb-1 gap-3">
            {showForm && (
              <View className="gap-3 rounded-lg border border-border bg-surface p-4">
                {formMessage && <Banner type={formMessage.type}>{formMessage.text}</Banner>}
                <Input label="Nombre del negocio" placeholder="Lubricentro Sur" value={businessName} onChangeText={setBusinessName} />
                <Input label="Nombre del dueño" placeholder="Juan Pérez" value={ownerName} onChangeText={setOwnerName} />
                <Input label="Usuario" placeholder="juan.perez" autoCapitalize="none" value={username} onChangeText={setUsername} />
                <Input label="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
                <Button onPress={handleCreate} loading={createTenant.isPending}>
                  Crear taller
                </Button>
              </View>
            )}
            {!showForm && formMessage && <Banner type={formMessage.type}>{formMessage.text}</Banner>}
          </View>
        }
        ListEmptyComponent={
          <Text className="mt-8 text-center text-sm text-muted">{isLoading ? "Cargando..." : "Todavía no hay talleres."}</Text>
        }
        renderItem={({ item }) => (
          <View className="gap-2 rounded-lg border border-border bg-surface p-4">
            <Text className="font-semibold text-light">{item.name}</Text>
            <Text className={`text-xs ${item.active ? "text-success" : "text-danger"}`}>
              {item.active ? "Activo" : "Inactivo"}
            </Text>
            <Button
              size="sm"
              variant={item.active ? "danger" : "secondary"}
              disabled={workingId === item.tenantId}
              onPress={() => toggleActive(item)}
            >
              {item.active ? "Desactivar" : "Activar"}
            </Button>
          </View>
        )}
      />
    </Screen>
  );
}

import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useCreateTenant, useSetTenantActive, useTenants, useUpdateTenantContact } from "@/hooks/useTenants";
import { ApiClientError } from "@/lib/api/client";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import type { Tenant } from "@/types/entities";

type Message = { type: "ok" | "error"; text: string } | null;

function ContactEditor({ tenant, onDone }: { tenant: Tenant; onDone: (msg: Message) => void }) {
  const updateContact = useUpdateTenantContact();
  const [telefono, setTelefono] = useState(tenant.telefono ?? "");
  const [email, setEmail] = useState(tenant.email ?? "");

  async function save() {
    try {
      await updateContact.mutateAsync({ id: tenant.tenantId, data: { telefono, email } });
      onDone({ type: "ok", text: "Contacto actualizado." });
    } catch (err) {
      onDone({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo actualizar el contacto." });
    }
  }

  return (
    <View className="gap-2 mt-2">
      <Input placeholder="Teléfono" value={telefono} onChangeText={setTelefono} />
      <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Button size="sm" loading={updateContact.isPending} onPress={save}>
            Guardar
          </Button>
        </View>
        <View className="flex-1">
          <Button size="sm" variant="secondary" onPress={() => onDone(null)}>
            Cancelar
          </Button>
        </View>
      </View>
    </View>
  );
}

export default function TenantsScreen() {
  const { data: tenants, isLoading } = useTenants();
  const createTenant = useCreateTenant();
  const setActive = useSetTenantActive();

  const [showForm, setShowForm] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [formMessage, setFormMessage] = useState<Message>(null);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [editingContactId, setEditingContactId] = useState<number | null>(null);

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
        telefono: telefono.trim() || undefined,
        email: email.trim() || undefined,
      });
      setFormMessage({ type: "ok", text: `"${result.name}" creado, usuario "${result.owner.username}".` });
      setBusinessName("");
      setOwnerName("");
      setUsername("");
      setPassword("");
      setTelefono("");
      setEmail("");
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
                <Input label="Teléfono (opcional)" placeholder="3421234567" value={telefono} onChangeText={setTelefono} />
                <Input label="Email (opcional)" placeholder="juan@taller.com" autoCapitalize="none" value={email} onChangeText={setEmail} />
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
            <Text className="text-sm text-muted">
              {item.ownerName ?? "—"}
              {item.ownerUsername ? ` (@${item.ownerUsername})` : ""}
            </Text>
            {(item.telefono || item.email) && (
              <Text className="text-xs text-muted">{[item.telefono, item.email].filter(Boolean).join(" · ")}</Text>
            )}
            <Text className={`text-xs ${item.active ? "text-success" : "text-danger"}`}>
              {item.active ? "Activo" : "Inactivo"}
            </Text>

            {editingContactId === item.tenantId ? (
              <ContactEditor
                tenant={item}
                onDone={(msg) => {
                  setEditingContactId(null);
                  if (msg) setFormMessage(msg);
                }}
              />
            ) : (
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Button size="sm" variant="secondary" onPress={() => setEditingContactId(item.tenantId)}>
                    Contacto
                  </Button>
                </View>
                <View className="flex-1">
                  <Button
                    size="sm"
                    variant={item.active ? "danger" : "secondary"}
                    disabled={workingId === item.tenantId}
                    onPress={() => toggleActive(item)}
                  >
                    {item.active ? "Desactivar" : "Activar"}
                  </Button>
                </View>
              </View>
            )}
          </View>
        )}
      />
    </Screen>
  );
}

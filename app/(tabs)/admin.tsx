import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useUsers, useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import { useSucursales, useCreateSucursal, useUpdateSucursal } from "@/hooks/useSucursales";
import { ApiClientError } from "@/lib/api/client";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import type { Sucursal, UserAccount } from "@/types/entities";

type Message = { type: "ok" | "error"; text: string } | null;

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center rounded-md py-2 ${active ? "bg-accent" : "bg-surface-2 border border-border"}`}
    >
      <Text className={`text-sm font-semibold ${active ? "text-bg" : "text-light"}`}>{label}</Text>
    </Pressable>
  );
}

function EmpleadosView() {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<Message>(null);
  const [workingId, setWorkingId] = useState<number | null>(null);

  async function handleCreate() {
    if (!name.trim() || !username.trim() || !password.trim()) {
      setMessage({ type: "error", text: "Completá todos los campos." });
      return;
    }
    setMessage(null);
    try {
      await createUser.mutateAsync({ name: name.trim(), username: username.trim(), password });
      setMessage({ type: "ok", text: `Empleado "${name.trim()}" creado.` });
      setName("");
      setUsername("");
      setPassword("");
      setShowForm(false);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo crear el empleado." });
    }
  }

  async function toggleActive(user: UserAccount) {
    setWorkingId(user.userId);
    setMessage(null);
    try {
      await updateUser.mutateAsync({ id: user.userId, data: { active: !user.active } });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo actualizar." });
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="gap-3 p-4"
      keyboardShouldPersistTaps="handled"
      data={users ?? []}
      keyExtractor={(u) => String(u.userId)}
      ListHeaderComponent={
        <View className="mb-1 gap-3">
          <Pressable onPress={() => setShowForm((v) => !v)}>
            <Text className="text-sm text-accent">{showForm ? "Cancelar" : "+ Nuevo empleado"}</Text>
          </Pressable>
          {showForm && (
            <View className="gap-3 rounded-lg border border-border bg-surface p-4">
              <Input label="Nombre" placeholder="Carlos López" value={name} onChangeText={setName} />
              <Input label="Usuario" placeholder="carlos.lopez" autoCapitalize="none" value={username} onChangeText={setUsername} />
              <Input label="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
              <Button onPress={handleCreate} loading={createUser.isPending}>
                Crear empleado
              </Button>
            </View>
          )}
          {message && <Banner type={message.type}>{message.text}</Banner>}
        </View>
      }
      ListEmptyComponent={
        <Text className="mt-8 text-center text-sm text-muted">{isLoading ? "Cargando..." : "Todavía no hay empleados."}</Text>
      }
      renderItem={({ item }) => (
        <View className="gap-1 rounded-lg border border-border bg-surface p-4">
          <Text className="font-semibold text-light">{item.name}</Text>
          <Text className="text-sm text-muted">{item.username}</Text>
          <Text className={`text-xs ${item.active ? "text-success" : "text-danger"}`}>
            {item.active ? "Activo" : "Inactivo"}
          </Text>
          {item.role !== "dueno" && (
            <View className="mt-2">
              <Button
                size="sm"
                variant={item.active ? "danger" : "secondary"}
                disabled={workingId === item.userId}
                onPress={() => toggleActive(item)}
              >
                {item.active ? "Desactivar" : "Activar"}
              </Button>
            </View>
          )}
        </View>
      )}
    />
  );
}

function SucursalesView() {
  const { data: sucursales, isLoading } = useSucursales();
  const createSucursal = useCreateSucursal();
  const updateSucursal = useUpdateSucursal();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState<Message>(null);
  const [workingId, setWorkingId] = useState<number | null>(null);

  async function handleCreate() {
    if (!name.trim()) {
      setMessage({ type: "error", text: "Ingresá el nombre." });
      return;
    }
    setMessage(null);
    try {
      await createSucursal.mutateAsync({ name: name.trim(), address: address.trim() || undefined });
      setMessage({ type: "ok", text: `Sucursal "${name.trim()}" creada.` });
      setName("");
      setAddress("");
      setShowForm(false);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo crear la sucursal." });
    }
  }

  async function toggleActive(sucursal: Sucursal) {
    setWorkingId(sucursal.sucursalId);
    setMessage(null);
    try {
      await updateSucursal.mutateAsync({ id: sucursal.sucursalId, data: { active: !sucursal.active } });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo actualizar." });
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="gap-3 p-4"
      keyboardShouldPersistTaps="handled"
      data={sucursales ?? []}
      keyExtractor={(s) => String(s.sucursalId)}
      ListHeaderComponent={
        <View className="mb-1 gap-3">
          <Pressable onPress={() => setShowForm((v) => !v)}>
            <Text className="text-sm text-accent">{showForm ? "Cancelar" : "+ Nueva sucursal"}</Text>
          </Pressable>
          {showForm && (
            <View className="gap-3 rounded-lg border border-border bg-surface p-4">
              <Input label="Nombre" placeholder="Casa Central" value={name} onChangeText={setName} />
              <Input label="Dirección (opcional)" placeholder="Av. Siempre Viva 123" value={address} onChangeText={setAddress} />
              <Button onPress={handleCreate} loading={createSucursal.isPending}>
                Crear sucursal
              </Button>
            </View>
          )}
          {message && <Banner type={message.type}>{message.text}</Banner>}
        </View>
      }
      ListEmptyComponent={
        <Text className="mt-8 text-center text-sm text-muted">{isLoading ? "Cargando..." : "Todavía no hay sucursales."}</Text>
      }
      renderItem={({ item }) => (
        <View className="gap-1 rounded-lg border border-border bg-surface p-4">
          <Text className="font-semibold text-light">{item.name}</Text>
          {!!item.address && <Text className="text-sm text-muted">{item.address}</Text>}
          <Text className={`text-xs ${item.active ? "text-success" : "text-danger"}`}>
            {item.active ? "Activa" : "Inactiva"}
          </Text>
          <View className="mt-2">
            <Button
              size="sm"
              variant={item.active ? "danger" : "secondary"}
              disabled={workingId === item.sucursalId}
              onPress={() => toggleActive(item)}
            >
              {item.active ? "Desactivar" : "Activar"}
            </Button>
          </View>
        </View>
      )}
    />
  );
}

export default function AdminScreen() {
  const [view, setView] = useState<"empleados" | "sucursales">("empleados");

  return (
    <Screen>
      <View className="gap-3 border-b border-border bg-surface px-4 py-3">
        <Text className="text-lg font-bold text-light">Administración</Text>
        <View className="flex-row gap-2">
          <Tab label="Empleados" active={view === "empleados"} onPress={() => setView("empleados")} />
          <Tab label="Sucursales" active={view === "sucursales"} onPress={() => setView("sucursales")} />
        </View>
      </View>

      {view === "empleados" ? <EmpleadosView /> : <SucursalesView />}
    </Screen>
  );
}

import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useUsers, useUpdateUser } from "@/hooks/useUsers";
import { useAdminClients } from "@/hooks/useAdminClients";
import { ApiClientError } from "@/lib/api/client";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import type { AdminClientRow, UserAccount } from "@/types/entities";

const ROLE_LABEL: Record<string, string> = { dueno: "Dueño", empleado: "Empleado" };

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

function PersonalList({ users, isLoading, message, onToggle, workingId }: {
  users: UserAccount[] | undefined;
  isLoading: boolean;
  message: { type: "ok" | "error"; text: string } | null;
  onToggle: (u: UserAccount) => void;
  workingId: number | null;
}) {
  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="gap-3 p-4"
      data={users?.filter((u) => u.role !== "superadmin") ?? []}
      keyExtractor={(u) => String(u.userId)}
      ListHeaderComponent={message ? <Banner type={message.type}>{message.text}</Banner> : null}
      ListEmptyComponent={
        <Text className="mt-8 text-center text-sm text-muted">{isLoading ? "Cargando..." : "No hay usuarios todavía."}</Text>
      }
      renderItem={({ item }) => (
        <View className="gap-1 rounded-lg border border-border bg-surface p-4">
          <Text className="font-semibold text-light">{item.name}</Text>
          <Text className="text-sm text-muted">{item.username} · {ROLE_LABEL[item.role] ?? item.role}</Text>
          <Text className="text-sm text-accent">{item.tenantName ?? "—"}</Text>
          <Text className={`text-xs ${item.active ? "text-success" : "text-danger"}`}>
            {item.active ? "Activo" : "Inactivo"}
          </Text>
          <View className="mt-2">
            <Button
              size="sm"
              variant={item.active ? "danger" : "secondary"}
              disabled={workingId === item.userId}
              onPress={() => onToggle(item)}
            >
              {item.active ? "Desactivar" : "Activar"}
            </Button>
          </View>
        </View>
      )}
    />
  );
}

function ClientesList({ rows, isLoading }: { rows: AdminClientRow[] | undefined; isLoading: boolean }) {
  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="gap-3 p-4"
      data={rows ?? []}
      keyExtractor={(r) => String(r.client.clientId)}
      ListEmptyComponent={
        <Text className="mt-8 text-center text-sm text-muted">{isLoading ? "Cargando..." : "No hay clientes todavía."}</Text>
      }
      renderItem={({ item }) => (
        <View className="gap-1 rounded-lg border border-border bg-surface p-4">
          <Text className="font-semibold text-light">{item.client.name}</Text>
          {!!item.client.phone && <Text className="text-sm text-muted">{item.client.phone}</Text>}
          <Text className="text-sm text-accent">{item.tenantName}</Text>
        </View>
      )}
    />
  );
}

export default function UsuariosScreen() {
  const [view, setView] = useState<"personal" | "clientes">("personal");
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: clientRows, isLoading: clientsLoading } = useAdminClients();
  const updateUser = useUpdateUser();
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [workingId, setWorkingId] = useState<number | null>(null);

  async function handleToggle(user: UserAccount) {
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
    <Screen>
      <View className="gap-3 border-b border-border bg-surface px-4 py-3">
        <Text className="text-lg font-bold text-light">Usuarios</Text>
        <View className="flex-row gap-2">
          <Tab label="Personal" active={view === "personal"} onPress={() => setView("personal")} />
          <Tab label="Clientes" active={view === "clientes"} onPress={() => setView("clientes")} />
        </View>
      </View>

      {view === "personal" ? (
        <PersonalList users={users} isLoading={usersLoading} message={message} onToggle={handleToggle} workingId={workingId} />
      ) : (
        <ClientesList rows={clientRows} isLoading={clientsLoading} />
      )}
    </Screen>
  );
}

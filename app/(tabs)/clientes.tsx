import { useState } from "react";
import { FlatList, Linking, Pressable, Text, View } from "react-native";
import { useClientVehicles, useClients, useCreateClient, useInvitePortal } from "@/hooks/useClients";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePagedItems } from "@/hooks/usePagedItems";
import { ApiClientError } from "@/lib/api/client";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import type { Client } from "@/types/entities";

export default function ClientesScreen() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const { data: clientsPage, isLoading, isFetching } = useClients({ page, pageSize: 20, search: debouncedSearch || undefined });
  const clients = usePagedItems(clientsPage);
  const canLoadMore = !!clientsPage && clientsPage.page < clientsPage.totalPages;
  const createClient = useCreateClient();
  const invitePortal = useInvitePortal();

  // Reset de página al cambiar el buscador — ajuste de estado durante el
  // render (patrón recomendado por React), no un efecto.
  const [searchForPage, setSearchForPage] = useState(debouncedSearch);
  if (debouncedSearch !== searchForPage) {
    setSearchForPage(debouncedSearch);
    setPage(1);
  }

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [formMessage, setFormMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [inviteMessage, setInviteMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [invitingId, setInvitingId] = useState<number | null>(null);

  const { data: vehicles, isLoading: loadingVehicles } = useClientVehicles(selectedClient?.clientId ?? null);

  async function handleCreate() {
    if (!name.trim()) {
      setFormMessage({ type: "error", text: "Ingresá el nombre." });
      return;
    }
    setFormMessage(null);
    try {
      const created = await createClient.mutateAsync({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });
      setFormMessage({ type: "ok", text: `Cliente ${created.name} creado.` });
      setName("");
      setPhone("");
      setEmail("");
      setShowForm(false);
    } catch (err) {
      setFormMessage({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo crear el cliente." });
    }
  }

  async function handleInvite(client: Client) {
    setInviteMessage(null);
    setInvitingId(client.clientId);
    try {
      const invite = await invitePortal.mutateAsync(client.clientId);
      await Linking.openURL(invite.whatsappUrl);
    } catch (err) {
      setInviteMessage({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo generar la invitación." });
    } finally {
      setInvitingId(null);
    }
  }

  if (selectedClient) {
    return (
      <Screen>
        <View className="flex-row items-center justify-between border-b border-border bg-surface px-4 py-3">
          <View>
            <Text className="text-lg font-bold text-light">{selectedClient.name}</Text>
            <Text className="text-xs text-muted">Vehículos del cliente</Text>
          </View>
          <Pressable onPress={() => setSelectedClient(null)}>
            <Text className="text-sm text-accent">‹ Volver</Text>
          </Pressable>
        </View>

        <FlatList
          className="flex-1"
          contentContainerClassName="gap-3 p-4"
          data={vehicles ?? []}
          keyExtractor={(v) => String(v.vehicleId)}
          ListEmptyComponent={
            <Text className="mt-8 text-center text-sm text-muted">
              {loadingVehicles ? "Cargando..." : "Este cliente no tiene vehículos asociados todavía."}
            </Text>
          }
          renderItem={({ item }) => (
            <View className="gap-1 rounded-lg border border-border bg-surface p-4">
              <Text className="font-semibold text-light">
                {item.brand} {item.model}
              </Text>
              <Text className="text-sm text-accent">{item.plate}</Text>
              <Text className="text-xs text-muted">
                {item.year ? `${item.year} · ` : ""}
                {item.currentMileage.toLocaleString("es-AR")} km
              </Text>
            </View>
          )}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-row items-center justify-between border-b border-border bg-surface px-4 py-3">
        <Text className="text-lg font-bold text-light">Clientes</Text>
        <Pressable onPress={() => setShowForm((v) => !v)}>
          <Text className="text-sm text-accent">{showForm ? "Cancelar" : "+ Nuevo"}</Text>
        </Pressable>
      </View>

      <FlatList
        className="flex-1"
        contentContainerClassName="gap-3 p-4"
        keyboardShouldPersistTaps="handled"
        data={clients}
        keyExtractor={(c) => String(c.clientId)}
        ListHeaderComponent={
          <View className="mb-1 gap-3">
            {showForm && (
              <View className="gap-3 rounded-lg border border-border bg-surface p-4">
                {formMessage && <Banner type={formMessage.type}>{formMessage.text}</Banner>}
                <Input label="Nombre completo" placeholder="Juan Pérez" value={name} onChangeText={setName} />
                <Input label="Teléfono" placeholder="3431234567" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
                <Input
                  label="Email"
                  placeholder="juan@email.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <Button onPress={handleCreate} loading={createClient.isPending}>
                  Guardar cliente
                </Button>
              </View>
            )}
            {inviteMessage && <Banner type={inviteMessage.type}>{inviteMessage.text}</Banner>}
            <Input placeholder="Buscar por nombre, teléfono o email…" value={search} onChangeText={setSearch} autoCapitalize="none" />
          </View>
        }
        ListEmptyComponent={
          <Text className="mt-8 text-center text-sm text-muted">
            {isLoading ? "Cargando..." : debouncedSearch ? "Ningún cliente coincide con la búsqueda." : "No hay clientes cargados."}
          </Text>
        }
        ListFooterComponent={
          canLoadMore ? (
            <View className="mt-1">
              <Button variant="secondary" loading={isFetching} onPress={() => setPage((p) => p + 1)}>
                Cargar más
              </Button>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View className="gap-2 rounded-lg border border-border bg-surface p-4">
            <Pressable onPress={() => setSelectedClient(item)}>
              <Text className="font-semibold text-light">{item.name}</Text>
              {!!item.phone && <Text className="text-sm text-muted">{item.phone}</Text>}
              {!!item.email && <Text className="text-sm text-muted">{item.email}</Text>}
            </Pressable>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Button size="sm" variant="secondary" onPress={() => setSelectedClient(item)}>
                  Ver vehículos
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  size="sm"
                  disabled={invitingId === item.clientId}
                  onPress={() => handleInvite(item)}
                >
                  {invitingId === item.clientId ? "Generando..." : "Invitar al portal"}
                </Button>
              </View>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}

import { Text, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import { ROLE_LABELS } from "@/types/auth";

export default function MasScreen() {
  const { session, logout } = useAuth();

  return (
    <Screen>
      <View className="flex-1 px-6 pt-8 gap-6">
        <View className="rounded-lg border border-border bg-surface p-4 gap-1">
          <Text className="text-light font-semibold">{session?.username}</Text>
          <Text className="text-muted text-sm">
            {session ? ROLE_LABELS[session.role] : ""}
          </Text>
          {session?.tenantName && <Text className="text-muted text-sm">{session.tenantName}</Text>}
        </View>

        {session?.role === "owner" && (
          <Button variant="secondary" onPress={() => router.push("/metricas")}>
            📊 Métricas del taller
          </Button>
        )}

        <Button variant="secondary" onPress={logout}>
          Cerrar sesión
        </Button>
      </View>
    </Screen>
  );
}

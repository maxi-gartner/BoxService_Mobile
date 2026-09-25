import { Text, View } from "react-native";
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
        </View>

        <Button variant="secondary" onPress={logout}>
          Cerrar sesión
        </Button>
      </View>
    </Screen>
  );
}

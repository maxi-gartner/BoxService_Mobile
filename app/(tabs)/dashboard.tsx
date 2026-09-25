import { Text, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/lib/auth/AuthContext";
import { ROLE_LABELS } from "@/types/auth";

export default function DashboardScreen() {
  const { session } = useAuth();

  return (
    <Screen>
      <View className="flex-1 justify-center items-center gap-2 px-8">
        <Text className="text-2xl font-bold text-light">
          Hola, {session?.username}
        </Text>
        <Text className="text-accent">
          {session ? ROLE_LABELS[session.role] : ""}
        </Text>
        <Text className="mt-4 text-center text-sm text-muted">
          Dashboard en construcción — el resto de los módulos se van
          agregando de a uno, mismo patrón que ya se usó en la web.
        </Text>
      </View>
    </Screen>
  );
}

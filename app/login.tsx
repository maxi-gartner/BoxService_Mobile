import { useState } from "react";
import { Text, View, KeyboardAvoidingView, Platform } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/ErrorText";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiClientError } from "@/lib/api/client";

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center px-6 gap-8"
      >
        <View className="items-center gap-2">
          <Text className="text-3xl font-bold text-accent">⚙ BoxService</Text>
          <Text className="text-muted">Iniciá sesión para continuar</Text>
        </View>

        <View className="gap-4">
          <Input
            label="Usuario"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="superadmin"
          />
          <Input
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          <ErrorText>{error}</ErrorText>

          <Button onPress={handleSubmit} loading={isSubmitting} disabled={!username || !password}>
            Ingresar
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

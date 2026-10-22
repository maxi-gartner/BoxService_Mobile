import { useState } from "react";
import { View } from "react-native";
import { useResetPassword } from "@/hooks/useUsers";
import { ApiClientError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Message = { type: "ok" | "error"; text: string };

// Soporte: el dueño/empleado se olvidó la contraseña. Mismo alcance que
// el backend ya garantiza (dueño solo sus propios empleados, superadmin
// cualquiera) — este botón no decide nada de eso, solo pide la acción.
export function ResetPasswordRow({ userId, onDone }: { userId: number; onDone: (msg: Message) => void }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const resetPassword = useResetPassword();

  async function handleSubmit() {
    if (password.length < 6) {
      onDone({ type: "error", text: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }
    try {
      await resetPassword.mutateAsync({ id: userId, data: { newPassword: password } });
      onDone({ type: "ok", text: "Contraseña actualizada." });
      setOpen(false);
      setPassword("");
    } catch (err) {
      onDone({ type: "error", text: err instanceof ApiClientError ? err.message : "No se pudo actualizar la contraseña." });
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="secondary" onPress={() => setOpen(true)}>
        Resetear contraseña
      </Button>
    );
  }

  return (
    <View className="gap-2">
      <Input placeholder="Nueva contraseña" secureTextEntry value={password} onChangeText={setPassword} />
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Button size="sm" loading={resetPassword.isPending} onPress={handleSubmit}>
            Guardar
          </Button>
        </View>
        <View className="flex-1">
          <Button
            size="sm"
            variant="secondary"
            onPress={() => {
              setOpen(false);
              setPassword("");
            }}
          >
            Cancelar
          </Button>
        </View>
      </View>
    </View>
  );
}

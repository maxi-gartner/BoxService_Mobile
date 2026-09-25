import { Text, View } from "react-native";

/** Mismo criterio que ModulePlaceholder de la web: mientras el módulo no
 * esté migrado acá, mostrar esto en vez de una pantalla vacía o rota. */
export function ModulePlaceholder({ icon, title, description }: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8">
      <Text className="text-4xl">{icon}</Text>
      <Text className="text-lg font-semibold text-light">{title}</Text>
      <Text className="text-center text-sm text-muted">{description}</Text>
    </View>
  );
}

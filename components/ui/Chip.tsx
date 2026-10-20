import { Pressable, Text } from "react-native";

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-3 py-1.5 ${
        active ? "border-accent bg-accent-dim" : "border-border bg-surface-2"
      }`}
    >
      <Text className={`text-sm ${active ? "text-accent font-semibold" : "text-muted"}`}>{label}</Text>
    </Pressable>
  );
}

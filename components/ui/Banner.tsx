import { Text, View } from "react-native";

const STYLES = {
  ok: { border: "border-success/50", bg: "bg-success/10", text: "text-success" },
  error: { border: "border-danger/50", bg: "bg-danger/10", text: "text-danger" },
};

export function Banner({ type, children }: { type: "ok" | "error"; children: string | null }) {
  if (!children) return null;
  const style = STYLES[type];
  return (
    <View className={`rounded-lg border px-4 py-3 ${style.border} ${style.bg}`}>
      <Text className={`text-sm ${style.text}`}>{children}</Text>
    </View>
  );
}

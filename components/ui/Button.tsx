import { Pressable, Text, ActivityIndicator } from "react-native";

type Props = {
  onPress: () => void;
  children: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  size?: "md" | "sm";
};

const VARIANT_STYLES: Record<NonNullable<Props["variant"]>, { bg: string; text: string; spinner: string }> = {
  primary: { bg: "bg-accent", text: "text-bg", spinner: "#0d1117" },
  secondary: { bg: "bg-surface-2 border border-border", text: "text-light", spinner: "#e6edf3" },
  danger: { bg: "bg-danger/15 border border-danger", text: "text-danger", spinner: "#f85149" },
};

export function Button({ onPress, children, disabled, loading, variant = "primary", size = "md" }: Props) {
  const style = VARIANT_STYLES[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`items-center justify-center rounded-md ${size === "sm" ? "py-2 px-3" : "py-3 px-4"} ${style.bg} ${
        disabled || loading ? "opacity-50" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color={style.spinner} />
      ) : (
        <Text className={`font-semibold ${size === "sm" ? "text-xs" : ""} ${style.text}`}>{children}</Text>
      )}
    </Pressable>
  );
}

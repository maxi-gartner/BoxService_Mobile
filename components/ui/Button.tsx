import { Pressable, Text, ActivityIndicator } from "react-native";

type Props = {
  onPress: () => void;
  children: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
};

export function Button({ onPress, children, disabled, loading, variant = "primary" }: Props) {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`items-center justify-center rounded-md py-3 px-4 ${
        isPrimary ? "bg-accent" : "bg-surface-2 border border-border"
      } ${disabled || loading ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#0d1117" : "#e6edf3"} />
      ) : (
        <Text className={`font-semibold ${isPrimary ? "text-bg" : "text-light"}`}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

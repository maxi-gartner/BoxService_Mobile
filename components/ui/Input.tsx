import { TextInput, type TextInputProps, Text, View } from "react-native";

type Props = TextInputProps & { label: string };

export function Input({ label, ...props }: Props) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm text-muted">{label}</Text>
      <TextInput
        placeholderTextColor="#8b949e"
        className="rounded-md border border-border bg-surface px-3 py-3 text-light"
        {...props}
      />
    </View>
  );
}

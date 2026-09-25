import { Text } from "react-native";

export function ErrorText({ children }: { children: string | null }) {
  if (!children) return null;
  return (
    <Text className="rounded-md border border-danger bg-danger/10 px-3 py-2 text-sm text-danger">
      {children}
    </Text>
  );
}

import { SafeAreaView } from "react-native-safe-area-context";
import type { ReactNode } from "react";

/** Contenedor de pantalla estándar: fondo + safe area, nada más. */
export function Screen({ children }: { children: ReactNode }) {
  return <SafeAreaView className="flex-1 bg-bg">{children}</SafeAreaView>;
}

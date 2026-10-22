import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { queryClient } from "@/lib/queryClient";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { session, isLoading } = useAuth();
  const [updateChecked, setUpdateChecked] = useState(false);

  useEffect(() => {
    // Busca una actualización OTA y la aplica antes de mostrar nada —
    // sin esto, un fix publicado con eas update recién se ve en la
    // SEGUNDA apertura de la app (la primera solo dispara la descarga
    // en segundo plano). checkForUpdateAsync/reloadAsync rechazan en
    // Expo Go/dev, por eso el guard de __DEV__.
    let cancelled = false;
    async function checkForUpdate() {
      if (!__DEV__) {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
            return;
          }
        } catch {
          // Sin conexión o falló el check: sigue con el bundle actual.
        }
      }
      if (!cancelled) setUpdateChecked(true);
    }
    checkForUpdate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoading && updateChecked) SplashScreen.hideAsync().catch(() => {});
  }, [isLoading, updateChecked]);

  if (isLoading || !updateChecked) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="ticket/[serviceId]"
          options={{ headerShown: true, title: "Comprobante", presentation: "modal" }}
        />
        <Stack.Screen name="metricas" options={{ headerShown: true, title: "Métricas" }} />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  dashboard: "home",
  clientes: "people",
  vehiculos: "car",
  taller: "build",
  mas: "ellipsis-horizontal",
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#f59e0b",
        tabBarInactiveTintColor: "#8b949e",
        tabBarStyle: { backgroundColor: "#161b22", borderTopColor: "#30363d" },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name] ?? "ellipse"} color={color} size={size} />
        ),
      })}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="clientes" options={{ title: "Clientes" }} />
      <Tabs.Screen name="vehiculos" options={{ title: "Vehículos" }} />
      <Tabs.Screen name="taller" options={{ title: "Taller" }} />
      <Tabs.Screen name="mas" options={{ title: "Más" }} />
    </Tabs>
  );
}

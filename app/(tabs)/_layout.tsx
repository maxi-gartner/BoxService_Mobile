import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth/AuthContext";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  taller: "build",
  clientes: "people",
  vehiculos: "car",
  facturas: "receipt",
  admin: "settings",
  tenants: "business",
  usuarios: "people-circle",
  pagos: "cash",
  mas: "ellipsis-horizontal",
};

export default function TabsLayout() {
  const { session } = useAuth();
  // Superadmin administra talleres, no opera uno — ve solo sus dos
  // paneles cruzados. dueño suma "Admin" (empleados/sucursales de su
  // propio tenant); empleado se queda con el set operativo de siempre.
  const isSuperadmin = session?.role === "superadmin";
  const isOwner = session?.role === "owner";

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
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="taller" options={{ title: "Taller", href: isSuperadmin ? null : undefined }} />
      <Tabs.Screen name="clientes" options={{ title: "Clientes", href: isSuperadmin ? null : undefined }} />
      <Tabs.Screen name="vehiculos" options={{ title: "Vehículos", href: isSuperadmin ? null : undefined }} />
      <Tabs.Screen name="facturas" options={{ title: "Facturas", href: isSuperadmin ? null : undefined }} />
      <Tabs.Screen name="admin" options={{ title: "Admin", href: isOwner ? undefined : null }} />
      <Tabs.Screen name="tenants" options={{ title: "Talleres", href: isSuperadmin ? undefined : null }} />
      <Tabs.Screen name="usuarios" options={{ title: "Usuarios", href: isSuperadmin ? undefined : null }} />
      <Tabs.Screen name="pagos" options={{ title: "Pagos", href: isSuperadmin ? undefined : null }} />
      <Tabs.Screen name="mas" options={{ title: "Más" }} />
    </Tabs>
  );
}

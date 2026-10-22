import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth/AuthContext";

// Ancla del grupo (tabs): Expo Router necesita un index.tsx acá para
// resolver la ruta raíz "/" en un build standalone (no pasaba en Expo
// Go, donde Metro es más permisivo) — sin esto daba "Unmatched Route"
// al abrir la app recién instalada. Se oculta de la tab bar en
// _layout.tsx (href: null) y redirige al tab real de inicio.
//
// Superadmin no tiene tenant propio — "/taller" no le sirve de nada
// (el backend le devuelve 403), va directo a su panel de talleres.
export default function TabsIndex() {
  const { session } = useAuth();
  return <Redirect href={session?.role === "superadmin" ? "/tenants" : "/taller"} />;
}

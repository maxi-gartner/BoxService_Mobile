import { Redirect } from "expo-router";

// Ancla del grupo (tabs): Expo Router necesita un index.tsx acá para
// resolver la ruta raíz "/" en un build standalone (no pasaba en Expo
// Go, donde Metro es más permisivo) — sin esto daba "Unmatched Route"
// al abrir la app recién instalada. Se oculta de la tab bar en
// _layout.tsx (href: null) y redirige al tab real de inicio.
export default function TabsIndex() {
  return <Redirect href="/taller" />;
}

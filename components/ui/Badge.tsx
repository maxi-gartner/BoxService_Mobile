import { Text, View } from "react-native";

/** Mismos colores/labels que BoxService_FrontEnd/web/components/ui/Badge.tsx. */
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  draft: { bg: "#8b949e26", text: "#8b949e" },
  sent: { bg: "#58a6ff26", text: "#58a6ff" },
  approved: { bg: "#3fb95026", text: "#3fb950" },
  completed: { bg: "#a371f726", text: "#a371f7" },
  rejected: { bg: "#f8514926", text: "#f85149" },
  issued: { bg: "#f59e0b26", text: "#f59e0b" },
  paid: { bg: "#3fb95026", text: "#3fb950" },
  cancelled: { bg: "#8b949e26", text: "#8b949e" },
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviado",
  approved: "Aprobado",
  completed: "Finalizado",
  rejected: "Rechazado",
  issued: "Emitida",
  paid: "Cobrada",
  cancelled: "Anulada",
};

export function Badge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  const label = STATUS_LABELS[status] ?? status;

  return (
    <View className="self-start rounded-full px-3 py-1" style={{ backgroundColor: style.bg }}>
      <Text className="text-xs font-semibold" style={{ color: style.text }}>
        {label}
      </Text>
    </View>
  );
}

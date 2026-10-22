import { ScrollView, Text, View } from "react-native";
import { useMetrics } from "@/hooks/useMetrics";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { formatMoney } from "@/lib/utils";
import type { ServiceRanking } from "@/types/entities";

const TYPE_LABEL: Record<string, string> = { labor: "Mano de obra", part: "Repuesto" };

function monthLabel(month: string) {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString("es-AR", { month: "short", year: "numeric" });
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card className="flex-1 min-w-[45%]">
      <Text className="text-xs uppercase text-muted mb-1">{label}</Text>
      <Text className={`text-xl font-bold ${accent ? "text-accent" : "text-light"}`}>{value}</Text>
    </Card>
  );
}

function RankingSection({ title, items }: { title: string; items: ServiceRanking[] }) {
  return (
    <Card className="gap-3">
      <Text className="text-base font-bold text-light">{title}</Text>
      {items.length === 0 && <Text className="text-sm text-muted">Todavía no hay trabajos completados.</Text>}
      {items.map((item) => (
        <View key={`${item.description}-${item.type}`} className="flex-row items-center justify-between">
          <View className="flex-1 pr-2">
            <Text className="text-sm font-medium text-light" numberOfLines={1}>
              {item.description}
            </Text>
            <Text className="text-xs text-muted">
              {TYPE_LABEL[item.type] ?? item.type} · {item.count} {item.count === 1 ? "vez" : "veces"}
            </Text>
          </View>
          <Text className="text-accent">{formatMoney(item.total)}</Text>
        </View>
      ))}
    </Card>
  );
}

export default function MetricasScreen() {
  const { data, isLoading } = useMetrics();

  if (isLoading || !data) {
    return (
      <Screen>
        <Text className="mt-8 text-center text-sm text-muted">Cargando...</Text>
      </Screen>
    );
  }

  const maxMonthly = Math.max(1, ...data.revenueByMonth.map((d) => d.total));

  return (
    <Screen>
      <ScrollView className="flex-1" contentContainerClassName="gap-4 p-4">
        <Text className="text-sm text-muted">Cómo viene el taller este mes y este año.</Text>

        <View className="flex-row flex-wrap gap-3">
          <StatCard label="Ingresos este mes" value={formatMoney(data.revenueThisMonth)} accent />
          <StatCard label="Ingresos este año" value={formatMoney(data.revenueThisYear)} accent />
          <StatCard label="Services este mes" value={String(data.servicesThisMonth)} />
          <StatCard label="Services este año" value={String(data.servicesThisYear)} />
          <StatCard label="Clientes nuevos (mes)" value={String(data.newClientsThisMonth)} />
          <StatCard label="Ticket promedio" value={formatMoney(data.averageTicketThisMonth)} />
        </View>

        <Card className="gap-1">
          <Text className="text-xs uppercase text-muted mb-1">Presupuestos pendientes</Text>
          <Text className="text-xl font-bold text-light">
            {data.pendingBudgetsCount} · {formatMoney(data.pendingBudgetsValue)}
          </Text>
        </Card>

        <Card className="gap-3">
          <Text className="text-base font-bold text-light">Ingresos por mes</Text>
          {data.revenueByMonth.length === 0 && <Text className="text-sm text-muted">Todavía no hay facturas emitidas.</Text>}
          {data.revenueByMonth.map((d) => (
            <View key={d.month} className="gap-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs capitalize text-muted">{monthLabel(d.month)}</Text>
                <Text className="text-xs text-muted">{formatMoney(d.total)}</Text>
              </View>
              <View className="h-2 overflow-hidden rounded bg-surface-2">
                <View className="h-full rounded bg-accent" style={{ width: `${Math.max(2, (d.total / maxMonthly) * 100)}%` }} />
              </View>
            </View>
          ))}
        </Card>

        <RankingSection title="Servicios que generan mayor ingreso" items={data.topServicesByRevenue} />
        <RankingSection title="Servicios más pedidos" items={data.topServicesByFrequency} />
      </ScrollView>
    </Screen>
  );
}

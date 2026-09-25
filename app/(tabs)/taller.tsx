import { Screen } from "@/components/ui/Screen";
import { ModulePlaceholder } from "@/components/ui/ModulePlaceholder";

export default function TallerScreen() {
  return (
    <Screen>
      <ModulePlaceholder
        icon="🔧"
        title="Taller"
        description="Buscar vehículo, presupuestar, facturar — el flujo grande, se migra después de Clientes y Vehículos."
      />
    </Screen>
  );
}

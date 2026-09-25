import { Screen } from "@/components/ui/Screen";
import { ModulePlaceholder } from "@/components/ui/ModulePlaceholder";

export default function ClientesScreen() {
  return (
    <Screen>
      <ModulePlaceholder
        icon="👤"
        title="Clientes"
        description="Alta y búsqueda de clientes — próximo módulo a migrar."
      />
    </Screen>
  );
}

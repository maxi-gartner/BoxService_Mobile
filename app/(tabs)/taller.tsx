import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/ui/Screen";
import { VehicleSearch } from "@/components/taller/VehicleSearch";
import { VehicleWorkspaceHeader, type TallerSection } from "@/components/taller/VehicleWorkspaceHeader";
import { VehicleOverview } from "@/components/taller/VehicleOverview";
import { BudgetsList } from "@/components/taller/BudgetsList";
import { HistoryList } from "@/components/taller/HistoryList";
import { NewBudgetTab } from "@/components/taller/NewBudgetTab";
import { NewServiceTab } from "@/components/taller/NewServiceTab";
import type { Vehicle } from "@/types/entities";

type View = TallerSection | "nuevo-presupuesto" | "nuevo-service";

export default function TallerScreen() {
  const queryClient = useQueryClient();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [view, setView] = useState<View>("resumen");

  function handleSelect(v: Vehicle) {
    setVehicle(v);
    setView("resumen");
  }

  function handleChangeVehicle() {
    setVehicle(null);
  }

  function handleChanged() {
    queryClient.invalidateQueries();
    setView("resumen");
  }

  if (!vehicle) {
    return (
      <Screen>
        <VehicleSearch onSelect={handleSelect} />
      </Screen>
    );
  }

  return (
    <Screen>
      <VehicleWorkspaceHeader
        vehicle={vehicle}
        section={view === "nuevo-presupuesto" || view === "nuevo-service" ? "resumen" : view}
        onChangeSection={setView}
        onChangeVehicle={handleChangeVehicle}
        onNewBudget={() => setView("nuevo-presupuesto")}
        onNewService={() => setView("nuevo-service")}
      />

      {view === "resumen" && <VehicleOverview vehicle={vehicle} />}
      {view === "presupuestos" && <BudgetsList vehicle={vehicle} />}
      {view === "historial" && <HistoryList vehicle={vehicle} />}
      {view === "nuevo-presupuesto" && <NewBudgetTab vehicle={vehicle} onCreated={handleChanged} />}
      {view === "nuevo-service" && <NewServiceTab vehicle={vehicle} onCreated={handleChanged} />}
    </Screen>
  );
}

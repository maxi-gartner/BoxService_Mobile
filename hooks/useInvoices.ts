import { useQuery } from "@tanstack/react-query";
import { invoicesApi } from "@/lib/api/invoices";

export function useInvoices(params: { page?: number; pageSize?: number; status?: "todas" | "por-cobrar" } = {}) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: () => invoicesApi.list(params),
    staleTime: 15_000,
  });
}

// Facturas de un vehículo puntual (Taller) — sin paginar, un vehículo
// nunca acumula miles de facturas propias.
export function useInvoicesByVehicle(vehicleId: number | null) {
  return useQuery({
    queryKey: ["invoices", "byVehicle", vehicleId],
    queryFn: () => invoicesApi.listByVehicle(vehicleId as number),
    enabled: vehicleId !== null,
    staleTime: 15_000,
  });
}

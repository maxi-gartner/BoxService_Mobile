import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { servicesApi } from "@/lib/api/services";
import type { ServiceCreateRequest, ServiceDetailCreateRequest } from "@/types/entities";

export function useServices() {
  return useQuery({ queryKey: ["services"], queryFn: servicesApi.list, staleTime: 15_000 });
}

// Services de un vehículo puntual (Taller) — sin paginar, un vehículo
// nunca acumula miles de services propios.
export function useServicesByVehicle(vehicleId: number | null) {
  return useQuery({
    queryKey: ["services", "byVehicle", vehicleId],
    queryFn: () => servicesApi.listByVehicle(vehicleId as number),
    enabled: vehicleId !== null,
    staleTime: 15_000,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ServiceCreateRequest) => servicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useCreateServiceDetail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: number; data: ServiceDetailCreateRequest }) =>
      servicesApi.createDetail(serviceId, data),
  });
}

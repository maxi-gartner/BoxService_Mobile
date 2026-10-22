import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tenantsApi } from "@/lib/api/tenants";
import type { TenantCreateRequest } from "@/types/entities";

export function useTenants() {
  return useQuery({ queryKey: ["tenants"], queryFn: tenantsApi.list, staleTime: 60_000 });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TenantCreateRequest) => tenantsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenants"] }),
  });
}

export function useSetTenantActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => tenantsApi.setActive(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenants"] }),
  });
}

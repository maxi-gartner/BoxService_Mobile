import { useQuery } from "@tanstack/react-query";
import { clientsApi } from "@/lib/api/clients";

export function useClients() {
  return useQuery({ queryKey: ["clients"], queryFn: clientsApi.list });
}

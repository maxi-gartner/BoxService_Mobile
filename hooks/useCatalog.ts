import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api/catalog";

// Precios del catálogo casi no cambian durante el día.
export function useCatalog() {
  return useQuery({ queryKey: ["catalog"], queryFn: catalogApi.list, staleTime: 5 * 60_000 });
}

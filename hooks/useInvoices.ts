import { useQuery } from "@tanstack/react-query";
import { invoicesApi } from "@/lib/api/invoices";

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: invoicesApi.list,
    staleTime: 15_000,
  });
}

import { api } from "./client";
import type { Invoice, InvoiceCreateRequest, InvoiceStatus } from "@/types/entities";

export const invoicesApi = {
  list: () => api.get<Invoice[]>("invoices"),
  getById: (id: number) => api.get<Invoice>(`invoices/${id}`),
  // create/updateStatus: no se usan desde la UI todavía — ver
  // components/taller/BudgetsList.tsx, "Facturar" muestra "Próximamente".
  // Se dejan acá porque el contrato ya existe y funciona (lo prueba la
  // web); conectarlo es solo sacar el bloqueo de la UI el día que se
  // decida habilitarlo en mobile.
  create: (data: InvoiceCreateRequest) => api.post<Invoice>("invoices", data),
  updateStatus: (id: number, status: InvoiceStatus) =>
    api.patch<{ invoiceId: number; status: InvoiceStatus }>(`invoices/${id}`, { status }),
};

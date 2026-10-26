import { api, buildQuery } from "./client";
import type { Invoice, InvoiceCreateRequest, InvoiceStatus, PagedResult } from "@/types/entities";

export const invoicesApi = {
  list: (params: { page?: number; pageSize?: number; status?: "todas" | "por-cobrar" } = {}) =>
    api.get<PagedResult<Invoice>>(`invoices${buildQuery(params)}`),
  // Sin paginar — todas las facturas de un vehículo puntual (lo usa
  // InvoicingList en el Taller en vez de pedir el listado global).
  listByVehicle: (vehicleId: number) => api.get<Invoice[]>(`invoices${buildQuery({ vehicleId })}`),
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

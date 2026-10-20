import { api } from "./client";
import type { Client, Vehicle } from "@/types/entities";

export const clientsApi = {
  list: () => api.get<Client[]>("clients"),
  getById: (id: number) => api.get<Client>(`clients/${id}`),
  getVehicles: (id: number) => api.get<Vehicle[]>(`clients/${id}/vehicles`),
};

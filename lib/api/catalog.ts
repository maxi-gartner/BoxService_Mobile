import { api } from "./client";
import type { CatalogItem } from "@/types/entities";

export const catalogApi = {
  list: () => api.get<CatalogItem[]>("catalog"),
};

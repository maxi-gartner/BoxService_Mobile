import { useEffect, useState } from "react";
import type { PagedResult } from "@/types/entities";

// Acumula las páginas pedidas con "Cargar más" en una sola lista para el
// FlatList — la página 1 (primera carga o un buscador/filtro que
// cambió) reemplaza en vez de acumular.
export function usePagedItems<T>(pageResult: PagedResult<T> | undefined): T[] {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    if (!pageResult) return;
    setItems((prev) => (pageResult.page === 1 ? pageResult.items : [...prev, ...pageResult.items]));
  }, [pageResult]);

  return items;
}

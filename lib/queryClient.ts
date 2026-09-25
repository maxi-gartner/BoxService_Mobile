import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Datos de un taller no cambian segundo a segundo — evita refetches
      // de más al volver a enfocar una pantalla.
      staleTime: 30_000,
      retry: 1,
    },
  },
});

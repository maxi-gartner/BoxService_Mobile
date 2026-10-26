import type { ApiResponse } from "@/types/api";
import { clearSession, getSession } from "@/lib/auth/session";

/**
 * Cliente HTTP directo al backend real — no hay proxy/BFF como en la web
 * (no existe ese concepto en una app nativa). Cada request manda el
 * Authorization: Bearer leído de SecureStore.
 */
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export class ApiClientError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

/**
 * Registrado por AuthContext al montar: así el cliente puede avisar "la
 * sesión ya no sirve" sin importar AuthContext acá (evita un ciclo de
 * imports) y sin nada tipo window.location, que no existe en RN.
 */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (!BACKEND_URL) {
    throw new ApiClientError(
      "Falta EXPO_PUBLIC_BACKEND_URL — ver .env.example",
      500,
    );
  }

  const session = await getSession();

  const res = await fetch(`${BACKEND_URL}/${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Un 401 solo significa "se venció la sesión" si había una sesión de
  // la que colgarse — si la request se mandó sin token (ej. el intento
  // de login en sí, que también puede dar 401 con credenciales
  // inválidas), hay que mostrar el error real del backend, no este
  // mensaje genérico.
  if (res.status === 401 && session) {
    await clearSession();
    onUnauthorized?.();
    throw new ApiClientError("Sesión expirada", 401);
  }

  const json = (await res.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new ApiClientError(json.error.message, json.error.code);
  }

  return json.data;
}

// Query string para los listados paginados (page/pageSize/search/status/
// vehicleId) — omite claves undefined/null/"" en vez de mandarlas vacías.
export function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

import * as SecureStore from "expo-secure-store";
import type { Role } from "@/types/auth";
import { normalizeRole } from "@/types/auth";

/**
 * Sesión guardada en SecureStore (Keychain en iOS, Keystore en Android) —
 * el equivalente mobile de la cookie httpOnly que usa la web: el token
 * nunca queda en un storage plano legible por cualquier código JS/nativo
 * de la app sin pasar por este módulo.
 */
const SESSION_KEY = "boxservice_session";

export type Session = {
  token: string;
  expiresAt: string;
  username: string;
  role: Role;
};

export async function saveSession(session: Session): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<Session | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Session;
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      await clearSession();
      return null;
    }
    return parsed;
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

/**
 * dueno/empleado (backend, español) -> owner/employee (resto de la app).
 * Un rol desconocido es un bug del backend, no algo para taparlo con un
 * default silencioso — mismo criterio que usa el login del front web.
 */
export function toRole(role: string): Role {
  const normalized = normalizeRole(role);
  if (!normalized) throw new Error(`Rol desconocido: ${role}`);
  return normalized;
}

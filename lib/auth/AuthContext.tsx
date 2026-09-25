import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, ApiClientError, setUnauthorizedHandler } from "@/lib/api/client";
import { clearSession, getSession, saveSession, toRole, type Session } from "@/lib/auth/session";
import type { LoginResponse } from "@/types/auth";

type AuthState = {
  session: Session | null;
  /** Sigue en true mientras se lee SecureStore al arrancar la app. */
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSession()
      .then(setSession)
      .finally(() => setIsLoading(false));

    // Si cualquier request del cliente HTTP recibe 401 (token vencido o
    // inválido), cerramos la sesión acá — un solo lugar, en vez de que
    // cada pantalla tenga que manejar ese caso por su cuenta.
    setUnauthorizedHandler(() => setSession(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  async function login(username: string, password: string) {
    const result = await api.post<LoginResponse>("auth/login", { username, password });
    const next: Session = {
      token: result.token,
      expiresAt: result.expiresAt,
      username: result.username,
      role: toRole(result.role),
    };
    await saveSession(next);
    setSession(next);
  }

  async function logout() {
    await clearSession();
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() tiene que usarse dentro de <AuthProvider>");
  return ctx;
}

export { ApiClientError };

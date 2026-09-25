/**
 * Roles del sistema — mismo contrato que
 * BoxService_FrontEnd/web/types/auth.ts.
 *
 * - owner: dueño de un taller. Ve y gestiona solo SU tenant.
 * - employee: empleado de un taller. Igual que owner pero sin acceso a
 *   pantallas de administración del tenant.
 * - superadmin: nosotros. Puede operar sobre cualquier tenant.
 */
export type Role = "owner" | "employee" | "superadmin";

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Dueño",
  employee: "Empleado",
  superadmin: "Superadmin",
};

export function normalizeRole(value: unknown): Role | null {
  if (value === "owner" || value === "dueno") return "owner";
  if (value === "employee" || value === "empleado") return "employee";
  if (value === "superadmin") return "superadmin";
  return null;
}

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** null solo para superadmin operando sin tenant seleccionado. */
  tenantId: string | null;
};

export type LoginRequest = {
  username: string;
  password: string;
};

/**
 * Lo que devuelve HOY el backend real en POST /auth/login (ver
 * BoxService_FrontEnd/web/docs/API_CONTRACT.md, sección Autenticación).
 * A diferencia del front web (que tiene un BFF que arma un User sintético
 * y esconde el token en una cookie httpOnly), acá no hay ese intermediario
 * — la app nativa recibe el token directo y lo guarda ella misma en
 * SecureStore (ver lib/auth/session.ts).
 */
export type LoginResponse = {
  token: string;
  expiresAt: string;
  username: string;
  role: "dueno" | "superadmin" | "empleado";
};

/** Claims mínimos que el access token trae codificados (ver contrato). */
export type AccessTokenClaims = {
  sub: string; // userId
  role: Role | "dueno" | "empleado";
  tenantId?: string | null;
  exp: number;
};

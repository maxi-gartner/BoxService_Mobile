/**
 * Entidades de dominio — copiado tal cual de
 * BoxService_FrontEnd/web/types/entities.ts (mismo backend, mismo
 * contrato). Se duplica a propósito: repos separados, sin monorepo ni
 * paquete compartido. Si el contrato cambia, cambia en los dos lados —
 * ver BoxService_FrontEnd/web/docs/API_CONTRACT.md como fuente de verdad.
 */

// Forma de respuesta de los listados grandes (Clientes, Vehículos,
// Facturas) — reemplaza al array simple que devolvían antes.
export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

// ── Administración (superadmin) ───────────────────────
// Tenant real (tabla "tenants"). A diferencia del tenantId de las
// entidades de negocio de abajo (que lo mantienen como string por
// compatibilidad histórica con el front web), este es el id real del
// tenant en sí: viaja como número en el JSON.
export type Tenant = {
  tenantId: number;
  name: string;
  active: boolean;
  createdAt: string;
  telefono: string | null;
  email: string | null;
  ownerName: string | null;
  ownerUsername: string | null;
};

export type TenantCreateRequest = {
  businessName: string;
  ownerName: string;
  username: string;
  password: string;
  telefono?: string;
  email?: string;
};

export type TenantCreateResult = {
  tenantId: number;
  name: string;
  owner: { userId: number; username: string; name: string };
};

export type TenantUpdateRequest = {
  active?: boolean;
  telefono?: string;
  email?: string;
};

// Control de pago mensual por taller — por ahora solo "pagó este mes
// sí/no" y cuánto, no una contabilidad completa.
export type TenantPayment = {
  paymentId: number;
  tenantId: number;
  amount: number;
  period: string; // "YYYY-MM"
  paymentDate: string;
  notes: string | null;
  createdAt: string;
};

export type TenantPaymentCreateRequest = {
  amount: number;
  period: string;
  paymentDate?: string;
  notes?: string;
};

// GET /admin/payments — de un vistazo, quién pagó el mes actual.
export type TenantPaymentStatus = {
  tenantId: number;
  tenantName: string;
  paidCurrentPeriod: boolean;
  lastAmount: number | null;
  lastPeriod: string | null;
  lastPaymentDate: string | null;
};

export type Sucursal = {
  sucursalId: number;
  tenantId: number;
  name: string;
  address: string | null;
  active: boolean;
  createdAt: string;
};

export type SucursalCreateRequest = {
  name: string;
  address?: string | null;
};

export type SucursalUpdateRequest = {
  name?: string;
  address?: string | null;
  active?: boolean;
};

export type UserRole = "superadmin" | "dueno" | "empleado";

// Fila real de "usuarios". Nunca incluye el hash de contraseña.
export type UserAccount = {
  userId: number;
  tenantId: number | null;
  tenantName: string | null;
  username: string;
  name: string;
  email: string | null;
  role: UserRole;
  active: boolean;
  createdAt: string;
};

export type UserCreateRequest = {
  username: string;
  password: string;
  name: string;
  email?: string | null;
  /** Solo lo usa superadmin vía POST /tenants/{id}/users; dueno siempre crea "empleado". */
  role?: UserRole;
};

export type UserUpdateRequest = {
  name?: string;
  email?: string | null;
  active?: boolean;
};

// POST /users/{id}/reset-password — soporte cuando un dueño/empleado se
// olvida la contraseña.
export type ResetPasswordRequest = {
  newPassword: string;
};

// GET /admin/clients (superadmin) — misma forma que Client, con el
// nombre del tenant embebido para distinguir a quién pertenece cada uno.
export type AdminClientRow = {
  client: Client;
  tenantName: string;
};

// ── Clientes ──────────────────────────────────────────
export type Client = {
  clientId: number;
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
};

export type ClientCreateRequest = {
  name: string;
  phone?: string;
  email?: string;
};

export type PortalInvite = {
  inviteUrl: string;
  whatsappUrl: string;
  expiresAt: string;
};

// ── Vehículos ─────────────────────────────────────────
export type Vehicle = {
  vehicleId: number;
  tenantId: string;
  clientId: number;
  brand: string;
  model: string;
  version: string | null;
  year: number | null;
  plate: string;
  currentMileage: number;
  createdAt: string;
  /** Solo viene en GET /vehicles paginado (join contra clientes). */
  clientName?: string | null;
};

export type VehicleCreateRequest = {
  clientId: number;
  brand: string;
  model: string;
  version?: string;
  year?: number | null;
  plate: string;
  currentMileage?: number;
};

// Sugerencias de marca/modelo/versión al cargar un vehículo, sacadas del
// catálogo público de Mercado Libre Argentina (GET /vehicle-catalog/*).
// Solo son sugerencias — los campos siguen aceptando texto libre.
export type VehicleCatalogOption = {
  id: string;
  name: string;
};

// ── Presupuestos ──────────────────────────────────────
export type BudgetStatus = "draft" | "sent" | "approved" | "completed" | "rejected";

export type BudgetDetail = {
  detailId: number;
  budgetId: number;
  type: "labor" | "part";
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Budget = {
  budgetId: number;
  tenantId: string;
  number: string; // P-0001
  date: string;
  status: BudgetStatus;
  notes: string | null;
  vehicleId: number;
  serviceId: number | null;
  /** Solo vienen en GET /budgets paginado (join contra vehiculos). */
  vehiclePlate?: string | null;
  vehicleBrand?: string | null;
  vehicleModel?: string | null;
};

export type BudgetWithDetails = {
  budget: Budget;
  details: BudgetDetail[];
  total: number;
};

export type BudgetDetailRequest = {
  type: "labor" | "part";
  description: string;
  quantity: number;
  unitPrice: number;
};

export type BudgetCreateRequest = {
  vehicleId: number;
  notes?: string | null;
  details: BudgetDetailRequest[];
};

export type BudgetStatusRequest = {
  status: BudgetStatus;
};

// ── Services ──────────────────────────────────────────
export type ServiceDetail = {
  detailId: number;
  serviceId: number;
  description: string;
  done: boolean;
};

export type Service = {
  serviceId: number;
  tenantId: string;
  vehicleId: number;
  date: string;
  mileage: number;
  serviceType: string;
  notes: string;
  nextMileage: number | null;
  nextDate: string | null;
};

export type ServiceCreateRequest = {
  vehicleId: number;
  date: string;
  mileage: number;
  serviceType: string;
  notes?: string;
};

export type ServiceDetailCreateRequest = {
  description: string;
  done: boolean;
};

// ── Facturas ──────────────────────────────────────────
export type InvoiceStatus = "issued" | "paid" | "cancelled";

export type Invoice = {
  invoiceId: number;
  tenantId: string;
  number: string; // F-0001
  date: string;
  total: number;
  status: InvoiceStatus;
  serviceId: number;
  budgetId: number | null;
  /** Solo vienen en GET /invoices paginado (join contra services/vehiculos). */
  vehicleId?: number | null;
  vehiclePlate?: string | null;
  vehicleBrand?: string | null;
  vehicleModel?: string | null;
};

export type InvoiceCreateRequest = {
  serviceId: number;
  budgetId?: number | null;
};

export type InvoiceStatusRequest = {
  status: InvoiceStatus;
};

// ── Catálogo de precios ───────────────────────────────
export type CatalogItem = {
  catalogId: number;
  tenantId: string;
  name: string;
  type: "labor" | "part";
  price: number;
};

export type CatalogItemCreateRequest = {
  name: string;
  type: "labor" | "part";
  price: number;
};

export type CatalogItemUpdateRequest = Partial<CatalogItemCreateRequest>;

// ── Métricas (GET /metrics) ────────────────────────────
// Resumen de cómo viene el mes/año para el tenant del que llama — no es
// contabilidad exacta, es para que el dueño vea de un vistazo cómo va.
export type MonthlyRevenue = {
  month: string; // "YYYY-MM"
  total: number;
};

export type ServiceRanking = {
  description: string;
  type: "labor" | "part";
  count: number;
  total: number;
};

export type TenantMetrics = {
  revenueThisMonth: number;
  revenueThisYear: number;
  servicesThisMonth: number;
  servicesThisYear: number;
  newClientsThisMonth: number;
  pendingBudgetsCount: number;
  pendingBudgetsValue: number;
  averageTicketThisMonth: number;
  revenueByMonth: MonthlyRevenue[];
  topServicesByRevenue: ServiceRanking[];
  topServicesByFrequency: ServiceRanking[];
};

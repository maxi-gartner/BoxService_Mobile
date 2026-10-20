import * as Print from "expo-print";
import { formatDate, formatMoney } from "./utils";
import type { BudgetDetail, BudgetStatus, Client, InvoiceStatus, Vehicle } from "@/types/entities";

// Mismos labels que components/ui/Badge.tsx — duplicado a propósito,
// mismo criterio que el resto de las entidades (ver types/entities.ts).
const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviado",
  approved: "Aprobado",
  completed: "Finalizado",
  rejected: "Rechazado",
  issued: "Emitida",
  paid: "Cobrada",
  cancelled: "Anulada",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function documentHtml({
  kind,
  number,
  status,
  date,
  client,
  vehicle,
  rows,
  total,
  notes,
  footer,
}: {
  kind: "Presupuesto" | "Factura";
  number: string;
  status: BudgetStatus | InvoiceStatus;
  date: string;
  client: Client;
  vehicle: Vehicle;
  rows: { description: string; quantity?: number; unitPrice?: number; subtotal: number }[];
  total: number;
  notes?: string | null;
  footer: string;
}) {
  const showQtyPrice = rows.some((r) => r.quantity !== undefined);

  const rowsHtml = rows.length
    ? rows
        .map(
          (r) => `
        <tr>
          <td class="desc">${escapeHtml(r.description)}</td>
          ${showQtyPrice ? `<td class="num">${r.quantity ?? ""}</td><td class="num">${r.unitPrice !== undefined ? formatMoney(r.unitPrice) : ""}</td>` : ""}
          <td class="num">${formatMoney(r.subtotal)}</td>
        </tr>`,
        )
        .join("")
    : `<tr><td colspan="4" class="empty">Sin ítems cargados.</td></tr>`;

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #e6edf3; background: #0d1117; padding: 32px; font-size: 13px; }
        .card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 28px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px dashed #30363d; }
        .brand { font-size: 22px; font-weight: 700; color: #f59e0b; }
        .brand-sub { font-size: 11px; color: #8b949e; margin-top: 2px; }
        .doc-title { font-size: 16px; font-weight: 700; text-align: right; }
        .doc-number { color: #f59e0b; font-weight: 600; text-align: right; }
        .badge { display: inline-block; margin-top: 4px; padding: 3px 10px; border-radius: 999px; font-size: 10px; font-weight: 600; background: #f59e0b26; color: #f59e0b; }
        .grid { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 20px; }
        .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.03em; color: #8b949e; margin-bottom: 4px; }
        .right { text-align: right; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 8px; }
        thead tr { border-bottom: 1px solid #30363d; }
        th { text-align: left; padding: 8px 4px; font-size: 10px; text-transform: uppercase; color: #8b949e; font-weight: 500; }
        th.num, td.num { text-align: right; }
        td { padding: 8px 4px; border-bottom: 1px solid #21262d; }
        td.empty { text-align: center; color: #8b949e; padding: 16px; }
        .total-row { display: flex; justify-content: flex-end; margin: 16px 0; }
        .total-box { width: 200px; display: flex; justify-content: space-between; border-top: 1px solid #30363d; padding-top: 10px; font-weight: 700; }
        .total-box .amount { color: #f59e0b; }
        .notes { margin-bottom: 16px; padding-top: 14px; border-top: 1px dashed #30363d; }
        .footer { padding-top: 14px; border-top: 1px dashed #30363d; text-align: center; font-size: 10px; color: #8b949e; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <div class="brand">⚙ BoxService</div>
            <div class="brand-sub">Taller mecánico</div>
          </div>
          <div>
            <div class="doc-title">${kind}</div>
            <div class="doc-number">${escapeHtml(number)}</div>
            <div class="right"><span class="badge">${STATUS_LABELS[status] ?? status}</span></div>
          </div>
        </div>

        <div class="grid">
          <div>
            <div class="label">Cliente</div>
            <div>${escapeHtml(client.name)}</div>
            ${client.phone ? `<div>${escapeHtml(client.phone)}</div>` : ""}
            ${client.email ? `<div>${escapeHtml(client.email)}</div>` : ""}
          </div>
          <div class="right">
            <div class="label">Vehículo</div>
            <div>${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}</div>
            <div>${escapeHtml(vehicle.plate)}</div>
            <div>Fecha: ${formatDate(date)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              ${showQtyPrice ? `<th class="num">Cant.</th><th class="num">Precio unit.</th>` : ""}
              <th class="num">Subtotal</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>

        <div class="total-row">
          <div class="total-box"><span>Total</span><span class="amount">${formatMoney(total)}</span></div>
        </div>

        ${notes ? `<div class="notes"><div class="label">Notas</div><div>${escapeHtml(notes)}</div></div>` : ""}

        <div class="footer">${escapeHtml(footer)}</div>
      </div>
    </body>
  </html>`;
}

async function printHtml(html: string) {
  await Print.printAsync({ html });
}

export async function printPresupuesto(params: {
  number: string;
  status: BudgetStatus;
  date: string;
  client: Client;
  vehicle: Vehicle;
  details: BudgetDetail[];
  total: number;
  notes?: string | null;
}) {
  const html = documentHtml({
    kind: "Presupuesto",
    number: params.number,
    status: params.status,
    date: params.date,
    client: params.client,
    vehicle: params.vehicle,
    rows: params.details.map((d) => ({
      description: d.description,
      quantity: d.quantity,
      unitPrice: d.unitPrice,
      subtotal: d.subtotal,
    })),
    total: params.total,
    notes: params.notes,
    footer: `Presupuesto ${params.number} — generado desde BoxService. Documento no válido como factura.`,
  });
  await printHtml(html);
}

export async function printFactura(params: {
  number: string;
  status: InvoiceStatus;
  date: string;
  client: Client;
  vehicle: Vehicle;
  total: number;
  serviceId: number;
  serviceType: string;
  budgetDetails?: BudgetDetail[];
}) {
  const rows = params.budgetDetails?.length
    ? params.budgetDetails.map((d) => ({
        description: d.description,
        quantity: d.quantity,
        unitPrice: d.unitPrice,
        subtotal: d.subtotal,
      }))
    : [{ description: params.serviceType, subtotal: params.total }];

  const html = documentHtml({
    kind: "Factura",
    number: params.number,
    status: params.status,
    date: params.date,
    client: params.client,
    vehicle: params.vehicle,
    rows,
    total: params.total,
    footer: `Factura ${params.number} — generada desde BoxService a partir del service #${params.serviceId}.`,
  });
  await printHtml(html);
}

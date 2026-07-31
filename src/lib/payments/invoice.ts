import { FOUNDRY_PLANS, VAULT_PLANS } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { formatMoney, taxConfig } from "./currencies";
import { paymentsLog } from "./errors";
import type { Currency, ProviderId } from "./types";

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
};

function findPlan(planId: string) {
  return [...VAULT_PLANS, ...FOUNDRY_PLANS].find((p) => p.id === planId);
}

async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getUTCFullYear();
  const prefix = `GIT-${year}-`;
  for (let attempt = 0; attempt < 5; attempt++) {
    const latest = await prisma.invoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: "desc" },
      select: { invoiceNumber: true },
    });
    const seq = latest
      ? Number.parseInt(latest.invoiceNumber.slice(prefix.length), 10) + 1
      : 1;
    if (!Number.isFinite(seq) || seq < 1) {
      return `${prefix}${String(Date.now()).slice(-6)}`;
    }
    const candidate = `${prefix}${String(seq).padStart(6, "0")}`;
    const clash = await prisma.invoice.findUnique({
      where: { invoiceNumber: candidate },
      select: { id: true },
    });
    if (!clash) return candidate;
  }
  return `${prefix}${String(Date.now()).slice(-6)}`;
}

/**
 * Create a formal invoice after successful payment.
 * Idempotent on transactionId. Also stamps PaymentTransaction.receiptNumber.
 */
export async function createInvoiceForTransaction(opts: {
  transactionId: string;
  provider: ProviderId;
  email: string;
  planId: string;
  amount: number;
  currency: Currency;
}): Promise<{ invoiceId: string; invoiceNumber: string } | null> {
  try {
    const existing = await prisma.invoice.findUnique({
      where: { transactionId: opts.transactionId },
    });
    if (existing) {
      return { invoiceId: existing.id, invoiceNumber: existing.invoiceNumber };
    }

    const plan = findPlan(opts.planId);
    const tax = taxConfig();
    let subtotal = opts.amount;
    let taxAmount = 0;
    if (tax.enabled && tax.rateBps > 0) {
      // amount is treated as tax-inclusive total when tax enabled — derive subtotal
      subtotal = Math.round((opts.amount * 10_000) / (10_000 + tax.rateBps));
      taxAmount = opts.amount - subtotal;
    }

    const lineItems: InvoiceLineItem[] = [
      {
        description: plan?.name ?? opts.planId,
        quantity: 1,
        unitAmount: subtotal,
        amount: subtotal,
      },
    ];

    const invoiceNumber = await nextInvoiceNumber();
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        transactionId: opts.transactionId,
        userEmail: opts.email.toLowerCase(),
        planId: opts.planId,
        planName: plan?.name ?? opts.planId,
        currency: opts.currency,
        subtotalAmount: subtotal,
        taxAmount,
        taxLabel: tax.enabled ? tax.label : null,
        taxRateBps: tax.enabled ? tax.rateBps : 0,
        totalAmount: opts.amount,
        lineItems,
        status: "paid",
      },
    });

    await prisma.paymentTransaction.update({
      where: { id: opts.transactionId },
      data: { receiptNumber: invoiceNumber },
    });

    paymentsLog("invoice_created", {
      invoiceNumber,
      provider: opts.provider,
      planId: opts.planId,
    });

    return { invoiceId: invoice.id, invoiceNumber };
  } catch (err) {
    paymentsLog("invoice_create_failed", {
      message: err instanceof Error ? err.message.slice(0, 80) : "error",
    });
    return null;
  }
}

export function invoiceHtmlDocument(invoice: {
  invoiceNumber: string;
  userEmail: string;
  planName: string;
  currency: string;
  subtotalAmount: number;
  taxAmount: number;
  taxLabel: string | null;
  taxRateBps: number;
  totalAmount: number;
  lineItems: InvoiceLineItem[];
  issuedAt: Date;
  status: string;
}): string {
  const currency = invoice.currency as Currency;
  const rows = invoice.lineItems
    .map(
      (li) =>
        `<tr><td>${escapeHtml(li.description)}</td><td>${li.quantity}</td><td>${escapeHtml(formatMoney(li.unitAmount, currency))}</td><td>${escapeHtml(formatMoney(li.amount, currency))}</td></tr>`
    )
    .join("");

  const taxRow =
    invoice.taxAmount > 0
      ? `<tr><td colspan="3">${escapeHtml(invoice.taxLabel ?? "Tax")}${invoice.taxRateBps ? ` (${(invoice.taxRateBps / 100).toFixed(2)}%)` : ""}</td><td>${escapeHtml(formatMoney(invoice.taxAmount, currency))}</td></tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Invoice ${escapeHtml(invoice.invoiceNumber)} — Gitosha</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #1a1a1a; margin: 2rem; }
    h1 { font-size: 1.75rem; margin: 0 0 0.25rem; }
    .muted { color: #555; font-size: 0.9rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
    th, td { border-bottom: 1px solid #ddd; padding: 0.6rem 0.4rem; text-align: left; }
    th { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #666; }
    .totals { margin-top: 1rem; text-align: right; }
    .totals strong { font-size: 1.15rem; }
    @media print { body { margin: 0.5in; } .no-print { display: none; } }
  </style>
</head>
<body>
  <p class="muted no-print"><button onclick="window.print()">Print / Save as PDF</button></p>
  <h1>Invoice</h1>
  <p class="muted">${escapeHtml(invoice.invoiceNumber)} · ${escapeHtml(invoice.status)} · ${escapeHtml(invoice.issuedAt.toISOString().slice(0, 10))}</p>
  <p><strong>Bill to</strong><br />${escapeHtml(invoice.userEmail)}</p>
  <p><strong>From</strong><br />Gitosha · Digital goods (Vault / Foundry)</p>
  <table>
    <thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Amount</th></tr></thead>
    <tbody>${rows}${taxRow}</tbody>
  </table>
  <div class="totals">
    <p>Subtotal: ${escapeHtml(formatMoney(invoice.subtotalAmount, currency))}</p>
    <p><strong>Total: ${escapeHtml(formatMoney(invoice.totalAmount, currency))} (${escapeHtml(currency)})</strong></p>
  </div>
  <p class="muted">Card data is never stored by Gitosha. This is a formal invoice for your records — not a PCI attestation.</p>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

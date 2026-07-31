import { NextRequest, NextResponse } from "next/server";
import { getSessionEmail, requireLegalAdmin } from "@/lib/legal/admin";
import { prisma } from "@/lib/prisma";
import { invoiceHtmlDocument, type InvoiceLineItem } from "@/lib/payments/invoice";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const sessionEmail = await getSessionEmail();
  const admin = await requireLegalAdmin();

  let invoice = null;
  try {
    invoice = await prisma.invoice.findUnique({ where: { id } });
  } catch {
    return new NextResponse("Invoice store unavailable", { status: 503 });
  }
  if (!invoice) return new NextResponse("Not found", { status: 404 });

  const isOwner = sessionEmail && sessionEmail === invoice.userEmail.toLowerCase();
  if (!isOwner && !admin.ok) {
    return new NextResponse("Sign in required", { status: 401 });
  }

  const html = invoiceHtmlDocument({
    invoiceNumber: invoice.invoiceNumber,
    userEmail: invoice.userEmail,
    planName: invoice.planName,
    currency: invoice.currency,
    subtotalAmount: invoice.subtotalAmount,
    taxAmount: invoice.taxAmount,
    taxLabel: invoice.taxLabel,
    taxRateBps: invoice.taxRateBps,
    totalAmount: invoice.totalAmount,
    lineItems: invoice.lineItems as InvoiceLineItem[],
    issuedAt: invoice.issuedAt,
    status: invoice.status,
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}

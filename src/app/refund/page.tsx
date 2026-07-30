import type { Metadata } from "next";
import Link from "next/link";
import { getLegalConfig } from "@/lib/legal/resolve";
import { ContactMailto } from "@/lib/legal/sections";
import { LegalShell } from "@/components/LegalShell";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Refund Policy — ${BRAND.name}`,
  description: `Refund rules for ${BRAND.name} Vault subscriptions and Foundry licenses.`,
};

/** Legacy /refund URL — same config-driven content as /legal/refunds */
export default async function RefundPage() {
  const config = await getLegalConfig();
  return (
    <LegalShell title="Refund Policy" config={config}>
      <p>
        This page mirrors <Link href="/legal/refunds">/legal/refunds</Link>.{" "}
        {config.shipping.delivery}
      </p>
      {config.refunds.map((r) => (
        <div key={r.product}>
          <h2>{r.title}</h2>
          <p>{r.summary}</p>
          <ul>
            {r.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      ))}
      <h2>How to request</h2>
      <p>
        Email <ContactMailto email={config.business.contactEmail} /> with purchase email, payment
        ID, license key if any, and reason.
      </p>
    </LegalShell>
  );
}

import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";
import { BRAND } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal/resolve";
import { ContactMailto } from "@/lib/legal/sections";

export const metadata: Metadata = {
  title: `Refund Policy — ${BRAND.name}`,
  description: `Refund rules for ${BRAND.name} digital Vault and Foundry products.`,
};

async function RefundBody() {
  const config = await getLegalConfig();
  return (
    <LegalShell title="Refund Policy" config={config}>
      <p>
        This Refund Policy applies to purchases made on {config.productName} (USD catalog prices;
        checkout charged in INR via Xflow UPI). All products are digital —{" "}
        {config.shipping.delivery}
      </p>

      {config.refunds.map((r) => (
        <div key={r.product}>
          <h2>{r.title}</h2>
          <p>{r.summary}</p>
          {r.windowDays != null && (
            <p>
              Review window: <strong>{r.windowDays} days</strong> where stated below.
            </p>
          )}
          <ul>
            {r.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      ))}

      <h2>How to request</h2>
      <p>
        Email <ContactMailto email={config.business.contactEmail} /> with purchase email, payment /
        receipt ID (Xflow transaction intent), Foundry license key if issued, and a short reason. We aim
        to respond within 3 business days. Approved refunds are issued via Xflow where the Xflow
        account supports them — this site does not call a public refund API.
      </p>

      <h2>Chargebacks</h2>
      <p>
        Please contact us before filing a chargeback. Fraudulent chargebacks may result in permanent
        account and license revocation.
      </p>
    </LegalShell>
  );
}

export default async function LegalRefundsPage() {
  return <RefundBody />;
}

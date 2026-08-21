import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/LegalShell";
import { BRAND } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal/resolve";
import { ContactMailto } from "@/lib/legal/sections";

export const metadata: Metadata = {
  title: `Data Deletion — ${BRAND.name}`,
  description: `How deletion requests work for ${BRAND.name}.`,
};

export default async function DataDeletionPage() {
  const config = await getLegalConfig();

  return (
    <LegalShell title="Data Deletion" config={config}>
      <p>
        We do <strong>not</strong> falsely claim full erasure across every processor (Supabase Auth,
        Xflow, Resend, OpenAI, Vercel logs) from a single button. Deletion is a workflow
        with automated steps where safe and operator steps for external systems.
      </p>

      <h2>What you can request</h2>
      <ul>
        <li>
          Soft-delete / queue via <Link href="/legal/rights">Data rights</Link> (type: Delete)
        </li>
        <li>Email <ContactMailto email={config.business.privacyEmail} /></li>
      </ul>

      <h2>What this app may automate</h2>
      <ul>
        <li>
          FREE Scout waitlist-style Subscriber rows (no paid tier / no payment IDs) may be deleted
          when verified
        </li>
        <li>Consent preference records for your email</li>
        <li>Audit log of the request itself (retained as evidence of the request)</li>
      </ul>

      <h2>What requires operator / processor action</h2>
      <ul>
        <li>Supabase Auth user deletion</li>
        <li>Paid Subscriber / LicenseKey rows needed for accounting, fraud, or license disputes</li>
        <li>Xflow payment history (and any legacy processor records still in those dashboards)</li>
        <li>Email provider logs; AI provider logs if messages were sent</li>
        <li>Hosting/CDN access logs</li>
      </ul>

      <p>
        Payment and tax records may be retained as described in{" "}
        <Link href="/legal/data-retention">Data retention</Link> even after account closure.
      </p>
    </LegalShell>
  );
}

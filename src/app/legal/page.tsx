import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/LegalShell";
import { BRAND } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal/resolve";
import { LEGAL_NAV, OperatorContactBlock } from "@/lib/legal/sections";

export const metadata: Metadata = {
  title: `Legal — ${BRAND.name}`,
  description: `Legal documents and privacy controls for ${BRAND.name}.`,
};

export default async function LegalIndexPage() {
  const config = await getLegalConfig();

  return (
    <LegalShell title="Legal center" config={config}>
      <p>
        Policies below are generated from this deployment&apos;s configuration (integrations,
        pricing plans, and operator env). They are <strong>not</strong> a claim of GDPR/CPRA/DPDP
        certification and are <strong>not</strong> legal advice.
      </p>
      <ul>
        {LEGAL_NAV.filter((l) => l.href !== "/legal").map((l) => (
          <li key={l.href}>
            <Link href={l.href}>{l.label}</Link>
          </li>
        ))}
        <li>
          <Link href="/refund">Refunds (legacy URL)</Link> — redirects content to the same rules as{" "}
          <Link href="/legal/refunds">/legal/refunds</Link>
        </li>
      </ul>
      <OperatorContactBlock config={config} />
      <p className="text-sm text-[var(--muted)]">
        Chat ({config.ai.chatWidgetName}) is a product guide, not a public community network — there
        are no separate &quot;community guidelines&quot; for user-generated social content.
      </p>
    </LegalShell>
  );
}

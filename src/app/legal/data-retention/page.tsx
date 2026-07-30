import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/LegalShell";
import { BRAND } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal/resolve";

export const metadata: Metadata = {
  title: `Data Retention — ${BRAND.name}`,
  description: `How long ${BRAND.name} retains categories of data.`,
};

export default async function DataRetentionPage() {
  const config = await getLegalConfig();

  return (
    <LegalShell title="Data Retention" config={config}>
      <p>
        Periods below are reasonable defaults for a digital SaaS research + kit business. They are{" "}
        <strong>operator-configurable</strong> and are not a legal certification that they meet
        every jurisdiction&apos;s minimum or maximum.
      </p>
      <ul>
        {config.retention.map((r) => (
          <li key={r.id}>
            <strong>{r.dataCategory}:</strong> {r.period}. {r.notes}
            {r.operatorConfigurable ? " (operator-configurable)" : ""}
          </li>
        ))}
      </ul>
      <p>
        Deletion requests: <Link href="/legal/data-deletion">Data deletion</Link> and{" "}
        <Link href="/legal/rights">rights form</Link>.
      </p>
    </LegalShell>
  );
}

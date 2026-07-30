import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/LegalShell";
import { BRAND } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal/resolve";

export const metadata: Metadata = {
  title: `Subscriptions — ${BRAND.name}`,
  description: `How ${BRAND.name} Vault subscriptions renew and cancel.`,
};

export default async function SubscriptionsPage() {
  const config = await getLegalConfig();
  const s = config.subscriptions;

  return (
    <LegalShell title="Subscriptions & cancellation" config={config}>
      <p>
        Digital research subscriptions and one-time digital licenses. There is no physical shipping.
      </p>

      <h2>Recurring plans</h2>
      <ul>
        {s.recurringPlans.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <ul>
        <li>
          Cancel anytime when recurring billing is active:{" "}
          {s.cancelAnytime ? "yes" : "see plan terms"}.
        </li>
        <li>
          Access through paid period after cancel:{" "}
          {s.accessThroughPaidPeriod ? "yes" : "see plan terms"}.
        </li>
      </ul>

      <h2>One-time / prepaid plans</h2>
      <ul>
        {s.oneTimePlans.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>

      <h2>Notes</h2>
      <ul>
        {s.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>

      <p>
        Billing issues: see <Link href="/legal/refunds">Refunds</Link> and Pricing. Cancellation of
        processor-side subscriptions may require contacting support if self-serve cancel is not yet
        wired in-product.
      </p>
    </LegalShell>
  );
}

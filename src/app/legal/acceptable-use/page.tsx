import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";
import { BRAND } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal/resolve";

export const metadata: Metadata = {
  title: `Acceptable Use — ${BRAND.name}`,
  description: `Acceptable use rules for ${BRAND.name}.`,
};

export default async function AcceptableUsePage() {
  const config = await getLegalConfig();

  return (
    <LegalShell title="Acceptable Use Policy" config={config}>
      <p>
        This policy applies to the {config.productName} website, Vault, Foundry downloads, waitlist,
        magic-link auth, and the {config.ai.chatWidgetName} product guide chat. There is no
        public social network or user-generated community forum.
      </p>

      <h2>Allowed</h2>
      <ul>
        <li>Using Vault research for your own product decisions</li>
        <li>Using Foundry under your purchased Solo or Agency license terms</li>
        <li>Asking {config.ai.chatWidgetName} product/pricing/method questions in good faith</li>
      </ul>

      <h2>Prohibited</h2>
      <ul>
        <li>Attempting to break, scrape abusively, or overload the service</li>
        <li>Reverse-engineering or forging payment / webhook flows</li>
        <li>Sharing, selling, or publicly posting Foundry license keys or zip packages</li>
        <li>Using the service to distribute malware, illegal content, or fraud</li>
        <li>Impersonating others or probing other users&apos; data</li>
        <li>Circumventing rate limits, AuthZ gates, or download caps</li>
      </ul>

      <h2>Enforcement</h2>
      <p>
        We may rate-limit, suspend, or revoke access for violations, chargebacks, or abuse without
        prior notice when needed to protect the service or other customers.
      </p>
    </LegalShell>
  );
}

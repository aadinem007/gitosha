import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/LegalShell";
import { BRAND } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal/resolve";
import { ContactMailto, ProcessorsList, RegionModules } from "@/lib/legal/sections";

export const metadata: Metadata = {
  title: `Privacy Policy — ${BRAND.name}`,
  description: `How ${BRAND.name} collects, uses, and stores personal data — generated from this deployment's configuration.`,
};

export default async function PrivacyPage() {
  const config = await getLegalConfig();
  const activeProcessors = config.processors.filter((p) => p.active).map((p) => p.name);

  return (
    <LegalShell title="Privacy Policy" config={config}>
      <p>
        This Privacy Policy explains what data <strong>{config.productName}</strong> collects and how
        we use it when you visit our site, join the Scout waitlist, sign in with a magic link, use{" "}
        {config.ai.chatWidgetName}, or buy Vault / Foundry digital products. It is generated from
        this deployment&apos;s real integrations ({activeProcessors.join(", ") || "hosting only"}),
        not a generic template pasted from another company.
      </p>
      {(config.business.entityNameConfigured || config.business.addressConfigured) && (
        <p>
          {config.business.entityNameConfigured ? <>Operator: {config.business.entityName}. </> : null}
          {config.business.addressConfigured ? <>Address: {config.business.address}</> : null}
        </p>
      )}

      <h2>1. Data we collect</h2>
      <ul>
        <li>
          <strong>Account &amp; contact:</strong> email address (magic-link login via Supabase,
          Scout waitlist upsert into Subscriber, purchases).
        </li>
        <li>
          <strong>Billing:</strong> payment references from{" "}
          {config.processors
            .filter((p) => p.active && p.id === "xflow")
            .map((p) => p.name)
            .join(" / ") || "the configured payment provider"}{" "}
          (customer, session, payment, or subscription IDs). We do not store full card numbers.
        </li>
        <li>
          <strong>Product records:</strong> subscription tier/status, Foundry license keys, download
          counts for fulfillment.
        </li>
        <li>
          <strong>Technical:</strong> standard server / hosting logs (IP, user agent) for abuse
          prevention. Chat messages to {config.ai.chatWidgetName} are processed to answer your
          question and may be rate-limited
          {config.ai.usesOptionalLlm
            ? `; when AI processing is enabled, text may be sent to ${config.ai.llmProvider}`
            : ""}
          .
        </li>
        <li>
          <strong>Consent:</strong> cookie/AI preference choices stored in localStorage and,
          optionally, a ConsentRecord when signed in.
        </li>
      </ul>

      <h2>2. How we use data</h2>
      <ul>
        <li>Deliver Vault access and Foundry downloads</li>
        <li>Send transactional messages (login links, purchase confirmations when email is configured)</li>
        <li>Prevent fraud, spam, and abuse</li>
        <li>Answer support / product questions via {config.ai.chatWidgetName}</li>
      </ul>
      <p>We do not sell your personal data for money.</p>

      <ProcessorsList config={config} />

      <h2>4. Cookies</h2>
      <p>
        See the{" "}
        <Link href="/legal/cookies">Cookie Policy</Link> and{" "}
        <Link href="/legal/preferences">preference center</Link>. Necessary auth cookies are always
        on. Categories that are not integrated (e.g. marketing pixels) are not enabled in this
        config.
      </p>

      <h2>5. Retention</h2>
      <p>
        See <Link href="/legal/data-retention">Data Retention</Link>. Defaults are
        operator-configurable and are not a certification of legal minimums.
      </p>

      <h2>6. Your choices &amp; rights</h2>
      <p>
        Use <Link href="/legal/rights">Data rights requests</Link> or email{" "}
        <ContactMailto email={config.business.privacyEmail} />. Export/delete tooling covers what
        this app can safely automate and documents processor limitations.
      </p>

      <RegionModules config={config} />

      <h2>8. Children</h2>
      <p>{config.children.statement}</p>

      <h2>9. AI</h2>
      <p>
        {config.ai.disclosure} Full disclosure: <Link href="/legal/ai">AI disclosure</Link>.
      </p>

      <h2>10. Shipping</h2>
      <p>{config.shipping.delivery}</p>

      <h2>11. Changes</h2>
      <p>
        Material changes are published with a new version and effective date (see admin legal
        publish flow). The version block at the top of this page is authoritative for this
        deployment.
      </p>

      <h2>12. Contact</h2>
      <p>
        Privacy: <ContactMailto email={config.business.privacyEmail} />
        {config.business.dpoEmail ? (
          <>
            {" "}
            · DPO: <ContactMailto email={config.business.dpoEmail} />
          </>
        ) : null}
      </p>
    </LegalShell>
  );
}

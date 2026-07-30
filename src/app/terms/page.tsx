import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/LegalShell";
import { BRAND } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal/resolve";
import { ContactMailto } from "@/lib/legal/sections";

export const metadata: Metadata = {
  title: `Terms of Service — ${BRAND.name}`,
  description: `Terms governing use of ${BRAND.name} Vault subscriptions and Foundry licenses.`,
};

export default async function TermsPage() {
  const config = await getLegalConfig();

  return (
    <LegalShell title="Terms of Service" config={config}>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern access to and use of {config.productName}{" "}
        websites, products, and services operated under {config.business.entityName} (&quot;we,&quot;
        &quot;us&quot;). By creating an account, joining the waitlist, or purchasing a plan, you
        agree to these Terms.
      </p>

      <h2>1. Products</h2>
      <p>
        <strong>Build-Intel Vault</strong> is a research subscription providing scored software
        opportunities, teardowns, and related materials according to your plan (Scout, Operator,
        Studio, or annual variants).
      </p>
      <p>
        <strong>Foundry</strong> is a one-time digital license to a production SaaS starter codebase
        delivered as a downloadable package after payment. Solo and Agency tiers differ in permitted
        commercial use as described at checkout and in the license file inside the package.
      </p>
      <p>{config.shipping.delivery}</p>

      <h2>2. Accounts &amp; access</h2>
      <p>
        You must provide a valid email address. Vault access is tied to the email used at purchase
        or signup via magic-link authentication. You are responsible for activity under your account
        and for keeping login links private. We may suspend access for abuse, fraud, chargebacks, or
        material Terms violations.
      </p>

      <h2>3. License (Foundry)</h2>
      <p>
        <strong>Solo:</strong> use the kit to build and operate one commercial product you own.
        Sharing the zip publicly or reselling the kit as a competing starter is not allowed.
      </p>
      <p>
        <strong>Agency:</strong> use on unlimited client projects; white-label is allowed. You may
        not resell Foundry itself as a competing starter kit. Priority support means we respond to
        Agency buyers before standard inquiries when capacity is limited — it is not a guaranteed
        SLA or custom development contract.
      </p>
      <p>
        Foundry is provided as-is. You are responsible for configuring your own hosting, keys, and
        compliance for any product you ship with it.
      </p>

      <h2>4. Research disclaimer (Vault)</h2>
      <p>
        Vault content is opinionated research, not financial, legal, or investment advice. Scores
        are estimates. Markets change. You alone decide what to build and accept all risk of
        building or not building any opportunity.
      </p>

      <h2>5. Payments</h2>
      <p>
        List prices are shown in USD. Payments are processed by the configured checkout provider
        (see Privacy processors for what is active in this deployment). Prices on the Pricing page
        apply at checkout. Operator launch pricing may change after the early-operator cap.
        Subscriptions renew until canceled where recurring billing is enabled; one-time purchases do
        not auto-renew. Details:{" "}
        <Link href="/legal/subscriptions">Subscriptions</Link>.
      </p>

      <h2>6. Refunds</h2>
      <p>
        Refund eligibility is described in our{" "}
        <Link href="/legal/refunds">Refund Policy</Link> (also mirrored at{" "}
        <Link href="/refund">/refund</Link>). Digital goods that have been downloaded may have
        limited or no refund eligibility.
      </p>

      <h2>7. Acceptable use</h2>
      <p>
        See <Link href="/legal/acceptable-use">Acceptable Use</Link>. Do not attempt to break,
        scrape abusively, reverse-engineer payment flows, share license keys, or use{" "}
        {config.productName} to distribute malware or illegal content.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        {config.productName} branding, site design, Vault research text, and scoring methodology
        remain our property. Foundry source is licensed to you under these Terms and the in-package
        license — ownership of the kit IP remains with us except for the rights expressly granted.
        See <Link href="/legal/copyright">Copyright &amp; trademark</Link>.
      </p>

      <h2>9. AI chat</h2>
      <p>
        {config.ai.disclosure} See <Link href="/legal/ai">AI disclosure</Link>.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, {config.productName} is not liable for indirect,
        incidental, or consequential damages, lost profits, or business interruption arising from
        use of the site, Vault, or Foundry. Our total liability for any claim related to a purchase
        is limited to the amount you paid us for that purchase in the three months before the claim.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update these Terms. Material changes are reflected by a new version and effective
        date. Continued use after updates constitutes acceptance where permitted by law.
      </p>

      <h2>12. Contact &amp; governing law</h2>
      <p>
        Email: <ContactMailto email={config.business.contactEmail} />
      </p>
      <p>
        Governing law: {config.business.governingLaw}. {config.business.jurisdictionNote}
      </p>
    </LegalShell>
  );
}

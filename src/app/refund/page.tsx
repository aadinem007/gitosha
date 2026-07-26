import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Refund Policy — ${BRAND.name}`,
  description: `Refund rules for ${BRAND.name} Vault subscriptions and Foundry licenses.`,
};

export default function RefundPage() {
  return (
    <LegalShell title="Refund Policy" updated="21 July 2026">
      <p>
        This Refund Policy applies to purchases made on {BRAND.name} (USD via Stripe by default).
        Please read it before buying digital products.
      </p>

      <h2>1. Foundry (Solo, Agency, Launch Bundle)</h2>
      <p>
        Foundry is a digital download delivered immediately after payment via the License portal.
        Because the full source package can be obtained right away:
      </p>
      <ul>
        <li>
          <strong>If you have not downloaded</strong> the zip yet, contact us within{" "}
          <strong>7 days</strong> of purchase for a refund review.
        </li>
        <li>
          <strong>After a successful download</strong>, refunds are generally not available, except
          where required by law or where we confirm a technical failure that prevented legitimate
          access despite a valid payment.
        </li>
      </ul>

      <h2>2. Vault subscriptions (Operator, Studio, Annual)</h2>
      <ul>
        <li>
          You may cancel future renewals anytime (when recurring billing is active) — access
          continues through the paid period.
        </li>
        <li>
          For first-time Operator/Studio purchases, if you have not meaningfully used premium Vault
          content, contact us within <strong>7 days</strong> for a goodwill refund review.
        </li>
        <li>
          Annual plans follow the same 7-day window for unused access. After substantial use of
          premium teardowns/exports, refunds are discretionary.
        </li>
      </ul>

      <h2>3. How to request</h2>
      <p>
        Email{" "}
        <a href="mailto:aaditya.shah8005@gmail.com">aaditya.shah8005@gmail.com</a> with:
      </p>
      <ul>
        <li>Purchase email</li>
        <li>Stripe payment / receipt ID (or Razorpay payment ID if used)</li>
        <li>License key (Foundry) if issued</li>
        <li>Short reason</li>
      </ul>
      <p>
        We aim to respond within 3 business days. Approved refunds are issued via the original
        payment processor to the original payment method.
      </p>

      <h2>4. Chargebacks</h2>
      <p>
        Please contact us before filing a chargeback — we can usually resolve access issues faster.
        Fraudulent chargebacks may result in permanent account and license revocation.
      </p>

      <h2>5. Changes</h2>
      <p>We may update this policy; the date above will reflect the latest version.</p>
    </LegalShell>
  );
}

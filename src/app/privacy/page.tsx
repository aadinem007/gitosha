import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy — Shipyard",
  description: "How Shipyard collects, uses, and stores personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="21 July 2026">
      <p>
        This Privacy Policy explains what data Shipyard collects and how we use it when you visit
        our site, join the waitlist, sign in, or buy Vault / Foundry products.
      </p>

      <h2>1. Data we collect</h2>
      <ul>
        <li>
          <strong>Account &amp; contact:</strong> email address (magic-link login, waitlist,
          purchases).
        </li>
        <li>
          <strong>Billing:</strong> payment references from Razorpay (payment/order/subscription
          IDs). We do not store full card numbers — Razorpay processes cards/UPI.
        </li>
        <li>
          <strong>Product records:</strong> subscription tier, license keys, download counts for
          Foundry fulfillment.
        </li>
        <li>
          <strong>Technical:</strong> standard server logs (IP, user agent) used for abuse
          prevention and reliability. Chat messages sent to Yardhand are processed to answer your
          question and may be rate-limited.
        </li>
      </ul>

      <h2>2. How we use data</h2>
      <ul>
        <li>Deliver Vault access and Foundry downloads</li>
        <li>Send transactional messages (login links, purchase confirmations when email is configured)</li>
        <li>Prevent fraud, spam, and abuse</li>
        <li>Improve the product and answer support requests</li>
      </ul>
      <p>We do not sell your personal data.</p>

      <h2>3. Processors</h2>
      <p>We rely on trusted processors, including:</p>
      <ul>
        <li>Supabase — authentication and database hosting</li>
        <li>Vercel — website hosting</li>
        <li>Razorpay — payments</li>
        <li>Resend (optional) — transactional email when configured</li>
      </ul>

      <h2>4. Retention</h2>
      <p>
        We keep account, purchase, and license records as long as needed to provide the service,
        meet legal/accounting obligations, and resolve disputes. You may request deletion of
        waitlist or account data subject to records we must retain for payments.
      </p>

      <h2>5. Your choices</h2>
      <p>
        Request access, correction, or deletion by emailing{" "}
        <a href="mailto:aaditya.shah8005@gmail.com">aaditya.shah8005@gmail.com</a>. Unsubscribe
        from marketing-style weekly issues by replying to those emails or contacting us (product
        / billing emails may still be required for purchases).
      </p>

      <h2>6. Children</h2>
      <p>Shipyard is intended for adults building businesses. We do not knowingly collect data from children under 16.</p>

      <h2>7. Changes</h2>
      <p>We may update this policy; the date at the top will change when we do.</p>

      <h2>8. Contact</h2>
      <p>
        <a href="mailto:aaditya.shah8005@gmail.com">aaditya.shah8005@gmail.com</a>
      </p>
    </LegalShell>
  );
}

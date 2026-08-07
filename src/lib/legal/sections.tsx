import Link from "next/link";
import type { ReactNode } from "react";
import { legalFooterDisclaimer, regionDisclaimer } from "@/lib/legal/config";
import { isLegalEmailConfigured } from "@/lib/legal/email";
import type { LegalConfig } from "@/lib/legal/types";

export function formatDisplayDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const SOFT_CONTACT = "Contact us via the site support channels.";

export function ContactMailto({ email, children }: { email: string; children?: ReactNode }) {
  if (!isLegalEmailConfigured(email)) {
    return <span>{children ?? SOFT_CONTACT}</span>;
  }
  return <a href={`mailto:${email}`}>{children ?? email}</a>;
}

/** Public operator contact — omit env hints; soft line when emails are unset. */
export function OperatorContactBlock({ config }: { config: LegalConfig }) {
  const contactOk = isLegalEmailConfigured(config.business.contactEmail);
  const privacyOk = isLegalEmailConfigured(config.business.privacyEmail);
  if (!contactOk && !privacyOk) {
    return (
      <>
        <h2>Operator contact</h2>
        <p>{SOFT_CONTACT}</p>
      </>
    );
  }
  return (
    <>
      <h2>Operator contact</h2>
      <p>
        {contactOk ? <ContactMailto email={config.business.contactEmail} /> : null}
        {contactOk && privacyOk ? " · Privacy: " : null}
        {!contactOk && privacyOk ? "Privacy: " : null}
        {privacyOk ? <ContactMailto email={config.business.privacyEmail} /> : null}
      </p>
    </>
  );
}

export function LegalMetaBlock({ config }: { config: LegalConfig }) {
  return (
    <div className="surface p-4 text-sm text-[var(--muted)]">
      <p>
        <strong className="text-[var(--ink)]">Version</strong> {config.version}
      </p>
      <p className="mt-1">
        <strong className="text-[var(--ink)]">Effective</strong>{" "}
        {formatDisplayDate(config.effectiveDate)}
      </p>
      <p className="mt-1">
        <strong className="text-[var(--ink)]">Last updated</strong>{" "}
        {formatDisplayDate(config.lastUpdated)}
      </p>
      <p className="mt-3 text-xs leading-relaxed">{legalFooterDisclaimer()}</p>
    </div>
  );
}

export function RegionModules({ config }: { config: LegalConfig }) {
  const enabled = config.regions.filter((r) => r.enabled);
  if (enabled.length === 0) {
    return (
      <>
        <h2>Regional notices</h2>
        <p>No regional notice modules are currently enabled for this deployment.</p>
        <p className="text-sm text-[var(--muted)]">{regionDisclaimer()}</p>
      </>
    );
  }
  return (
    <>
      <h2>Regional notices (informational)</h2>
      <p className="text-sm text-[var(--muted)]">{regionDisclaimer()}</p>
      {enabled.map((r) => (
        <div key={r.id} className="mt-4">
          <h3 className="font-display text-lg tracking-wide text-[var(--ink)]">{r.title}</h3>
          <p>{r.summary}</p>
          <ul>
            {r.rightsBullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      ))}
      <p>
        Submit requests via{" "}
        <Link href="/legal/rights" className="underline">
          Data rights
        </Link>{" "}
        or email <ContactMailto email={config.business.privacyEmail} />.
      </p>
    </>
  );
}

export function ProcessorsList({ config }: { config: LegalConfig }) {
  const active = config.processors.filter((p) => p.active);
  const inactive = config.processors.filter((p) => !p.active && p.optional);
  return (
    <>
      <h2>Third-party processors</h2>
      <p>
        Based on this deployment&apos;s configuration (not a generic vendor list). We do not claim
        certification for any processor.
      </p>
      <ul>
        {active.map((p) => (
          <li key={p.id}>
            <strong>{p.name}</strong> — {p.purpose} Data categories: {p.dataCategories.join("; ")}.{" "}
            <a href={p.policyUrl} rel="noopener noreferrer" target="_blank">
              Privacy policy
            </a>
            .
          </li>
        ))}
      </ul>
      {inactive.length > 0 && (
        <>
          <h3 className="font-display text-lg tracking-wide text-[var(--ink)]">
            Optional / inactive in this environment
          </h3>
          <ul>
            {inactive.map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong> — configured as optional; not active with current keys.{" "}
                {p.purpose}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

export const LEGAL_NAV: { href: string; label: string }[] = [
  { href: "/legal", label: "Legal index" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/legal/refunds", label: "Refunds" },
  { href: "/legal/subscriptions", label: "Subscriptions" },
  { href: "/legal/acceptable-use", label: "Acceptable use" },
  { href: "/legal/data-retention", label: "Data retention" },
  { href: "/legal/data-deletion", label: "Data deletion" },
  { href: "/legal/copyright", label: "Copyright" },
  { href: "/legal/dmca", label: "DMCA" },
  { href: "/legal/accessibility", label: "Accessibility" },
  { href: "/legal/ai", label: "AI disclosure" },
  { href: "/legal/children", label: "Children" },
  { href: "/legal/preferences", label: "Preferences" },
  { href: "/legal/rights", label: "Your rights" },
];

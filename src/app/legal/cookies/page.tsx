import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/LegalShell";
import { BRAND } from "@/lib/brand";
import { enabledCookieCategories } from "@/lib/legal/config";
import { getLegalConfig } from "@/lib/legal/resolve";

export const metadata: Metadata = {
  title: `Cookie Policy — ${BRAND.name}`,
  description: `Cookies and similar technologies used by ${BRAND.name}.`,
};

export default async function CookiesPage() {
  const config = await getLegalConfig();
  const enabled = enabledCookieCategories(config);
  const disabled = config.cookies.filter((c) => !c.enabled && !c.required);

  return (
    <LegalShell title="Cookie Policy" config={config}>
      <p>
        This policy lists cookie / storage categories that exist in this product&apos;s
        configuration. We do not invent marketing or analytics cookies that are not integrated.
      </p>

      <h2>Categories in use</h2>
      {enabled.map((c) => (
        <div key={c.id}>
          <h3 className="font-display text-lg tracking-wide text-[var(--ink)]">
            {c.name}
            {c.required ? " (required)" : ""}
          </h3>
          <p>{c.description}</p>
          {c.examples.length > 0 && (
            <ul>
              {c.examples.map((ex) => (
                <li key={ex}>{ex}</li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {disabled.length > 0 && (
        <>
          <h2>Not enabled in this deployment</h2>
          <ul>
            {disabled.map((c) => (
              <li key={c.id}>
                <strong>{c.name}</strong> — {c.description} (no scripts loaded for this category)
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Third-party checkout</h2>
      <p>
        Checkout uses Xflow UPI. Xflow may set cookies on its own domains subject to its policy. We
        do not control those cookies.
      </p>

      <h2>Manage preferences</h2>
      <p>
        Use the <Link href="/legal/preferences">preference center</Link> or the on-site consent
        banner. Necessary cookies cannot be disabled while you remain signed in.
      </p>
    </LegalShell>
  );
}

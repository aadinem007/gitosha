import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";
import { BRAND } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal/resolve";
import { ContactMailto } from "@/lib/legal/sections";

export const metadata: Metadata = {
  title: `Accessibility — ${BRAND.name}`,
  description: `Accessibility statement for ${BRAND.name}.`,
};

export default async function AccessibilityPage() {
  const config = await getLegalConfig();

  return (
    <LegalShell title="Accessibility" config={config}>
      <p>{config.accessibility.statement}</p>
      <ul>
        <li>Skip link to main content on every page</li>
        <li>Semantic landmarks and form labels on auth/checkout flows</li>
        <li>Keyboard focus styles for interactive controls</li>
      </ul>
      <p>
        Report accessibility barriers to{" "}
        <ContactMailto email={config.accessibility.contactEmail} />. We do not claim WCAG 2.x
        certification.
      </p>
    </LegalShell>
  );
}

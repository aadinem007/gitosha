import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";
import { BRAND } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal/resolve";
import { ContactMailto } from "@/lib/legal/sections";

export const metadata: Metadata = {
  title: `Children's Privacy — ${BRAND.name}`,
  description: `Children's privacy statement for ${BRAND.name}.`,
};

export default async function ChildrenPage() {
  const config = await getLegalConfig();

  return (
    <LegalShell title="Children's privacy" config={config}>
      <p>{config.children.statement}</p>
      <p>
        Audience: {config.children.audience}. Minimum age: {config.children.minAge}+.
      </p>
      <p>
        Contact: <ContactMailto email={config.business.privacyEmail} />
      </p>
    </LegalShell>
  );
}

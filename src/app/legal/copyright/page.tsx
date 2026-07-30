import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/LegalShell";
import { BRAND } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal/resolve";
import { ContactMailto } from "@/lib/legal/sections";

export const metadata: Metadata = {
  title: `Copyright & Trademark — ${BRAND.name}`,
  description: `Copyright and trademark notice for ${BRAND.name}.`,
};

export default async function CopyrightPage() {
  const config = await getLegalConfig();

  return (
    <LegalShell title="Copyright & trademark" config={config}>
      <h2>Copyright</h2>
      <p>
        © {new Date().getFullYear()} {config.business.entityName}. All rights reserved in the
        website design, Vault research text, scoring methodology descriptions, and marketing copy,
        except where third-party licenses apply.
      </p>
      <p>
        Foundry source code is licensed to purchasers under the Terms and the in-package license —
        ownership of the kit IP remains with us except for rights expressly granted.
      </p>

      <h2>Trademark</h2>
      <p>
        {config.productName}, {BRAND.products.vault}, {BRAND.products.foundry}, and related marks
        are trademarks or product names of the operator. No trademark registration status is claimed
        here unless separately confirmed by counsel.
      </p>

      <h2>Infringement notices</h2>
      <p>
        See <Link href="/legal/dmca">DMCA / copyright notices</Link>. Contact:{" "}
        <ContactMailto email={config.business.contactEmail} />.
      </p>
    </LegalShell>
  );
}

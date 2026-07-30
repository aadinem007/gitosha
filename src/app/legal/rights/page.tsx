import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";
import { DataRightsForm } from "@/components/DataRightsForm";
import { BRAND } from "@/lib/brand";
import { getSessionEmail } from "@/lib/legal/admin";
import { getLegalConfig } from "@/lib/legal/resolve";
import { RegionModules } from "@/lib/legal/sections";

export const metadata: Metadata = {
  title: `Your data rights — ${BRAND.name}`,
  description: `Submit access, correction, deletion, and export requests for ${BRAND.name}.`,
};

export default async function RightsPage() {
  const config = await getLegalConfig();
  const email = await getSessionEmail();

  return (
    <LegalShell title="Your data rights" config={config}>
      <p>
        Submit a request below. We rate-limit this endpoint and never return another user&apos;s
        data. Export of license keys is only available when you are signed in as the owner email.
        Deletion does not instantly erase data at every payment or email processor — see Data
        deletion.
      </p>
      <DataRightsForm signedInEmail={email} />
      <RegionModules config={config} />
    </LegalShell>
  );
}

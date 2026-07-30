import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";
import { ConsentPreferencesForm } from "@/components/ConsentPreferencesForm";
import { BRAND } from "@/lib/brand";
import { enabledCookieCategories } from "@/lib/legal/config";
import { getLegalConfig } from "@/lib/legal/resolve";

export const metadata: Metadata = {
  title: `Privacy preferences — ${BRAND.name}`,
  description: `Manage cookie and AI processing preferences for ${BRAND.name}.`,
};

export default async function PreferencesPage() {
  const config = await getLegalConfig();
  const categories = enabledCookieCategories(config);

  return (
    <LegalShell title="Privacy preferences" config={config}>
      <p>
        Change optional categories anytime. Necessary authentication cookies remain required while
        you use signed-in features.
      </p>
      <ConsentPreferencesForm policyVersion={config.version} categories={categories} />
    </LegalShell>
  );
}

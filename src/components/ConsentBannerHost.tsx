import { ConsentBanner } from "@/components/ConsentBanner";
import { enabledCookieCategories } from "@/lib/legal/config";
import { getLegalConfig } from "@/lib/legal/resolve";

/** Server wrapper so the client banner receives live enabled categories. */
export async function ConsentBannerHost() {
  const config = await getLegalConfig();
  const categories = enabledCookieCategories(config);
  return <ConsentBanner policyVersion={config.version} categories={categories} />;
}

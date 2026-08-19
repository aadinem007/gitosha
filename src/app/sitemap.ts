import { SEED_IDEAS, totalScore } from "@/lib/ideas-data";
import { siteUrl } from "@/lib/brand";

export default function sitemap() {
  const base = siteUrl();
  const staticRoutes = [
    "",
    "/pricing",
    "/foundry",
    "/foundry-kit",
    "/vault",
    "/login",
    "/method",
    "/about",
    "/license",
    "/faq",
    "/whats-inside",
    "/terms",
    "/privacy",
    "/refund",
    "/legal",
    "/legal/cookies",
    "/legal/refunds",
    "/legal/subscriptions",
    "/legal/acceptable-use",
    "/legal/data-retention",
    "/legal/data-deletion",
    "/legal/copyright",
    "/legal/dmca",
    "/legal/accessibility",
    "/legal/ai",
    "/legal/children",
    "/legal/preferences",
    "/legal/rights",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
  const ideaRoutes = [...SEED_IDEAS]
    .sort((a, b) => totalScore(b.scores) - totalScore(a.scores))
    .map((idea) => ({
      url: `${base}/ideas/${idea.slug}`,
      lastModified: new Date(),
    }));
  return [...staticRoutes, ...ideaRoutes];
}

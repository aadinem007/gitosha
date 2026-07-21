import { SEED_IDEAS, totalScore } from "@/lib/ideas-data";

export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shipyard-omega-opal.vercel.app";
  const staticRoutes = ["", "/pricing", "/foundry-kit", "/vault", "/login"].map((path) => ({
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

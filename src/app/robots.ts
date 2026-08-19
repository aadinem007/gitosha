import { siteUrl } from "@/lib/brand";

export default function robots() {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/research",
          "/license",
          "/login",
          "/checkout/",
          "/admin/",
          "/account/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

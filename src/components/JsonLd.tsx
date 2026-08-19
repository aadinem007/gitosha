import { BRAND, siteUrl } from "@/lib/brand";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: BRAND.name,
        url: siteUrl(),
        description: BRAND.description,
      },
      {
        "@type": "WebSite",
        name: BRAND.name,
        url: siteUrl(),
        description: BRAND.tagline,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

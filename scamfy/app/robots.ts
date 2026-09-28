import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scamfy.org";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/intel", "/privacy", "/terms"],
        disallow: ["/api/", "/admin/", "/cases/", "/design-system/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

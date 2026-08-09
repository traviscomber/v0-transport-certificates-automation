import type { MetadataRoute } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://transn3uralia.vercel.app"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/contact", "/mining/landing", "/llms.txt"],
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/executive/",
          "/conductor/",
          "/driver/",
          "/dispatcher/",
          "/diagnostic/",
          "/diagnostic-final/",
          "/ai-scanner/",
          "/auth/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}

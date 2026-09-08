import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://chileflota.app",
      changeFrequency: "weekly",
      priority: 1,
    },
  ]
}

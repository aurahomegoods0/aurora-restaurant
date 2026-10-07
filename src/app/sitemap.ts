import type { MetadataRoute } from 'next';
import { restaurantConfig } from '../../restaurant.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = restaurantConfig.siteUrl;

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}

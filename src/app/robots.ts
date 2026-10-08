import type { MetadataRoute } from 'next';
import { restaurantConfig } from '../../restaurant.config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin', '/admin/'],
      },
    ],
    sitemap: `${restaurantConfig.siteUrl}/sitemap.xml`,
    host: restaurantConfig.siteUrl,
  };
}

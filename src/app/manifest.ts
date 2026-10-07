import type { MetadataRoute } from 'next';
import { restaurantConfig } from '../../restaurant.config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${restaurantConfig.name} Restaurant`,
    short_name: restaurantConfig.name,
    description: restaurantConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#0A0A0A',
    lang: 'uz',
    icons: [
      { src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}

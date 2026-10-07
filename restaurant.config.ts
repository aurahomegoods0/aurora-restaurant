export const restaurantConfig = {
  /** Public site URL (Vercel subdomain). Update if you add a custom domain. */
  siteUrl: 'https://aurora-restaurant-ecru.vercel.app',
  name: 'AURORA',
  tagline: 'Unparalleled Fine-Dining Experience',
  description: 'Toshkent markazidagi eng hashamatli va unikal taomlar restorani.',
  contact: {
    phone: '+998 71 200 00 00',
    email: 'info@aurora.uz',
    address: 'Toshkent sh., Amir Temur shoh ko\'chasi, 1',
    workingHours: 'Dushanba - Yakshanba: 10:00 - 23:00',
    mapEmbedUrl:
      'https://maps.google.com/maps?q=Amir%20Temur%20Avenue%201%2C%20Tashkent&hl=uz&z=16&output=embed',
    mapDirectionsUrl:
      'https://www.google.com/maps/dir/?api=1&destination=Amir+Temur+Avenue+1,+Tashkent',
    geo: { lat: 41.311151, lng: 69.279737 },
  },
  openingHours: { open: '10:00', close: '23:00' },
  /** Menu prices are stored in USD; UZS is shown as an approximation. */
  currency: { usdToUzs: 12800 },
  socials: {
    instagram: 'https://instagram.com/aurora.restaurant',
    telegram: 'https://t.me/aurora_restaurant',
    facebook: 'https://facebook.com/aurora.restaurant',
  },
  colors: {
    primary: '#D4AF37',
    backgroundDark: '#0A0A0A',
    cardDark: '#121212',
  },
  defaultLanguage: 'uz',
  supportedLanguages: ['uz', 'en', 'ru'],
} as const;

export type RestaurantConfig = typeof restaurantConfig;
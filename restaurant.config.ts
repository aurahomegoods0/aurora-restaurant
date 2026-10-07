export const restaurantConfig = {
  name: 'AURORA',
  tagline: 'Unparalleled Fine-Dining Experience',
  description: 'Toshkent markazidagi eng hashamatli va unikal taomlar restorani.',
  contact: {
    phone: '+998 71 200 00 00',
    email: 'info@aurora.uz',
    address: 'Toshkent sh., Amir Temur shoh ko\'chasi, 1',
    workingHours: 'Dushanba - Yakshanba: 10:00 - 23:00',
  },
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
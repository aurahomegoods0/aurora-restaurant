import type { Language } from '@/context/LanguageContext';

export type Localized = Record<Language, string>;

export const chefPortrait =
  'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=70';

export const chefName = 'Kamran Alimov';

export const galleryImages: {
  id: string;
  src: string;
  span: 'wide' | 'tall' | 'normal';
  alt: Localized;
}[] = [
  {
    id: 'hall',
    src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=70',
    span: 'wide',
    alt: {
      uz: 'AURORA asosiy zali — qorong‘u yog‘och va oltin chiroqlar',
      en: 'AURORA main hall — dark wood and gold lighting',
      ru: 'Главный зал AURORA — тёмное дерево и золотой свет',
    },
  },
  {
    id: 'table',
    src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=70',
    span: 'normal',
    alt: {
      uz: 'Imzo taom dasturxonda, sham chiroq ostida',
      en: 'A signature dish at a candlelit table',
      ru: 'Фирменное блюдо при свечах',
    },
  },
  {
    id: 'lounge',
    src: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=70',
    span: 'tall',
    alt: {
      uz: 'VIP lounge — past yorug‘lik va velvet kreslolar',
      en: 'VIP lounge — low light and velvet seating',
      ru: 'VIP-лаунж — приглушённый свет и бархат',
    },
  },
  {
    id: 'bar',
    src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=70',
    span: 'normal',
    alt: {
      uz: 'Bar zonasi va qadahlar qatori',
      en: 'The bar and a line of glassware',
      ru: 'Барная зона и ряд бокалов',
    },
  },
  {
    id: 'window',
    src: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=70',
    span: 'normal',
    alt: {
      uz: 'Oyna yonidagi stol — kechki Toshkent manzarasi',
      en: 'A window table overlooking evening Tashkent',
      ru: 'Столик у окна с видом на вечерний Ташкент',
    },
  },
  {
    id: 'private',
    src: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=800&q=70',
    span: 'wide',
    alt: {
      uz: 'Yopiq xona — oilaviy kechki ovqat uchun',
      en: 'A private room for family dinners',
      ru: 'Закрытая комната для семейного ужина',
    },
  },
];

export const historyMilestones: {
  year: string;
  title: Localized;
  body: Localized;
}[] = [
  {
    year: '2024',
    title: {
      uz: 'G‘oya',
      en: 'The idea',
      ru: 'Идея',
    },
    body: {
      uz: 'Toshkent markazida shimoliy shafaq ruhidagi kechki restoran: qorong‘ulik, oltin va mavsumiy oshxona.',
      en: 'A night restaurant in central Tashkent, shaped by the northern lights: darkness, gold and seasonal cooking.',
      ru: 'Ночной ресторан в центре Ташкента в духе северного сияния: темнота, золото и сезонная кухня.',
    },
  },
  {
    year: '2025',
    title: {
      uz: 'Oshxona ochildi',
      en: 'The kitchen opens',
      ru: 'Кухня открылась',
    },
    body: {
      uz: 'Shef Kamran Alimov jamoasi birinchi menyuni chiqardi. Dry-aged steyklar va halal qoidalar asos bo‘ldi.',
      en: 'Chef Kamran Alimov’s team launched the first menu. Dry-aged steaks and a halal kitchen became the foundation.',
      ru: 'Команда шефа Камрана Алимова выпустила первое меню. Основой стали стейки сухой выдержки и халяль-кухня.',
    },
  },
  {
    year: '2026',
    title: {
      uz: 'AURORA kechasi',
      en: 'The AURORA evening',
      ru: 'Вечер AURORA',
    },
    body: {
      uz: 'VIP zal, oyna yonidagi stollar va jonli bron tizimi. Har kecha — cheklangan joylar.',
      en: 'A VIP room, window tables and live booking. Every night has a limited number of seats.',
      ru: 'VIP-зал, столики у окна и живое бронирование. Каждый вечер — ограниченное число мест.',
    },
  },
];

export const testimonials: {
  id: string;
  name: string;
  rating: 5 | 4;
  photo: string;
  city: Localized;
  text: Localized;
}[] = [
  {
    id: 'dilnoza',
    name: 'Dilnoza R.',
    rating: 5,
    photo:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    city: { uz: 'Toshkent', en: 'Tashkent', ru: 'Ташкент' },
    text: {
      uz: 'Yubiley kechamiz uchun bron qildik. Zal jim, taomlar aniq, xizmat esa shoshilmaydi. Qaytamiz.',
      en: 'We booked for an anniversary. The room is quiet, the cooking precise, the service unhurried. We will return.',
      ru: 'Бронировали на годовщину. Зал тихий, кухня точная, сервис не торопит. Вернёмся.',
    },
  },
  {
    id: 'timur',
    name: 'Timur K.',
    rating: 5,
    photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    city: { uz: 'Samarqand', en: 'Samarkand', ru: 'Самарканд' },
    text: {
      uz: 'Steyk darajasi Toshkentda kam uchraydi. Vino juftligi ham o‘rinli — shef biladi nima qilayotganini.',
      en: 'The steak is rare at this level in Tashkent. The wine pairing was considered — the kitchen knows what it is doing.',
      ru: 'Стейк такого уровня в Ташкенте редкость. Винное сопровождение уместно — кухня знает, что делает.',
    },
  },
  {
    id: 'malika',
    name: 'Malika S.',
    rating: 5,
    photo:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    city: { uz: 'Toshkent', en: 'Tashkent', ru: 'Ташкент' },
    text: {
      uz: 'Oyna yonidagi stol — alohida dunyo. Interyer suratdagi kabi, hatto yaxshiroq. Halal menyu oilamiz uchun muhim.',
      en: 'A window table is a world of its own. The interior matches the photographs, then exceeds them. A halal menu matters for our family.',
      ru: 'Столик у окна — отдельный мир. Интерьер как на фото, даже лучше. Халяльное меню важно для нашей семьи.',
    },
  },
  {
    id: 'javlon',
    name: 'Javlon A.',
    rating: 4,
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    city: { uz: 'Buxoro', en: 'Bukhara', ru: 'Бухара' },
    text: {
      uz: 'Biznes kechki ovqat uchun ideal. Dam olish kunlari oldindan bron qiling — joy tez tugaydi.',
      en: 'Ideal for a business dinner. Book ahead on weekends — tables go quickly.',
      ru: 'Идеально для делового ужина. В выходные бронируйте заранее — столы заканчиваются быстро.',
    },
  },
];

import type { Language } from '@/context/LanguageContext';
import type { MenuItemCategory } from '@/types/menu';

export interface WinePairing {
  wine: string;
  region: string;
  note: Record<Language, string>;
}

/**
 * Curated sommelier suggestions per chapter. The menu table has no pairing column,
 * so each dish gets a stable pick from its chapter's list (based on its id).
 */
const PAIRINGS: Record<MenuItemCategory, WinePairing[]> = {
  starters: [
    {
      wine: 'Blanc de Blancs Brut',
      region: 'Champagne, France',
      note: {
        uz: "Toza va yengil ko'pikli: ishtahani ochadi.",
        en: 'Crisp, fine bubbles that awaken the palate.',
        ru: 'Тонкие пузырьки и свежесть пробуждают аппетит.',
      },
    },
    {
      wine: 'Sancerre',
      region: 'Loire Valley, France',
      note: {
        uz: "Sitrus va mineral tuslar yengil taomlarga mos.",
        en: 'Citrus and flint lift delicate flavours.',
        ru: 'Цитрус и минеральность подчёркивают лёгкие вкусы.',
      },
    },
  ],
  mains: [
    {
      wine: 'Meursault Premier Cru',
      region: 'Burgundy, France',
      note: {
        uz: "Yog'li va yumshoq: sous va qo'ziqorin bilan uyg'un.",
        en: 'Rich and rounded, lovely with cream sauces.',
        ru: 'Насыщенное и бархатное, прекрасно к сливочным соусам.',
      },
    },
    {
      wine: 'Pinot Noir Reserve',
      region: 'Côte de Nuits, France',
      note: {
        uz: "Mevali va nafis: go'sht ta'mini bosmaydi.",
        en: 'Silky red fruit that never overpowers.',
        ru: 'Шелковистые красные ягоды, не перебивающие блюдо.',
      },
    },
  ],
  steaks: [
    {
      wine: 'Malbec Gran Reserva',
      region: 'Mendoza, Argentina',
      note: {
        uz: "To'q mevali va yumshoq tanninlar kuygan go'sht bilan.",
        en: 'Dark fruit and velvet tannins for a seared crust.',
        ru: 'Тёмные ягоды и мягкие танины к обжаренной корочке.',
      },
    },
    {
      wine: 'Cabernet Sauvignon',
      region: 'Napa Valley, USA',
      note: {
        uz: "Kuchli tuzilma yog'li steyk bilan mukammal.",
        en: 'Structured and bold for a well-marbled cut.',
        ru: 'Мощная структура для мраморного мяса.',
      },
    },
    {
      wine: 'Barolo',
      region: 'Piedmont, Italy',
      note: {
        uz: "Atirgul va truffel ohanglari uzoq davom etadi.",
        en: 'Rose, tar and truffle with a long finish.',
        ru: 'Роза, трюфель и долгое послевкусие.',
      },
    },
  ],
  desserts: [
    {
      wine: "Moscato d'Asti",
      region: 'Piedmont, Italy',
      note: {
        uz: "Yengil shirin va ko'pikli: shirinlikni muvozanatlaydi.",
        en: 'Lightly sweet and fizzy, it balances sugar.',
        ru: 'Лёгкая сладость и пузырьки уравновешивают десерт.',
      },
    },
    {
      wine: 'Tokaji Aszú 5 Puttonyos',
      region: 'Tokaj, Hungary',
      note: {
        uz: "Asal va jirnoq: boy shirinliklar uchun.",
        en: 'Honey and apricot for the richest finales.',
        ru: 'Мёд и абрикос для самых насыщенных десертов.',
      },
    },
  ],
  drinks: [
    {
      wine: 'Sommelier Selection',
      region: 'AURORA Cellar',
      note: {
        uz: "Sommelierdan so'rang: kechaga mos juftlikni tanlab beradi.",
        en: 'Ask your sommelier to match it to the evening.',
        ru: 'Попросите сомелье подобрать пару к вашему вечеру.',
      },
    },
  ],
};

const hash = (value: string): number => {
  let result = 0;
  for (let i = 0; i < value.length; i++) {
    result = (result * 31 + value.charCodeAt(i)) >>> 0;
  }
  return result;
};

export const getWinePairing = (
  itemId: string,
  category: MenuItemCategory,
): WinePairing => {
  const options = PAIRINGS[category] ?? PAIRINGS.mains;
  return options[hash(itemId) % options.length];
};

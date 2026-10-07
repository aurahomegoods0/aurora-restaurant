import type { Language } from '@/context/LanguageContext';
import type { MenuItem } from '@/types/menu';

export type MenuCategoryFilter =
  | 'all'
  | 'starters'
  | 'mains'
  | 'steaks'
  | 'desserts'
  | 'drinks';

export type DietaryTag = 'Halal' | 'Vegan' | 'Gluten-Free';

export const DIETARY_TAGS: DietaryTag[] = ['Halal', 'Vegan', 'Gluten-Free'];

export const BADGE_TAGS = [
  'Halal',
  'Vegan',
  'Gluten-Free',
  'Vegetarian',
] as const;

export type BadgeTag = (typeof BADGE_TAGS)[number];

export function getMenuItemName(item: MenuItem, language: Language): string {
  return item[`name_${language}`];
}

export function getMenuItemDescription(
  item: MenuItem,
  language: Language,
): string | null {
  return item[`description_${language}`];
}

export function getMenuItemIngredients(
  item: MenuItem,
  language: Language,
): string[] {
  return item[`ingredients_${language}`] ?? [];
}

export function getOptimizedImageUrl(
  imageUrl: string,
  width = 800,
  quality = 70,
): string {
  if (!imageUrl.includes('images.unsplash.com')) return imageUrl;

  let next = imageUrl;
  if (/[?&]w=/.test(next)) next = next.replace(/w=\d+/i, `w=${width}`);
  else next += `${next.includes('?') ? '&' : '?'}w=${width}`;

  if (/[?&]q=/.test(next)) next = next.replace(/q=\d+/i, `q=${quality}`);
  else next += `&q=${quality}`;

  return next;
}

export function getHighResImageUrl(imageUrl: string): string {
  return getOptimizedImageUrl(imageUrl, 1200, 75);
}

export function menuItemMatchesSearch(
  item: MenuItem,
  query: string,
  language: Language,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const fields = [
    item.name_uz,
    item.name_en,
    item.name_ru,
    item.description_uz,
    item.description_en,
    item.description_ru,
    getMenuItemName(item, language),
    getMenuItemDescription(item, language),
  ];

  return fields.some((field) => field?.toLowerCase().includes(q));
}

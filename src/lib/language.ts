import { restaurantConfig } from '../../restaurant.config';

export type Language = 'uz' | 'en' | 'ru';

export const LANG_COOKIE = 'aurora.lang';
export const LANG_STORAGE_KEY = 'aurora.lang';
const LANG_MAX_AGE = 60 * 60 * 24 * 365;

export const parseLanguage = (value: unknown): Language | null =>
  value === 'uz' || value === 'en' || value === 'ru' ? value : null;

export const defaultLanguage = (): Language =>
  parseLanguage(restaurantConfig.defaultLanguage) ?? 'uz';

export const persistLanguage = (language: Language): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, language);
  } catch {
    /* private mode */
  }
  document.cookie = `${LANG_COOKIE}=${language}; Path=/; Max-Age=${LANG_MAX_AGE}; SameSite=Lax`;
  document.documentElement.lang = language;
};

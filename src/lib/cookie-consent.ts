export const COOKIE_CONSENT_KEY = 'aurora:cookie-consent';
export const COOKIE_CONSENT_EVENT = 'aurora:cookie-consent';

export type CookieConsent = 'all' | 'necessary';

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  return value === 'all' || value === 'necessary' ? value : null;
}

export function setCookieConsent(value: CookieConsent): void {
  window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  window.dispatchEvent(
    new CustomEvent<CookieConsent>(COOKIE_CONSENT_EVENT, { detail: value }),
  );
}

export function clearCookieConsent(): void {
  window.localStorage.removeItem(COOKIE_CONSENT_KEY);
  window.dispatchEvent(
    new CustomEvent<CookieConsent | null>(COOKIE_CONSENT_EVENT, {
      detail: null,
    }),
  );
}

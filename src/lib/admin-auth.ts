import { createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const KITCHEN_COOKIE = 'aurora.kitchen';
const KITCHEN_MAX_AGE = 60 * 60 * 12;

const digest = (value: string): Buffer =>
  createHash('sha256').update(value).digest();

const secretsMatch = (received: string, expected: string): boolean =>
  timingSafeEqual(digest(received), digest(expected));

export const getAdminPassword = (): string | undefined => {
  const password = process.env.ADMIN_PASSWORD?.trim();
  return password || undefined;
};

export const kitchenToken = (password: string): string =>
  digest(`aurora.kitchen.v1:${password}`).toString('hex');

export const isKitchenAuthed = async (): Promise<boolean> => {
  const password = getAdminPassword();
  if (!password) return false;
  const token = (await cookies()).get(KITCHEN_COOKIE)?.value;
  if (!token) return false;
  try {
    return secretsMatch(token, kitchenToken(password));
  } catch {
    return false;
  }
};

export const writeKitchenSession = async (): Promise<boolean> => {
  const password = getAdminPassword();
  if (!password) return false;
  (await cookies()).set(KITCHEN_COOKIE, kitchenToken(password), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: KITCHEN_MAX_AGE,
  });
  return true;
};

export const clearKitchenSession = async (): Promise<void> => {
  (await cookies()).delete(KITCHEN_COOKIE);
};

export const passwordMatches = (received: string, expected: string): boolean => {
  try {
    return secretsMatch(received, expected);
  } catch {
    return false;
  }
};

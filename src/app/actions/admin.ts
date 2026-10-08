'use server';

import { headers } from 'next/headers';
import { after } from 'next/server';
import {
  clearKitchenSession,
  getAdminPassword,
  isKitchenAuthed,
  passwordMatches,
  writeKitchenSession,
} from '@/lib/admin-auth';
import { sendGuestEmail } from '@/lib/guest-email';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  guestEmailKindFor,
  transitionReservation,
  type KitchenAction,
} from '@/lib/reservation-ops';

export type KitchenLoginResult =
  | { ok: true }
  | { ok: false; message: string };

export type KitchenActionResult =
  | { ok: true; changed: boolean; status: string }
  | { ok: false; message: string };

const getClientIp = async (): Promise<string> => {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get('x-forwarded-for')?.split(',')[0];
  return forwardedFor?.trim() || requestHeaders.get('x-real-ip') || 'unknown';
};

export async function kitchenLogin(
  password: string,
): Promise<KitchenLoginResult> {
  const expected = getAdminPassword();
  if (!expected) {
    return {
      ok: false,
      message: 'Kitchen desk is not configured. Set ADMIN_PASSWORD.',
    };
  }

  const { allowed, retryAfterSeconds } = await checkRateLimit(
    `kitchen:${await getClientIp()}`,
  );
  if (!allowed) {
    return {
      ok: false,
      message: `Too many attempts. Wait ${retryAfterSeconds}s.`,
    };
  }

  if (!passwordMatches(password.trim(), expected)) {
    return { ok: false, message: 'Password is not correct.' };
  }

  const wrote = await writeKitchenSession();
  return wrote
    ? { ok: true }
    : { ok: false, message: 'Could not open a session.' };
}

export async function kitchenLogout(): Promise<void> {
  await clearKitchenSession();
}

export async function kitchenSetStatus(
  reservationId: string,
  action: KitchenAction,
): Promise<KitchenActionResult> {
  if (!(await isKitchenAuthed())) {
    return { ok: false, message: 'Session expired. Sign in again.' };
  }

  if (
    typeof reservationId !== 'string' ||
    !/^[0-9a-f-]{36}$/i.test(reservationId)
  ) {
    return { ok: false, message: 'Invalid reservation.' };
  }

  if (action !== 'confirm' && action !== 'cancel' && action !== 'complete') {
    return { ok: false, message: 'Unknown action.' };
  }

  const result = await transitionReservation(reservationId, action);
  if (!result.ok) return { ok: false, message: result.error };

  if (result.changed) {
    const kind = guestEmailKindFor(result.reservation.status);
    if (kind) {
      after(async () => {
        const emailed = await sendGuestEmail(result.reservation, kind).catch(
          (error: unknown) => ({
            ok: false as const,
            error: error instanceof Error ? error.name : 'unknown error',
          }),
        );
        if (!emailed.ok) {
          console.error('[kitchen] guest email failed', emailed.error);
        }
      });
    }
  }

  return {
    ok: true,
    changed: result.changed,
    status: result.reservation.status,
  };
}

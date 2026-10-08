'use server';

import { headers } from 'next/headers';
import { after } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendGuestEmail } from '@/lib/guest-email';
import { sendTelegramAdminNotification } from '@/lib/telegram';
import {
  reservationSchema,
  type ReservationInput,
} from '@/lib/validations/reservation';
import { E2E_TABLES, isE2EMock } from '@/lib/e2e';
import type {
  ReservationActionResult,
  ReservationDetails,
  TableZone,
} from '@/types/reservation';

const PG_UNIQUE_VIOLATION = '23505';
const PG_CHECK_VIOLATION = '23514';
const PG_RLS_VIOLATION = '42501';

const fail = (
  code: Extract<ReservationActionResult, { success: false }>['code'],
  message: string,
  fieldErrors?: Extract<ReservationActionResult, { success: false }>['fieldErrors'],
): ReservationActionResult => ({ success: false, code, message, fieldErrors });

const succeed = (reservation: ReservationDetails): ReservationActionResult => ({
  success: true,
  message: `Rahmat, ${reservation.guest_name}! Bron qabul qilindi. Tasdiqlash uchun siz bilan bog'lanamiz.`,
  reservation,
});

/** Server action input is untrusted, so inspect it without assuming its shape. */
const readField = (input: unknown, field: string): unknown =>
  typeof input === 'object' && input !== null
    ? (input as Record<string, unknown>)[field]
    : undefined;

const readText = (input: unknown, field: string, fallback: string): string => {
  const value = readField(input, field);
  return typeof value === 'string' && value.trim()
    ? value.trim().slice(0, 100)
    : fallback;
};

/** Look-alike of a saved reservation, returned to bots that trip the honeypot. */
const buildDecoyReservation = (input: unknown): ReservationDetails => {
  const partySize = Number(readField(input, 'party_size'));

  return {
    id: crypto.randomUUID(),
    guest_name: readText(input, 'guest_name', 'Mehmon'),
    guest_email: readText(input, 'guest_email', ''),
    guest_phone: readText(input, 'guest_phone', ''),
    party_size: Number.isInteger(partySize) && partySize > 0 ? partySize : 1,
    reservation_date: readText(input, 'reservation_date', ''),
    reservation_time: readText(input, 'reservation_time', ''),
    table_number: 1,
    zone: 'hall',
    status: 'pending',
  };
};

const isHoneypotFilled = (input: unknown): boolean => {
  const value = readField(input, 'website');
  return typeof value === 'string' && value.trim() !== '';
};

const getClientIp = async (): Promise<string> => {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get('x-forwarded-for')?.split(',')[0];
  return forwardedFor?.trim() || requestHeaders.get('x-real-ip') || 'unknown';
};

export async function createReservation(
  input: ReservationInput,
): Promise<ReservationActionResult> {
  // Honeypot: real users never see this field. Pretend it worked so the bot
  // gets no signal to adapt to, and save nothing.
  if (isHoneypotFilled(input)) return succeed(buildDecoyReservation(input));

  const parsed = reservationSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? '');
      if (field && !(field in fieldErrors)) fieldErrors[field] = issue.message;
    }
    return fail(
      'VALIDATION',
      "Kiritilgan ma'lumotlarni tekshirib, qaytadan urinib ko'ring.",
      fieldErrors,
    );
  }

  const { website: _honeypot, ...reservation } = parsed.data;

  if (isE2EMock()) {
    const table =
      E2E_TABLES.find((item) => item.id === reservation.table_id) ??
      E2E_TABLES[0];
    return succeed({
      id: crypto.randomUUID(),
      guest_name: reservation.guest_name,
      guest_email: reservation.guest_email,
      guest_phone: reservation.guest_phone,
      party_size: reservation.party_size,
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time,
      table_number: table.table_number,
      zone: table.zone,
      status: 'pending',
    });
  }

  // Counted only after validation passes, so a legitimate user fixing typos
  // does not burn through their allowance.
  const { allowed, retryAfterSeconds } = await checkRateLimit(
    await getClientIp(),
  );

  if (!allowed) {
    return fail(
      'RATE_LIMITED',
      `Juda ko'p urinish. Iltimos, ${retryAfterSeconds} soniyadan so'ng qayta urinib ko'ring.`,
    );
  }

  try {
    const supabase = createServerSupabaseClient();

    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select('id, capacity, table_number, zone')
      .eq('id', reservation.table_id)
      .eq('is_active', true)
      .maybeSingle<{
        id: string;
        capacity: number;
        table_number: number;
        zone: TableZone;
      }>();

    if (tableError) {
      console.error('[createReservation] table lookup failed', tableError);
      return fail(
        'UNKNOWN',
        "Server bilan bog'lanishda xatolik. Iltimos, birozdan so'ng qayta urinib ko'ring.",
      );
    }

    if (!table) {
      return fail(
        'TABLE_UNAVAILABLE',
        'Tanlangan stol mavjud emas. Iltimos, boshqa stolni tanlang.',
        { table_id: 'Stolni qaytadan tanlang' },
      );
    }

    if (reservation.party_size > table.capacity) {
      return fail(
        'CAPACITY_EXCEEDED',
        `Bu stol ${table.capacity} kishigacha mo'ljallangan. Kattaroq stolni tanlang.`,
        { table_id: `Stol sig'imi: ${table.capacity} kishi` },
      );
    }

    const { data: inserted, error } = await supabase
      .from('reservations')
      .insert({ ...reservation, status: 'pending' })
      .select('id')
      .single<{ id: string }>();

    if (error) {
      if (error.code === PG_UNIQUE_VIOLATION) {
        return fail(
          'SLOT_TAKEN',
          "Afsuski, bu stol hozirgina boshqa mehmon tomonidan band qilindi. Iltimos, boshqa stol yoki vaqtni tanlang.",
          { table_id: 'Bu stol band qilingan' },
        );
      }

      if (error.code === PG_CHECK_VIOLATION || error.code === PG_RLS_VIOLATION) {
        return fail(
          'VALIDATION',
          "Bron ma'lumotlari qabul qilinmadi. Sana, vaqt va stolni tekshiring.",
        );
      }

      console.error('[createReservation] insert failed', error);
      return fail(
        'UNKNOWN',
        "Bronni saqlashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
      );
    }

    const saved: ReservationDetails = {
      id: inserted.id,
      guest_name: reservation.guest_name,
      guest_email: reservation.guest_email,
      guest_phone: reservation.guest_phone,
      party_size: reservation.party_size,
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time,
      table_number: table.table_number,
      zone: table.zone,
      status: 'pending',
    };

    // The booking is already saved, so a Telegram outage must never fail it.
    // Running after the response also keeps the guest's confirmation instant.
    after(async () => {
      const telegram = await sendTelegramAdminNotification(saved).catch(
        (error: unknown) => ({
          ok: false as const,
          error: error instanceof Error ? error.name : 'unknown error',
        }),
      );
      if (!telegram.ok) {
        console.error(
          '[createReservation] Telegram notification failed',
          telegram.error,
        );
      }

      const email = await sendGuestEmail(saved, 'received').catch(
        (error: unknown) => ({
          ok: false as const,
          error: error instanceof Error ? error.name : 'unknown error',
        }),
      );
      if (!email.ok) {
        console.error('[createReservation] guest email failed', email.error);
      }
    });

    return succeed(saved);
  } catch (error) {
    console.error('[createReservation] unexpected error', error);
    return fail(
      'UNKNOWN',
      "Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
    );
  }
}

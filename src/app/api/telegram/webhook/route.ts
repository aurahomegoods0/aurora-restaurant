import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ZONE_LABELS } from '@/lib/reservation-format';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import {
  answerTelegramCallback,
  editTelegramReservationMessage,
  type CallbackAction,
} from '@/lib/telegram';
import type {
  ReservationDetails,
  ReservationStatus,
  TableZone,
} from '@/types/reservation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RESERVATION_COLUMNS =
  'id, guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, status, tables(table_number, zone)';

const PG_UNIQUE_VIOLATION = '23505';

const updateSchema = z.object({
  callback_query: z
    .object({
      id: z.string(),
      data: z.string().optional(),
      message: z
        .object({
          message_id: z.number(),
          chat: z.object({ id: z.number() }),
        })
        .optional(),
    })
    .optional(),
});

const CALLBACK_DATA_PATTERN =
  /^(confirm|cancel)_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

/** Parses `confirm_<uuid>` / `cancel_<uuid>` button payloads. */
const parseCallbackData = (
  data: string | undefined,
): { action: CallbackAction; reservationId: string } | null => {
  const match = data ? CALLBACK_DATA_PATTERN.exec(data) : null;
  return match
    ? {
        action: match[1].toLowerCase() as CallbackAction,
        reservationId: match[2],
      }
    : null;
};

/** Which current statuses each action may move away from, and the status it sets. */
const TRANSITIONS: Record<
  CallbackAction,
  { from: ReservationStatus[]; to: ReservationStatus; toast: string }
> = {
  confirm: { from: ['pending'], to: 'confirmed', toast: '✅ Reservation confirmed' },
  cancel: {
    from: ['pending', 'confirmed'],
    to: 'cancelled',
    toast: '❌ Reservation cancelled',
  },
};

interface ReservationRow {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: ReservationStatus;
  tables: { table_number: number; zone: TableZone } | null;
}

const toDetails = (row: ReservationRow): ReservationDetails | null =>
  row.tables && row.tables.zone in ZONE_LABELS
    ? {
        id: row.id,
        guest_name: row.guest_name,
        guest_email: row.guest_email,
        guest_phone: row.guest_phone,
        party_size: row.party_size,
        reservation_date: row.reservation_date,
        reservation_time: row.reservation_time,
        table_number: row.tables.table_number,
        zone: row.tables.zone,
        status: row.status,
      }
    : null;

const secretsMatch = (received: string | null, expected: string): boolean => {
  if (!received) return false;
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(received), digest(expected));
};

const ack = () => NextResponse.json({ ok: true });

export async function POST(request: Request): Promise<NextResponse> {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const adminChatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!webhookSecret || !adminChatId) {
    console.error(
      '[telegram webhook] TELEGRAM_WEBHOOK_SECRET or TELEGRAM_CHAT_ID is not set',
    );
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  // Telegram echoes the `secret_token` given to setWebhook in this header.
  if (
    !secretsMatch(
      request.headers.get('x-telegram-bot-api-secret-token'),
      webhookSecret,
    )
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const update = updateSchema.safeParse(body);
  const query = update.success ? update.data.callback_query : undefined;

  // Only inline-button presses are handled; acknowledge everything else.
  if (!query) return ack();

  if (String(query.message?.chat.id) !== adminChatId) {
    await answerTelegramCallback(query.id, 'You are not allowed to do this.', true);
    return ack();
  }

  const callback = parseCallbackData(query.data);
  if (!callback || !query.message) {
    await answerTelegramCallback(query.id, 'Unknown action.');
    return ack();
  }

  const { action, reservationId } = callback;
  const { from, to, toast } = TRANSITIONS[action];
  const { chat, message_id: messageId } = query.message;

  try {
    const supabase = createServiceRoleSupabaseClient();

    const { data: updated, error: updateError } = await supabase
      .from('reservations')
      .update({ status: to })
      .eq('id', reservationId)
      .in('status', from)
      .select(RESERVATION_COLUMNS)
      .maybeSingle<ReservationRow>();

    if (updateError) {
      console.error('[telegram webhook] update failed', updateError);
      await answerTelegramCallback(
        query.id,
        updateError.code === PG_UNIQUE_VIOLATION
          ? 'This table slot has been booked by someone else.'
          : 'Database error, please try again.',
        true,
      );
      return ack();
    }

    let current = updated;
    let message = toast;

    if (!current) {
      // Nothing was updated: the reservation is missing or already in a final state
      // (e.g. another admin pressed a button first). Show its real state instead.
      const { data: existing } = await supabase
        .from('reservations')
        .select(RESERVATION_COLUMNS)
        .eq('id', reservationId)
        .maybeSingle<ReservationRow>();

      current = existing;
      message = existing
        ? `Already ${existing.status}, nothing changed.`
        : 'Reservation not found.';
    }

    const details = current ? toDetails(current) : null;
    if (details) {
      const edited = await editTelegramReservationMessage(
        chat.id,
        messageId,
        details,
      );
      if (!edited.ok) {
        console.error('[telegram webhook] edit failed', edited.error);
      }
    }

    await answerTelegramCallback(query.id, message);
  } catch (error) {
    console.error('[telegram webhook] unexpected error', error);
    await answerTelegramCallback(query.id, 'Something went wrong.', true);
  }

  // Always 200: Telegram would retry a button press that can no longer succeed.
  return ack();
}

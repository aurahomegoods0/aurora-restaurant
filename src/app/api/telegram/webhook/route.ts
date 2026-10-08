import { createHash, timingSafeEqual } from 'node:crypto';
import { after, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendGuestEmail } from '@/lib/guest-email';
import {
  guestEmailKindFor,
  transitionReservation,
} from '@/lib/reservation-ops';
import {
  answerTelegramCallback,
  editTelegramReservationMessage,
  type CallbackAction,
} from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

const TOAST: Record<CallbackAction, string> = {
  confirm: '✅ Reservation confirmed',
  cancel: '❌ Reservation cancelled',
};

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
  const { chat, message_id: messageId } = query.message;

  try {
    const result = await transitionReservation(reservationId, action);

    if (!result.ok) {
      await answerTelegramCallback(
        query.id,
        result.conflict
          ? 'This table slot has been booked by someone else.'
          : result.error,
        true,
      );
      return ack();
    }

    const message = result.changed
      ? TOAST[action]
      : `Already ${result.reservation.status}, nothing changed.`;

    const edited = await editTelegramReservationMessage(
      chat.id,
      messageId,
      result.reservation,
    );
    if (!edited.ok) {
      console.error('[telegram webhook] edit failed', edited.error);
    }

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
            console.error('[telegram webhook] guest email failed', emailed.error);
          }
        });
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

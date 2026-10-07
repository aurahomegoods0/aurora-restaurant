import {
  ZONE_LABELS,
  formatReservationDate,
  formatReservationTime,
  shortReservationCode,
} from '@/lib/reservation-format';
import type {
  ReservationDetails,
  ReservationStatus,
} from '@/types/reservation';

const TELEGRAM_API_URL = 'https://api.telegram.org';
const REQUEST_TIMEOUT_MS = 5000;

export type TelegramResult = { ok: true } | { ok: false; error: string };

export interface InlineKeyboardButton {
  text: string;
  callback_data: string;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: '⏳ Pending',
  confirmed: '✅ Confirmed',
  cancelled: '❌ Cancelled',
  completed: '🏁 Completed',
};

export const CALLBACK_ACTIONS = ['confirm', 'cancel'] as const;
export type CallbackAction = (typeof CALLBACK_ACTIONS)[number];

/** Telegram MarkdownV2 requires escaping these characters in plain text. */
export const escapeMarkdownV2 = (text: string): string =>
  text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');

export const buildReservationMessage = (
  reservation: ReservationDetails,
): string => {
  const field = (emoji: string, label: string, value: string) =>
    `${emoji} *${label}:* ${escapeMarkdownV2(value)}`;

  return [
    '🍽 *New reservation*',
    '',
    field('👤', 'Guest', reservation.guest_name),
    field('📞', 'Phone', reservation.guest_phone),
    field('📅', 'Date', formatReservationDate(reservation.reservation_date)),
    field('🕐', 'Time', formatReservationTime(reservation.reservation_time)),
    field(
      '🪑',
      'Table',
      `#${reservation.table_number} (${ZONE_LABELS[reservation.zone]})`,
    ),
    field('👥', 'Party size', String(reservation.party_size)),
    field('📌', 'Status', STATUS_LABELS[reservation.status]),
    '',
    `🆔 \`${shortReservationCode(reservation.id)}\``,
  ].join('\n');
};

/** Pending bookings can be confirmed or cancelled, confirmed ones only cancelled. */
export const buildReservationKeyboard = (
  reservationId: string,
  status: ReservationStatus,
): InlineKeyboardMarkup => {
  const confirm: InlineKeyboardButton = {
    text: '✅ Confirm',
    callback_data: `confirm_${reservationId}`,
  };
  const cancel: InlineKeyboardButton = {
    text: '❌ Cancel',
    callback_data: `cancel_${reservationId}`,
  };

  if (status === 'pending') return { inline_keyboard: [[confirm, cancel]] };
  if (status === 'confirmed') return { inline_keyboard: [[cancel]] };
  return { inline_keyboard: [] };
};

const getBotToken = (): string | undefined =>
  process.env.TELEGRAM_BOT_TOKEN?.trim() || undefined;

const getAdminChatId = (): string | undefined =>
  process.env.TELEGRAM_CHAT_ID?.trim() || undefined;

/**
 * Calls the Telegram Bot API. Never throws, and never includes the bot token
 * (which is part of the URL) in the returned error.
 */
const callTelegram = async (
  method: string,
  payload: Record<string, unknown>,
): Promise<TelegramResult> => {
  const token = getBotToken();
  if (!token) return { ok: false, error: 'TELEGRAM_BOT_TOKEN is not set' };

  try {
    const response = await fetch(`${TELEGRAM_API_URL}/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    });

    const body = (await response.json().catch(() => null)) as {
      ok?: boolean;
      description?: string;
    } | null;

    if (!response.ok || !body?.ok) {
      return {
        ok: false,
        error: `${method}: ${body?.description ?? `HTTP ${response.status}`}`,
      };
    }

    return { ok: true };
  } catch (error) {
    const reason = error instanceof Error ? error.name : 'unknown error';
    return { ok: false, error: `${method}: request failed (${reason})` };
  }
};

/** Sends the new-reservation message with Confirm / Cancel buttons to the admin chat. */
export const sendTelegramAdminNotification = async (
  reservation: ReservationDetails,
): Promise<TelegramResult> => {
  const chatId = getAdminChatId();
  if (!chatId) return { ok: false, error: 'TELEGRAM_CHAT_ID is not set' };

  return callTelegram('sendMessage', {
    chat_id: chatId,
    text: buildReservationMessage(reservation),
    parse_mode: 'MarkdownV2',
    reply_markup: buildReservationKeyboard(reservation.id, reservation.status),
  });
};

/** Rewrites an existing admin message so it reflects the reservation's current status. */
export const editTelegramReservationMessage = (
  chatId: number | string,
  messageId: number,
  reservation: ReservationDetails,
): Promise<TelegramResult> =>
  callTelegram('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text: buildReservationMessage(reservation),
    parse_mode: 'MarkdownV2',
    reply_markup: buildReservationKeyboard(reservation.id, reservation.status),
  });

/** Stops the loading spinner on the pressed button and shows a short toast. */
export const answerTelegramCallback = (
  callbackQueryId: string,
  text: string,
  showAlert = false,
): Promise<TelegramResult> =>
  callTelegram('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  });

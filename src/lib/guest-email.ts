import { restaurantConfig } from '../../restaurant.config';
import {
  ZONE_LABELS,
  formatReservationDate,
  formatReservationTime,
  shortReservationCode,
} from '@/lib/reservation-format';
import type { ReservationDetails } from '@/types/reservation';

export type GuestEmailKind = 'received' | 'confirmed' | 'cancelled';

export type GuestEmailResult = { ok: true } | { ok: false; error: string };

const REQUEST_TIMEOUT_MS = 6000;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const SUBJECT: Record<GuestEmailKind, string> = {
  received: 'AURORA — bron qabul qilindi / reservation received',
  confirmed: 'AURORA — stol tasdiqlandi / table confirmed',
  cancelled: 'AURORA — bron bekor qilindi / reservation cancelled',
};

const HEADLINE: Record<GuestEmailKind, { uz: string; en: string }> = {
  received: {
    uz: 'Broningiz qabul qilindi. Tasdiqlashni kutamiz.',
    en: 'We have your request. The house will confirm shortly.',
  },
  confirmed: {
    uz: 'Stolingiz tasdiqlandi. Kechangiz saqlangan.',
    en: 'Your table is confirmed. The evening is held.',
  },
  cancelled: {
    uz: 'Bron bekor qilindi. Yangi kecha uchun qayta yozing.',
    en: 'This reservation was cancelled. Write again for another evening.',
  },
};

const buildHtml = (
  reservation: ReservationDetails,
  kind: GuestEmailKind,
): string => {
  const code = shortReservationCode(reservation.id);
  const when = `${formatReservationDate(reservation.reservation_date)} · ${formatReservationTime(reservation.reservation_time)}`;
  const table = `#${reservation.table_number} · ${ZONE_LABELS[reservation.zone]}`;
  const headline = HEADLINE[kind];

  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 0;color:#A89F8C;font-size:12px;letter-spacing:0.14em;text-transform:uppercase">${label}</td><td style="padding:8px 0;color:#F4EDE0;text-align:right;font-size:15px">${value}</td></tr>`;

  return `<!doctype html>
<html lang="uz">
<body style="margin:0;background:#070707;color:#F4EDE0;font-family:Georgia,'Times New Roman',serif">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px">
    <p style="margin:0;color:#D4AF37;letter-spacing:0.32em;font-size:13px">AURORA</p>
    <h1 style="margin:16px 0 8px;font-weight:500;font-size:28px;line-height:1.2">${escapeHtml(headline.uz)}</h1>
    <p style="margin:0 0 28px;color:#A89F8C;font-size:15px">${escapeHtml(headline.en)}</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid rgba(212,175,55,0.25);border-bottom:1px solid rgba(212,175,55,0.25)">
      ${row('Mehmon / Guest', escapeHtml(reservation.guest_name))}
      ${row('Sana / Date', escapeHtml(when))}
      ${row('Stol / Table', escapeHtml(table))}
      ${row('Mehmonlar / Party', String(reservation.party_size))}
      ${row('Kod / Code', code)}
    </table>
    <p style="margin:28px 0 0;color:#A89F8C;font-size:13px;line-height:1.6">
      ${escapeHtml(restaurantConfig.contact.address)}<br />
      ${escapeHtml(restaurantConfig.contact.phone)} · ${escapeHtml(restaurantConfig.contact.email)}
    </p>
  </div>
</body>
</html>`;
};

export const sendGuestEmail = async (
  reservation: ReservationDetails,
  kind: GuestEmailKind,
): Promise<GuestEmailResult> => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = reservation.guest_email.trim();
  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY is not set' };
  if (!to || !to.includes('@')) {
    return { ok: false, error: 'guest email missing' };
  }

  const from =
    process.env.RESEND_FROM?.trim() || 'AURORA <beth.t@example.com>';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: SUBJECT[kind],
        html: buildHtml(reservation, kind),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      return {
        ok: false,
        error: body?.message ?? `HTTP ${response.status}`,
      };
    }

    return { ok: true };
  } catch (error) {
    const reason = error instanceof Error ? error.name : 'unknown error';
    return { ok: false, error: `request failed (${reason})` };
  }
};

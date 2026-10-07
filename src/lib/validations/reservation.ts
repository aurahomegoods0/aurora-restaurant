import { z } from 'zod';

export const RESTAURANT_TIMEZONE = 'Asia/Tashkent';
export const OPENING_TIME = '10:00';
export const CLOSING_TIME = '22:00';
export const SLOT_INTERVAL_MINUTES = 60;
export const MAX_PARTY_SIZE = 12;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_PATTERN = /^\+?[\d\s\-()]+$/;

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: RESTAURANT_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: RESTAURANT_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/** Today's date (YYYY-MM-DD) in the restaurant's timezone. */
export const getTodayISO = (now: Date = new Date()): string =>
  dateFormatter.format(now);

/** Minutes since midnight in the restaurant's timezone. */
export const getCurrentMinutes = (now: Date = new Date()): number =>
  timeToMinutes(timeFormatter.format(now));

const isValidCalendarDate = (value: string): boolean => {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
};

/** True when `time` on `date` has already passed (restaurant timezone). */
export const isSlotInPast = (
  date: string,
  time: string,
  now: Date = new Date(),
): boolean => {
  const today = getTodayISO(now);
  if (date < today) return true;
  return date === today && timeToMinutes(time) <= getCurrentMinutes(now);
};

/** Every bookable slot between opening and closing time, e.g. 10:00 ... 22:00. */
export const RESERVATION_TIME_SLOTS: readonly string[] = (() => {
  const slots: string[] = [];
  const end = timeToMinutes(CLOSING_TIME);
  for (
    let minutes = timeToMinutes(OPENING_TIME);
    minutes <= end;
    minutes += SLOT_INTERVAL_MINUTES
  ) {
    const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mm = String(minutes % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
})();

export const reservationSchema = z
  .object({
    guest_name: z
      .string({ error: 'Ismingizni kiriting' })
      .trim()
      .min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak")
      .max(100, "Ism juda uzun (maksimum 100 ta belgi)"),
    guest_email: z
      .string({ error: 'Email manzilini kiriting' })
      .trim()
      .max(254, 'Email juda uzun')
      .pipe(z.email("Email manzili noto'g'ri formatda")),
    guest_phone: z
      .string({ error: 'Telefon raqamini kiriting' })
      .trim()
      .regex(PHONE_PATTERN, "Telefon raqami noto'g'ri formatda")
      .refine(
        (value) => {
          const digits = value.replace(/\D/g, '').length;
          return digits >= 9 && digits <= 15;
        },
        "Telefon raqami 9 dan 15 gacha raqamdan iborat bo'lishi kerak",
      ),
    party_size: z
      .number({ error: 'Mehmonlar sonini kiriting' })
      .int("Mehmonlar soni butun son bo'lishi kerak")
      .min(1, "Kamida 1 ta mehmon bo'lishi kerak")
      .max(MAX_PARTY_SIZE, `Maksimum ${MAX_PARTY_SIZE} ta mehmon`),
    reservation_date: z
      .string({ error: 'Sanani tanlang' })
      .regex(DATE_PATTERN, 'Sanani tanlang')
      .refine(isValidCalendarDate, "Sana noto'g'ri")
      .refine(
        (value) => value >= getTodayISO(),
        "O'tgan sanani tanlash mumkin emas",
      ),
    reservation_time: z
      .string({ error: 'Vaqtni tanlang' })
      .regex(TIME_PATTERN, 'Vaqtni tanlang')
      .refine(
        (value) =>
          timeToMinutes(value) >= timeToMinutes(OPENING_TIME) &&
          timeToMinutes(value) <= timeToMinutes(CLOSING_TIME),
        `Restoran ${OPENING_TIME} dan ${CLOSING_TIME} gacha ishlaydi`,
      ),
    table_id: z.uuid('Stolni tanlang'),
    /** Honeypot: hidden from real users, so it must stay empty. Never reject on it here. */
    website: z.string().optional(),
  })
  .refine(
    ({ reservation_date, reservation_time }) =>
      !isValidCalendarDate(reservation_date) ||
      !TIME_PATTERN.test(reservation_time) ||
      !isSlotInPast(reservation_date, reservation_time),
    { path: ['reservation_time'], error: "Bu vaqt allaqachon o'tib ketgan" },
  );

export type ReservationInput = z.infer<typeof reservationSchema>;

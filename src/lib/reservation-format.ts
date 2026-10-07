import type { TableZone } from '@/types/reservation';

export const ZONE_LABELS: Record<TableZone, string> = {
  window: 'Oyna yonida',
  vip: 'VIP',
  hall: 'Asosiy zal',
};

/** 2026-10-12 -> 12.10.2026 */
export const formatReservationDate = (date: string): string => {
  const [year, month, day] = date.split('-');
  return year && month && day ? `${day}.${month}.${year}` : date;
};

/** 19:00:00 -> 19:00 (Postgres `time` columns include seconds) */
export const formatReservationTime = (time: string): string =>
  time.slice(0, 5);

/** First 8 characters of the reservation id, upper-cased, e.g. 3F9A1C7B */
export const shortReservationCode = (id: string): string =>
  id.replace(/-/g, '').slice(0, 8).toUpperCase();

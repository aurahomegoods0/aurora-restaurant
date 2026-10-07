import type { ReservationInput } from '@/lib/validations/reservation';

/** Matches `public.tables.zone` in Supabase */
export type TableZone = 'window' | 'vip' | 'hall';

/** Matches `public.tables` in Supabase */
export interface RestaurantTable {
  id: string;
  table_number: number;
  capacity: number;
  zone: TableZone;
  is_active: boolean;
}

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

/** Publicly readable columns of `public.reservations` (no personal data) */
export interface ReservationSlot {
  id: string;
  table_id: string;
  reservation_date: string;
  reservation_time: string;
  status: ReservationStatus;
}

/** A saved reservation joined with its table, used by Telegram, the voucher and the UI */
export interface ReservationDetails {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  table_number: number;
  zone: TableZone;
  status: ReservationStatus;
}

export type ReservationErrorCode =
  | 'VALIDATION'
  | 'SLOT_TAKEN'
  | 'TABLE_UNAVAILABLE'
  | 'CAPACITY_EXCEEDED'
  | 'RATE_LIMITED'
  | 'UNKNOWN';

export type ReservationActionResult =
  | { success: true; message: string; reservation: ReservationDetails }
  | {
      success: false;
      code: ReservationErrorCode;
      message: string;
      fieldErrors?: Partial<Record<keyof ReservationInput, string>>;
    };

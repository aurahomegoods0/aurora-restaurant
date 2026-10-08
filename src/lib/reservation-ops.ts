import { ZONE_LABELS } from '@/lib/reservation-format';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import type {
  ReservationDetails,
  ReservationStatus,
  TableZone,
} from '@/types/reservation';

export type KitchenAction = 'confirm' | 'cancel' | 'complete';

export interface KitchenReservation extends ReservationDetails {
  created_at: string;
}

const RESERVATION_COLUMNS =
  'id, guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, status, created_at, tables(table_number, zone)';

const PG_UNIQUE_VIOLATION = '23505';

const TRANSITIONS: Record<
  KitchenAction,
  { from: ReservationStatus[]; to: ReservationStatus }
> = {
  confirm: { from: ['pending'], to: 'confirmed' },
  cancel: { from: ['pending', 'confirmed'], to: 'cancelled' },
  complete: { from: ['confirmed'], to: 'completed' },
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
  created_at: string;
  tables: { table_number: number; zone: TableZone } | null;
}

const toDetails = (
  row: ReservationRow,
): KitchenReservation | ReservationDetails | null =>
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
        created_at: row.created_at,
      }
    : null;

const isoDateOffset = (days: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const listKitchenReservations = async (): Promise<
  KitchenReservation[]
> => {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from('reservations')
    .select(RESERVATION_COLUMNS)
    .gte('reservation_date', isoDateOffset(-7))
    .lte('reservation_date', isoDateOffset(30))
    .order('reservation_date', { ascending: true })
    .order('reservation_time', { ascending: true })
    .returns<ReservationRow[]>();

  if (error) {
    console.error('[kitchen] list failed', error);
    throw new Error('Could not load reservations');
  }

  return (data ?? [])
    .map((row) => toDetails(row))
    .filter((row): row is KitchenReservation => Boolean(row));
};

export type TransitionResult =
  | { ok: true; reservation: ReservationDetails; changed: boolean }
  | { ok: false; error: string; conflict?: boolean };

export const transitionReservation = async (
  reservationId: string,
  action: KitchenAction,
): Promise<TransitionResult> => {
  const { from, to } = TRANSITIONS[action];
  const supabase = createServiceRoleSupabaseClient();

  const { data: updated, error: updateError } = await supabase
    .from('reservations')
    .update({ status: to })
    .eq('id', reservationId)
    .in('status', from)
    .select(RESERVATION_COLUMNS)
    .maybeSingle<ReservationRow>();

  if (updateError) {
    console.error('[kitchen] update failed', updateError);
    return {
      ok: false,
      error:
        updateError.code === PG_UNIQUE_VIOLATION
          ? 'This table slot is taken.'
          : 'Database error, please try again.',
      conflict: updateError.code === PG_UNIQUE_VIOLATION,
    };
  }

  if (updated) {
    const details = toDetails(updated);
    return details
      ? { ok: true, reservation: details, changed: true }
      : { ok: false, error: 'Reservation is missing table data.' };
  }

  const { data: existing } = await supabase
    .from('reservations')
    .select(RESERVATION_COLUMNS)
    .eq('id', reservationId)
    .maybeSingle<ReservationRow>();

  if (!existing) return { ok: false, error: 'Reservation not found.' };

  const details = toDetails(existing);
  return details
    ? { ok: true, reservation: details, changed: false }
    : { ok: false, error: 'Reservation is missing table data.' };
};

export const guestEmailKindFor = (
  status: ReservationStatus,
): 'confirmed' | 'cancelled' | null => {
  if (status === 'confirmed') return 'confirmed';
  if (status === 'cancelled') return 'cancelled';
  return null;
};

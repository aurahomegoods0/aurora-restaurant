'use client';

import { useEffect, useState } from 'react';
import { restaurantConfig } from '../../../restaurant.config';
import { supabase } from '@/lib/supabase/client';
import {
  RESERVATION_TIME_SLOTS,
  getCurrentMinutes,
  getTodayISO,
  timeToMinutes,
} from '@/lib/validations/reservation';

export interface LiveStatus {
  isOpen: boolean;
  /** Next bookable slot today (HH:MM), or null once the last slot has passed */
  nextSlot: string | null;
  /** Tables free at `nextSlot`; null while loading or when there is no slot */
  availableTables: number | null;
}

const getNextSlot = (): string | null =>
  RESERVATION_TIME_SLOTS.find(
    (slot) => timeToMinutes(slot) > getCurrentMinutes(),
  ) ?? null;

const isOpenNow = (): boolean => {
  const now = getCurrentMinutes();
  const { open, close } = restaurantConfig.openingHours;
  return now >= timeToMinutes(open) && now < timeToMinutes(close);
};

/** Live "open now / tables free at the next seating" data for the hero. */
export const useLiveStatus = (): LiveStatus => {
  const [status, setStatus] = useState<LiveStatus>({
    isOpen: false,
    nextSlot: null,
    availableTables: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const nextSlot = getNextSlot();
      const isOpen = isOpenNow();

      if (!nextSlot) {
        if (!cancelled) setStatus({ isOpen, nextSlot, availableTables: null });
        return;
      }

      const [tablesResult, bookedResult] = await Promise.all([
        supabase
          .from('tables')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase
          .from('reservations')
          .select('table_id')
          .eq('reservation_date', getTodayISO())
          .eq('reservation_time', `${nextSlot}:00`)
          .neq('status', 'cancelled'),
      ]);

      if (cancelled) return;

      const total = tablesResult.count ?? 0;
      const booked = new Set(
        ((bookedResult.data ?? []) as { table_id: string }[]).map(
          (row) => row.table_id,
        ),
      ).size;

      setStatus({
        isOpen,
        nextSlot,
        availableTables:
          tablesResult.error || bookedResult.error
            ? null
            : Math.max(0, total - booked),
      });
    }

    void load();
    const interval = window.setInterval(() => void load(), 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return status;
};

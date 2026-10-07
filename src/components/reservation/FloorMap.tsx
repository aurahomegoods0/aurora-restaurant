'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type {
  ReservationSlot,
  RestaurantTable,
  TableZone,
} from '@/types/reservation';

const ZONES: { key: TableZone; label: string; hint: string }[] = [
  { key: 'window', label: 'Oyna yonida', hint: 'Shahar manzarasi' },
  { key: 'vip', label: 'VIP', hint: 'Alohida xona' },
  { key: 'hall', label: 'Asosiy zal', hint: 'Markaziy zal' },
];

const SLOT_COLUMNS: (keyof ReservationSlot)[] = [
  'id',
  'table_id',
  'reservation_date',
  'reservation_time',
  'status',
];

type RealtimeState = 'connecting' | 'live' | 'offline';

export interface FloorMapProps {
  /** YYYY-MM-DD; availability is unknown until both date and time are set */
  date: string | null;
  /** HH:MM */
  time: string | null;
  selectedTableId: string | null;
  onSelect: (table: RestaurantTable | null) => void;
}

const isActiveSlot = (slot: ReservationSlot): boolean =>
  slot.status !== 'cancelled';

const tableShape = (capacity: number): string => {
  if (capacity <= 2) return 'h-16 w-16 rounded-full';
  if (capacity <= 4) return 'h-16 w-20 rounded-2xl';
  if (capacity <= 6) return 'h-16 w-28 rounded-2xl';
  return 'h-16 w-36 rounded-2xl';
};

const FloorMap: React.FC<FloorMapProps> = ({
  date,
  time,
  selectedTableId,
  onSelect,
}) => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<Record<string, ReservationSlot>>({});
  const [realtimeState, setRealtimeState] = useState<RealtimeState>('connecting');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTables() {
      const { data, error: fetchError } = await supabase
        .from('tables')
        .select('id, table_number, capacity, zone, is_active')
        .eq('is_active', true)
        .order('table_number');

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setTables(data as RestaurantTable[]);
      }
      setTablesLoading(false);
    }

    void loadTables();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSlots({});
    if (!date) {
      setRealtimeState('connecting');
      return;
    }

    let cancelled = false;

    const removeSlot = (id: string) =>
      setSlots((prev) => {
        if (!(id in prev)) return prev;
        const { [id]: _removed, ...rest } = prev;
        return rest;
      });

    async function loadSlots() {
      const { data, error: fetchError } = await supabase
        .from('reservations')
        .select(SLOT_COLUMNS.join(', '))
        .eq('reservation_date', date)
        .neq('status', 'cancelled');

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setError(null);
      const next: Record<string, ReservationSlot> = {};
      for (const slot of (data ?? []) as unknown as ReservationSlot[]) {
        next[slot.id] = slot;
      }
      setSlots(next);
    }

    const channel = supabase
      .channel(`reservations-floor-map-${date}`)
      .on<ReservationSlot>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          select: SLOT_COLUMNS,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            if (payload.old.id) removeSlot(payload.old.id);
            return;
          }

          const slot = payload.new;
          if (slot.reservation_date === date && isActiveSlot(slot)) {
            setSlots((prev) => ({ ...prev, [slot.id]: slot }));
          } else {
            removeSlot(slot.id);
          }
        },
      )
      .subscribe((status) => {
        if (cancelled) return;

        if (status === 'SUBSCRIBED') {
          setRealtimeState('live');
          // Also runs after a reconnect, so events missed while offline are recovered.
          void loadSlots();
        } else if (
          status === 'CHANNEL_ERROR' ||
          status === 'TIMED_OUT' ||
          status === 'CLOSED'
        ) {
          setRealtimeState('offline');
        }
      });

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [date]);

  const occupiedTableIds = useMemo(() => {
    const ids = new Set<string>();
    if (!time) return ids;
    for (const slot of Object.values(slots)) {
      if (slot.reservation_time.slice(0, 5) === time) ids.add(slot.table_id);
    }
    return ids;
  }, [slots, time]);

  useEffect(() => {
    if (selectedTableId && occupiedTableIds.has(selectedTableId)) {
      setNotice(
        "Siz tanlagan stol shu vaqtga band qilindi. Iltimos, boshqa stolni tanlang.",
      );
      onSelect(null);
    }
  }, [occupiedTableIds, selectedTableId, onSelect]);

  const ready = Boolean(date && time);

  const handleSelect = (table: RestaurantTable) => {
    setNotice(null);
    onSelect(selectedTableId === table.id ? null : table);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.15em] text-white/60">
          <li className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border border-emerald-400 bg-emerald-500/30" />
            Bo&apos;sh
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border border-red-500 bg-red-500/30" />
            Band
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border border-emerald-400 bg-emerald-500/30 ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0A0A0A]" />
            Tanlangan
          </li>
        </ul>

        {ready && (
          <span
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/45"
            role="status"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                realtimeState === 'live'
                  ? 'animate-pulse bg-emerald-400'
                  : realtimeState === 'offline'
                    ? 'bg-red-500'
                    : 'bg-yellow-400'
              }`}
            />
            {realtimeState === 'live'
              ? 'Jonli'
              : realtimeState === 'offline'
                ? 'Aloqa uzildi'
                : 'Ulanmoqda'}
          </span>
        )}
      </div>

      {!ready && (
        <p className="rounded-sm border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-4 py-3 text-sm text-[#E8D48B]">
          Stollar bandligini ko&apos;rish uchun avval sana va vaqtni tanlang.
        </p>
      )}

      {notice && (
        <p
          role="alert"
          className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {notice}
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-400/90">
          {error}
        </p>
      )}

      {tablesLoading ? (
        <p className="py-10 text-center text-sm uppercase tracking-widest text-white/40">
          Yuklanmoqda...
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {ZONES.map((zone) => {
            const zoneTables = tables.filter((table) => table.zone === zone.key);

            return (
              <section
                key={zone.key}
                aria-label={zone.label}
                className="rounded-sm border border-white/10 bg-[#121212] p-4 pt-5"
              >
                <header className="mb-5 flex items-baseline justify-between">
                  <h3 className="text-xs font-medium uppercase tracking-[0.25em] text-[#D4AF37]">
                    {zone.label}
                  </h3>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-white/35">
                    {zone.hint}
                  </span>
                </header>

                {zoneTables.length === 0 ? (
                  <p className="py-6 text-center text-xs text-white/35">
                    Stollar yo&apos;q
                  </p>
                ) : (
                  <ul className="flex flex-wrap justify-center gap-x-5 gap-y-7 pb-2 pt-4">
                    {zoneTables.map((table) => {
                      const occupied = ready && occupiedTableIds.has(table.id);
                      const selected = selectedTableId === table.id;
                      const stateLabel = !ready
                        ? ''
                        : occupied
                          ? 'Band'
                          : "Bo'sh";

                      return (
                        <li key={table.id} className="group relative">
                          <button
                            type="button"
                            disabled={!ready || occupied}
                            aria-pressed={selected}
                            aria-label={`Stol ${table.table_number}, ${table.capacity} kishilik${stateLabel ? `, ${stateLabel}` : ''}`}
                            onClick={() => handleSelect(table)}
                            className={`peer relative flex flex-col items-center justify-center border-2 text-sm font-semibold transition-all duration-300 focus-visible:outline-none ${tableShape(table.capacity)} ${
                              occupied
                                ? 'cursor-not-allowed border-red-500 bg-red-500/20 text-red-300'
                                : 'border-emerald-400 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/35 disabled:cursor-not-allowed disabled:opacity-40'
                            } ${
                              selected
                                ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#121212]'
                                : 'focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]'
                            }`}
                          >
                            <span>{table.table_number}</span>
                            <span className="flex items-center gap-1 text-[10px] font-normal opacity-80">
                              <Users className="h-3 w-3" aria-hidden />
                              {table.capacity}
                            </span>
                          </button>

                          <span
                            role="tooltip"
                            className="pointer-events-none absolute -top-11 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-sm border border-white/15 bg-black px-3 py-1.5 text-[11px] font-normal text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 peer-focus-visible:opacity-100"
                          >
                            Stol №{table.table_number} · {table.capacity} kishilik
                            {stateLabel && ` · ${stateLabel}`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FloorMap;

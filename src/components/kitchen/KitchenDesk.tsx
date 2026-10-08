'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { kitchenLogout, kitchenSetStatus } from '@/app/actions/admin';
import { useLanguage } from '@/context/LanguageContext';
import {
  ZONE_LABELS,
  formatReservationDate,
  formatReservationTime,
  shortReservationCode,
} from '@/lib/reservation-format';
import type { KitchenAction, KitchenReservation } from '@/lib/reservation-ops';
import type { ReservationStatus } from '@/types/reservation';

interface KitchenDeskProps {
  reservations: KitchenReservation[];
}

const FILTERS: Array<'tonight' | ReservationStatus | 'all'> = [
  'tonight',
  'pending',
  'confirmed',
  'cancelled',
  'all',
];

const todayISO = (): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return parts;
};

const KitchenDesk: React.FC<KitchenDeskProps> = ({ reservations }) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('tonight');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const tonight = todayISO();

  const visible = useMemo(() => {
    if (filter === 'all') return reservations;
    if (filter === 'tonight') {
      return reservations.filter((row) => row.reservation_date === tonight);
    }
    return reservations.filter((row) => row.status === filter);
  }, [filter, reservations, tonight]);

  const run = async (id: string, action: KitchenAction) => {
    setBusyId(id);
    setNotice(null);
    const result = await kitchenSetStatus(id, action);
    setBusyId(null);
    setNotice(result.ok ? t(`kitchen.toast.${action}`) : result.message);
    router.refresh();
  };

  const signOut = async () => {
    await kitchenLogout();
    router.refresh();
  };

  return (
    <main
      id="main-content"
      className="mx-auto min-h-screen max-w-6xl px-4 pb-24 pt-28 sm:px-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.38em] text-[#D4AF37]">
            {t('kitchen.eyebrow')}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-[#F4EDE0]">
            {t('kitchen.title')}
          </h1>
          <p className="mt-2 text-sm text-[#A89F8C]">{t('kitchen.deskBody')}</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="inline-flex min-h-11 items-center text-[11px] uppercase tracking-[0.22em] text-white/50 hover:text-[#E8C96A]"
        >
          {t('kitchen.signOut')}
        </button>
      </div>

      <div
        role="tablist"
        aria-label={t('kitchen.filters')}
        className="mt-10 flex flex-wrap gap-2 border-b border-[#D4AF37]/20 pb-4"
      >
        {FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            onClick={() => setFilter(key)}
            className={`inline-flex min-h-11 items-center px-3 text-[11px] uppercase tracking-[0.18em] ${
              filter === key
                ? 'text-[#D4AF37]'
                : 'text-white/45 hover:text-[#E8C96A]'
            }`}
          >
            {t(`kitchen.filter.${key}`)}
          </button>
        ))}
      </div>

      {notice ? (
        <p className="mt-4 text-sm text-[#E8C96A]" role="status">
          {notice}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p className="mt-12 text-sm text-white/45">{t('kitchen.empty')}</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {visible.map((row) => (
            <li
              key={row.id}
              className="border border-[#D4AF37]/20 bg-[#0c0c0c] px-4 py-4 sm:px-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="font-serif text-2xl text-[#F4EDE0]">
                    {row.guest_name}
                  </p>
                  <p className="mt-1 text-sm text-[#A89F8C]">
                    {formatReservationDate(row.reservation_date)} ·{' '}
                    {formatReservationTime(row.reservation_time)} · #
                    {row.table_number} {ZONE_LABELS[row.zone]} · {row.party_size}{' '}
                    {t('kitchen.guests')}
                  </p>
                  <p className="mt-1 truncate text-xs tracking-wide text-white/40">
                    {row.guest_phone} · {row.guest_email} ·{' '}
                    {shortReservationCode(row.id)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#E8C96A]">
                    {t(`kitchen.status.${row.status}`)}
                  </span>
                  {row.status === 'pending' ? (
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => run(row.id, 'confirm')}
                      className="inline-flex min-h-11 items-center bg-[#D4AF37] px-4 text-[11px] uppercase tracking-[0.18em] text-[#0A0A0A] disabled:opacity-50"
                    >
                      {t('kitchen.confirm')}
                    </button>
                  ) : null}
                  {row.status === 'confirmed' ? (
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => run(row.id, 'complete')}
                      className="inline-flex min-h-11 items-center border border-[#D4AF37]/40 px-4 text-[11px] uppercase tracking-[0.18em] text-[#E8C96A] disabled:opacity-50"
                    >
                      {t('kitchen.complete')}
                    </button>
                  ) : null}
                  {row.status === 'pending' || row.status === 'confirmed' ? (
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => run(row.id, 'cancel')}
                      className="inline-flex min-h-11 items-center px-4 text-[11px] uppercase tracking-[0.18em] text-white/45 hover:text-red-300 disabled:opacity-50"
                    >
                      {t('kitchen.cancel')}
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default KitchenDesk;

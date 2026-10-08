'use client';

import React, { useState } from 'react';
import { CheckCircle2, Download, Loader2 } from 'lucide-react';
import {
  formatReservationDate,
  formatReservationTime,
  shortReservationCode,
} from '@/lib/reservation-format';
import type { ReservationDetails } from '@/types/reservation';
import { useLanguage } from '@/context/LanguageContext';

interface ReservationVoucherProps {
  reservation: ReservationDetails;
  message: string;
  onReset: () => void;
}

const ReservationVoucher: React.FC<ReservationVoucherProps> = ({
  reservation,
  message,
  onReset,
}) => {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);

    try {
      const { downloadReservationVoucher } = await import(
        '@/lib/pdf/generateVoucher'
      );
      await downloadReservationVoucher(reservation);
    } catch (downloadError) {
      console.error('[ReservationVoucher] PDF generation failed', downloadError);
      setError(t('reservation.voucher.pdfError'));
    } finally {
      setDownloading(false);
    }
  };

  const details: [string, string][] = [
    [t('reservation.voucher.guest'), reservation.guest_name],
    [
      t('reservation.voucher.date'),
      formatReservationDate(reservation.reservation_date),
    ],
    [
      t('reservation.voucher.time'),
      formatReservationTime(reservation.reservation_time),
    ],
    [
      t('reservation.voucher.table'),
      `№${reservation.table_number} · ${t(`reservation.floor.zone.${reservation.zone}`)}`,
    ],
    [
      t('reservation.voucher.party'),
      t('reservation.voucher.partyValue').replace(
        '{size}',
        String(reservation.party_size),
      ),
    ],
  ];

  return (
    <div
      role="status"
      data-testid="reservation-voucher"
      className="mx-auto max-w-xl rounded-sm border border-[#D4AF37]/30 bg-[#121212] px-6 py-10 text-center sm:px-10"
    >
      <CheckCircle2
        className="mx-auto mb-4 h-12 w-12 text-emerald-400"
        aria-hidden
      />
      <p className="text-lg text-white">{message}</p>

      <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-white/45">
        {t('reservation.voucher.code')}
      </p>
      <p className="mt-1 text-2xl font-bold tracking-[0.2em] text-[#E8C96A]">
        #{shortReservationCode(reservation.id)}
      </p>

      <dl className="mt-8 divide-y divide-white/10 border-y border-white/10 text-left text-sm">
        {details.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-6 py-3">
            <dt className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF37]">
              {label}
            </dt>
            <dd className="text-right text-white">{value}</dd>
          </div>
        ))}
      </dl>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          data-testid="download-voucher"
          onClick={handleDownload}
          disabled={downloading}
          className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#D4AF37] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-[#E8C96A] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Download className="h-4 w-4" aria-hidden />
          )}
          {t('reservation.voucher.pdf')}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-sm border border-[#D4AF37]/50 px-6 py-3 text-xs uppercase tracking-[0.2em] text-[#E8C96A] transition-colors hover:bg-[#D4AF37]/10 sm:w-auto"
        >
          {t('reservation.voucher.new')}
        </button>
      </div>
    </div>
  );
};

export default ReservationVoucher;

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { createReservation } from '@/app/actions/reservation';
import {
  MAX_PARTY_SIZE,
  RESERVATION_TIME_SLOTS,
  getTodayISO,
  isSlotInPast,
  reservationSchema,
  type ReservationInput,
} from '@/lib/validations/reservation';
import type {
  ReservationDetails,
  RestaurantTable,
} from '@/types/reservation';
import FloorMap from './FloorMap';

const ReservationVoucher = dynamic(() => import('./ReservationVoucher'), {
  ssr: false,
  loading: () => (
    <div
      className="flex min-h-[40vh] items-center justify-center text-sm text-white/50"
      aria-busy="true"
    >
      …
    </div>
  ),
});

interface Confirmation {
  message: string;
  reservation: ReservationDetails;
}

const DEFAULT_VALUES: ReservationInput = {
  guest_name: '',
  guest_email: '',
  guest_phone: '',
  party_size: 2,
  reservation_date: '',
  reservation_time: '',
  table_id: '',
  website: '',
};

const inputClass =
  'w-full rounded-sm border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#D4AF37]/40 focus:ring-1 focus:ring-[#D4AF37]/20 aria-[invalid=true]:border-red-500/60';

const labelClass =
  'mb-2 block text-[11px] font-medium uppercase tracking-[0.2em] text-white/55';

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, htmlFor, error, children }) => (
  <div>
    <label htmlFor={htmlFor} className={labelClass}>
      {label}
    </label>
    {children}
    {error && (
      <p role="alert" className="mt-1.5 text-xs text-red-400">
        {error}
      </p>
    )}
  </div>
);

const ReservationForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    mode: 'onTouched',
    defaultValues: DEFAULT_VALUES,
  });

  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(
    null,
  );
  const [minDate] = useState(() => getTodayISO());
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const date = watch('reservation_date');
  const time = watch('reservation_time');
  const tableId = watch('table_id');
  const partySize = watch('party_size');

  const handleSelectTable = useCallback(
    (table: RestaurantTable | null) => {
      setSelectedTable(table);
      setValue('table_id', table?.id ?? '', { shouldValidate: table !== null });
    },
    [setValue],
  );

  useEffect(() => {
    if (date && time && isSlotInPast(date, time)) {
      setValue('reservation_time', '');
    }
  }, [date, time, setValue]);

  const tooSmall =
    selectedTable !== null &&
    Number.isFinite(partySize) &&
    partySize > selectedTable.capacity;

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    if (selectedTable && values.party_size > selectedTable.capacity) {
      setError('table_id', {
        type: 'manual',
        message: `Bu stol ${selectedTable.capacity} kishigacha mo'ljallangan`,
      });
      return;
    }

    try {
      const result = await createReservation(values);

      if (result.success) {
        setConfirmation({
          message: result.message,
          reservation: result.reservation,
        });
        setSelectedTable(null);
        reset(DEFAULT_VALUES);
        return;
      }

      setServerError(result.message);

      if (result.code === 'SLOT_TAKEN' || result.code === 'TABLE_UNAVAILABLE') {
        handleSelectTable(null);
      }

      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        setError(field as keyof ReservationInput, { type: 'server', message });
      }
    } catch {
      setServerError(
        "Server bilan bog'lanib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.",
      );
    }
  });

  if (confirmation) {
    return (
      <ReservationVoucher
        reservation={confirmation.reservation}
        message={confirmation.message}
        onReset={() => setConfirmation(null)}
      />
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-10"
      data-testid="reservation-form"
    >
      {/* Honeypot: invisible to people and assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" className="hidden" style={{ display: 'none' }}>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('website')}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Ism"
          htmlFor="guest_name"
          error={errors.guest_name?.message}
        >
          <input
            id="guest_name"
            type="text"
            autoComplete="name"
            placeholder="Ism familiya"
            aria-invalid={Boolean(errors.guest_name)}
            className={inputClass}
            {...register('guest_name')}
          />
        </Field>

        <Field
          label="Telefon"
          htmlFor="guest_phone"
          error={errors.guest_phone?.message}
        >
          <input
            id="guest_phone"
            type="tel"
            autoComplete="tel"
            placeholder="+998 90 123 45 67"
            aria-invalid={Boolean(errors.guest_phone)}
            className={inputClass}
            {...register('guest_phone')}
          />
        </Field>

        <Field
          label="Email"
          htmlFor="guest_email"
          error={errors.guest_email?.message}
        >
          <input
            id="guest_email"
            type="email"
            autoComplete="email"
            placeholder="siz@example.com"
            aria-invalid={Boolean(errors.guest_email)}
            className={inputClass}
            {...register('guest_email')}
          />
        </Field>

        <Field
          label="Mehmonlar soni"
          htmlFor="party_size"
          error={errors.party_size?.message}
        >
          <select
            id="party_size"
            aria-invalid={Boolean(errors.party_size)}
            className={inputClass}
            {...register('party_size', { valueAsNumber: true })}
          >
            {Array.from({ length: MAX_PARTY_SIZE }, (_, index) => index + 1).map(
              (size) => (
                <option key={size} value={size} className="bg-[#121212]">
                  {size} kishi
                </option>
              ),
            )}
          </select>
        </Field>

        <Field
          label="Sana"
          htmlFor="reservation_date"
          error={errors.reservation_date?.message}
        >
          <input
            id="reservation_date"
            type="date"
            min={minDate}
            aria-invalid={Boolean(errors.reservation_date)}
            className={`${inputClass} [color-scheme:dark]`}
            {...register('reservation_date')}
          />
        </Field>
      </div>

      <fieldset>
        <legend className={labelClass}>Vaqt</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
          {RESERVATION_TIME_SLOTS.map((slot) => {
            const past = Boolean(date) && isSlotInPast(date, slot);

            return (
              <label key={slot} className="relative">
                <input
                  type="radio"
                  value={slot}
                  disabled={past}
                  className="peer sr-only"
                  {...register('reservation_time')}
                />
                <span className="flex min-h-11 cursor-pointer items-center justify-center rounded-sm border border-white/10 px-3 text-center text-sm text-white/65 transition-all duration-300 hover:border-white/25 hover:text-white peer-checked:border-[#D4AF37]/60 peer-checked:bg-[#D4AF37]/10 peer-checked:text-[#E8C96A] peer-focus-visible:ring-2 peer-focus-visible:ring-[#D4AF37]/50 peer-disabled:cursor-not-allowed peer-disabled:opacity-30 peer-disabled:hover:border-white/10 peer-disabled:hover:text-white/65">
                  {slot}
                </span>
              </label>
            );
          })}
        </div>
        {errors.reservation_time && (
          <p role="alert" className="mt-1.5 text-xs text-red-400">
            {errors.reservation_time.message}
          </p>
        )}
      </fieldset>

      <div>
        <p className={labelClass}>Stolni tanlang</p>
        <FloorMap
          date={date || null}
          time={time || null}
          selectedTableId={tableId || null}
          onSelect={handleSelectTable}
        />

        {selectedTable && (
          <p className="mt-4 text-sm text-white/70">
            Tanlangan stol:{' '}
            <span className="text-[#E8C96A]">
              №{selectedTable.table_number}
            </span>{' '}
            ({selectedTable.capacity} kishilik)
          </p>
        )}
        {tooSmall && selectedTable && (
          <p className="mt-1.5 text-xs text-yellow-400">
            Bu stol {selectedTable.capacity} kishigacha mo&apos;ljallangan, siz{' '}
            {partySize} kishi tanladingiz.
          </p>
        )}
        {errors.table_id && (
          <p role="alert" className="mt-1.5 text-xs text-red-400">
            {errors.table_id.message}
          </p>
        )}
      </div>

      {serverError && (
        <p
          role="alert"
          className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        data-testid="submit-reservation"
        className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#D4AF37] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-[#E8C96A] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {isSubmitting ? 'Yuborilmoqda...' : 'Bron qilish'}
      </button>
    </form>
  );
};

export default ReservationForm;

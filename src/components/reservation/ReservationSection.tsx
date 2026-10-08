'use client';

import React from 'react';
import ReservationForm from './ReservationForm';
import { useLanguage } from '@/context/LanguageContext';

const ReservationSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section
      id="reservation"
      className="relative bg-[#070707] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center sm:mb-14">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.42em] text-[#D4AF37]">
            {t('reservation.eyebrow')}
          </p>
          <h2 className="font-serif text-4xl font-semibold tracking-[0.08em] text-[#F4EDE0] sm:text-5xl lg:text-6xl">
            {t('reservation.title')}
          </h2>
          <span
            className="mx-auto mt-6 block h-px w-16 bg-[#D4AF37]"
            aria-hidden
          />
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed tracking-[0.02em] text-[#A89F8C] sm:text-base">
            {t('reservation.subtitle')}
          </p>
        </header>

        <div className="border border-[#D4AF37]/22 bg-[#0c0c0c] px-4 py-8 sm:px-8 sm:py-10">
          <ReservationForm />
        </div>
      </div>
    </section>
  );
};

export default ReservationSection;

import React from 'react';
import ReservationForm from './ReservationForm';

const ReservationSection: React.FC = () => {
  return (
    <section
      id="reservation"
      className="relative bg-[#0A0A0A] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center sm:mb-14">
          <p className="mb-3 text-xs font-light uppercase tracking-[0.35em] text-[#D4AF37]">
            Bron qilish
          </p>
          <h2 className="text-3xl font-bold tracking-[0.12em] text-white sm:text-4xl lg:text-5xl">
            STOL BAND QILING
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/50 sm:text-base">
            Sana va vaqtni tanlang, zal xaritasidan o&apos;zingizga yoqqan
            stolni belgilang. Band stollar real vaqtda yangilanadi.
          </p>
        </header>

        <ReservationForm />
      </div>
    </section>
  );
};

export default ReservationSection;

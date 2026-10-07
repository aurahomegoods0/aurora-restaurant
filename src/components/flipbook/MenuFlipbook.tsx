'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';
import { useMenuItems } from './useMenuItems';
import './materials.css';
import './stage.css';

const FlipBook = dynamic(() => import('./FlipBook').then((mod) => mod.FlipBook), {
  ssr: false,
  loading: () => <ClosedBook />,
});

const ClosedBook = () => {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[420px] items-center justify-center py-10 sm:min-h-[520px]">
      <div className="flipbook-closed leather relative h-[340px] w-[230px] rounded-sm sm:h-[400px] sm:w-[270px]">
        <span
          aria-hidden
          className="absolute left-[11px] top-0 bottom-0 w-px bg-gradient-to-b from-[#D4AF37]/0 via-[#D4AF37]/70 to-[#D4AF37]/0"
        />
        <div className="flex h-full flex-col items-center justify-center px-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.42em] text-[#D4AF37]/70">AURORA</p>
          <p className="gold-foil mt-4 font-serif text-3xl font-semibold tracking-[0.18em] [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent]">
            AURORA
          </p>
          <span className="mx-auto mt-6 block h-px w-12 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          <p className="mt-6 text-[10px] uppercase tracking-[0.32em] text-white/40">
            {t('flipbook.loading')}
          </p>
        </div>
      </div>
    </div>
  );
};

const GestureHints = () => {
  const { t } = useLanguage();
  const hints = [
    t('flipbook.gestures.corner'),
    t('flipbook.gestures.swipe'),
    t('flipbook.gestures.keys'),
  ];

  return (
    <ul className="mb-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.28em] text-white/40">
      {hints.map((hint, index) => (
        <li key={hint} className="flex items-center gap-4">
          {index > 0 ? (
            <span aria-hidden className="text-[#D4AF37]/55">
              ·
            </span>
          ) : null}
          <span>{hint}</span>
        </li>
      ))}
    </ul>
  );
};

const MenuFlipbook = () => {
  const { t } = useLanguage();
  const { items, loading, error } = useMenuItems();

  let stage: ReactNode;
  if (loading) {
    stage = <ClosedBook />;
  } else if (error) {
    stage = (
      <p className="py-24 text-center text-sm text-white/55" role="alert">
        {t('flipbook.error')}
      </p>
    );
  } else if (items.length === 0) {
    stage = (
      <p className="py-24 text-center text-sm text-white/55">{t('flipbook.empty')}</p>
    );
  } else {
    stage = <FlipBook items={items} />;
  }

  return (
    <section
      id="flipbook"
      className="relative overflow-hidden bg-[#070707] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28"
      aria-labelledby="flipbook-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12),transparent_68%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(180,40,40,0.08),transparent_70%)]"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

      <p
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-16 hidden -translate-x-1/2 select-none font-serif text-[clamp(4rem,14vw,11rem)] font-semibold leading-none tracking-[0.18em] text-transparent opacity-[0.07] [-webkit-text-stroke:1px_rgba(212,175,55,0.35)] lg:block"
      >
        {t('flipbook.ghost')}
      </p>

      <div className="relative mx-auto max-w-6xl">
        <header className="mb-10 text-center sm:mb-12">
          <p className="mb-4 text-[11px] font-light uppercase tracking-[0.42em] text-[#D4AF37]">
            {t('flipbook.eyebrow')}
          </p>
          <h2
            id="flipbook-heading"
            className="font-serif text-4xl font-semibold tracking-[0.08em] text-white sm:text-5xl lg:text-6xl"
          >
            {t('flipbook.title')}
          </h2>
          <span
            className="mx-auto mt-6 block h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
            aria-hidden
          />
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
            {t('flipbook.subtitle')}
          </p>
          {items.length > 0 ? (
            <p className="mt-4 font-serif text-sm tracking-[0.2em] text-[#E8C96A]/80">
              {t('flipbook.leafCount').replace('{count}', String(items.length))}
            </p>
          ) : null}
        </header>

        <GestureHints />

        <div className="flipbook-lectern rounded-sm px-1 py-6 sm:px-6 sm:py-10 lg:px-10">
          <div className="flipbook-sheen" aria-hidden />
          <div className="relative">{stage}</div>
        </div>
      </div>
    </section>
  );
};

export default MenuFlipbook;

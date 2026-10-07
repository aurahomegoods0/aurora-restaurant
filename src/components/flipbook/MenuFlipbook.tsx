'use client';

import { useLanguage } from '@/context/LanguageContext';
import { FlipBook } from './FlipBook';
import { STAGE_H } from './bookModel';
import { useMenuItems } from './useMenuItems';

export default function MenuFlipbook() {
  const { t } = useLanguage();
  const { items, loading, error } = useMenuItems();

  return (
    <section
      id="flipbook"
      aria-labelledby="flipbook-title"
      className="relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,#14214f_0%,#0a1030_45%,#050711_100%)] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] h-[520px] w-[920px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(212,175,55,0.14),transparent_65%)]"
      />

      <div className="relative mx-auto max-w-[1180px]">
        <header className="mb-8 text-center sm:mb-10">
          <p className="mb-3 text-xs font-light uppercase tracking-[0.35em] text-[#D4AF37]">
            {t('flipbook.eyebrow')}
          </p>
          <h2
            id="flipbook-title"
            className="font-serif text-3xl font-semibold tracking-[0.08em] text-white sm:text-4xl lg:text-5xl"
          >
            {t('flipbook.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            {t('flipbook.subtitle')}
          </p>
        </header>

        {loading ? (
          <div
            role="status"
            className="flex items-center justify-center"
            style={{ minHeight: STAGE_H * 0.7 }}
          >
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">
              {t('flipbook.loading')}
            </p>
          </div>
        ) : error ? (
          <p className="py-24 text-center text-sm text-red-300/90">{t('flipbook.error')}</p>
        ) : items.length === 0 ? (
          <p className="py-24 text-center text-sm text-white/50">{t('flipbook.empty')}</p>
        ) : (
          <FlipBook items={items} />
        )}
      </div>
    </section>
  );
}

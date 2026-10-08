'use client';

import { restaurantConfig } from '../../../../restaurant.config';
import { useLanguage } from '@/context/LanguageContext';
import { useBook } from '../bookContext';
import { AuroraEmblem, GOLD_INK, GoldDivider, INK, INK_SOFT, PageFrame } from './decor';

/** Embossed hinge groove where the board meets the spine. */
function HingeGroove({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-0 bottom-0 w-[14px]"
      style={{
        [side]: 20,
        background:
          'linear-gradient(90deg, rgba(0,0,0,0.55), rgba(255,255,255,0.12) 38%, rgba(0,0,0,0.35) 62%, rgba(255,255,255,0.08))',
        boxShadow: 'inset 0 0 6px rgba(0,0,0,0.6)',
      }}
    />
  );
}

/** Gold-stamped corner flourish for the leather covers. */
function CornerStamp({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 40"
      className={`absolute h-10 w-10 ${className}`}
      fill="none"
      stroke="#d4af37"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M2 38 V10 C2 5 5 2 10 2 H38" />
      <path d="M9 38 V14 C9 11 11 9 14 9 H38" opacity="0.6" />
      <circle cx="14" cy="14" r="2" fill="#d4af37" stroke="none" />
    </svg>
  );
}

export function CoverFront({ active }: { active: boolean }) {
  const { t } = useLanguage();

  return (
    <div className="absolute inset-0 select-none">
      <HingeGroove side="left" />

      {/* Stitched leather sheen */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(112deg,rgba(255,255,255,0.18)_0%,transparent_32%,transparent_62%,rgba(0,0,0,0.3)_100%)]" />

      <div className="absolute inset-y-[30px] left-[48px] right-[30px] border-2 border-[#d4af37]/80 shadow-[0_0_0_1px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-[6px] border border-[#d4af37]/55" />
        <CornerStamp className="-left-[3px] -top-[3px]" />
        <CornerStamp className="-right-[3px] -top-[3px] scale-x-[-1]" />
        <CornerStamp className="-bottom-[3px] -left-[3px] scale-y-[-1]" />
        <CornerStamp className="-bottom-[3px] -right-[3px] scale-[-1]" />

        <div className="relative flex h-full flex-col items-center justify-center px-4 text-center font-serif">
          <p className="mb-8 text-[12px] font-semibold uppercase tracking-[0.5em] text-[#e8cf7a]">
            {t('flipbook.cover.eyebrow')}
          </p>

          <div className="relative mb-7">
            <div
              aria-hidden
              className={`absolute left-1/2 top-1/2 h-40 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(245,214,120,0.55),transparent_68%)] blur-xl ${
                active ? 'glow-pulse' : 'opacity-60'
              }`}
            />
            <AuroraEmblem size={92} />
          </div>

          <h3
            className={`gold-foil relative text-[58px] font-semibold leading-none tracking-[0.2em] [text-indent:0.2em] drop-shadow-[0_2px_1px_rgba(0,0,0,0.75)] [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] ${
              active ? 'gold-foil-animated' : ''
            }`}
          >
            {t('flipbook.cover.title')}
          </h3>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#d4af37]" />
            <span className="h-2 w-2 rotate-45 bg-[#d4af37] shadow-[0_0_8px_rgba(245,214,120,0.9)]" />
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#d4af37]" />
          </div>

          <p className="gold-foil text-[15px] font-semibold uppercase tracking-[0.42em] [text-indent:0.42em] [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent]">
            {t('flipbook.cover.subtitle')}
          </p>

          <p className="absolute bottom-10 text-[11.5px] uppercase tracking-[0.34em] text-[#e8cf7a]/85">
            {t('flipbook.cover.tagline')}
          </p>
        </div>
      </div>
    </div>
  );
}

export function BackCoverArt() {
  const { t } = useLanguage();
  return (
    <div className="absolute inset-0 flex select-none flex-col items-center justify-center gap-5 font-serif">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(248deg,rgba(255,255,255,0.14)_0%,transparent_34%,transparent_60%,rgba(0,0,0,0.32)_100%)]" />
      <AuroraEmblem size={84} />
      <p className="gold-foil text-[26px] font-semibold tracking-[0.3em] [text-indent:0.3em] [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent]">
        {restaurantConfig.name}
      </p>
      <p className="text-[11.5px] uppercase tracking-[0.34em] text-[#e8cf7a]/85">
        {t('flipbook.backCover.tagline')}
      </p>
    </div>
  );
}

export function IntroPage({ interactive }: { interactive: boolean }) {
  const { t } = useLanguage();
  const { toc, goTo } = useBook();

  return (
    <div
      className="absolute inset-0 flex flex-col items-center font-serif"
      style={{ padding: '44px 46px 40px', color: INK }}
    >
      <PageFrame />
      <AuroraEmblem size={54} variant="ink" />
      <h3
        className="relative mt-3 text-[32px] font-semibold uppercase tracking-[0.22em] [text-indent:0.22em]"
        style={{ color: GOLD_INK }}
      >
        {t('flipbook.intro.title')}
      </h3>
      <GoldDivider className="my-3" />
      <p className="relative mb-6 text-center text-[14px] italic" style={{ color: INK_SOFT }}>
        {t('flipbook.intro.lead')}
      </p>

      <ul className="relative w-full space-y-3.5">
        {toc.map((entry) => (
          <li key={entry.category}>
            <button
              type="button"
              tabIndex={interactive ? 0 : -1}
              onClick={() => goTo(entry.view)}
              className="group flex w-full items-baseline gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8a6a14]"
            >
              <span className="text-[20px] font-semibold tracking-wide transition-colors group-hover:text-[#8a6a14]">
                {t(`menu.categories.${entry.category}`)}
              </span>
              <span className="mb-1 h-0 flex-1 border-b border-dotted border-[#8a6a14]/60" />
              <span className="text-[13px] tabular-nums" style={{ color: INK_SOFT }}>
                {entry.count} {t('flipbook.intro.dishes')}
              </span>
              <span
                className="w-12 text-right text-[13px] font-semibold tabular-nums"
                style={{ color: GOLD_INK }}
              >
                {t('flipbook.intro.page')} {entry.pageNumber}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BackInnerPage({ interactive }: { interactive: boolean }) {
  const { t } = useLanguage();
  const { scrollToReservation } = useBook();
  const { contact } = restaurantConfig;

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center text-center font-serif"
      style={{ padding: '40px 44px', color: INK }}
    >
      <PageFrame />
      <AuroraEmblem size={64} variant="ink" />
      <h3
        className="relative mt-4 text-[30px] font-semibold leading-tight"
        style={{ color: GOLD_INK }}
      >
        {t('flipbook.backInner.title')}
      </h3>
      <GoldDivider className="my-3.5" />
      <p className="relative max-w-[300px] text-[14.5px] italic leading-relaxed" style={{ color: INK_SOFT }}>
        {t('flipbook.backInner.body')}
      </p>

      <button
        type="button"
        tabIndex={interactive ? 0 : -1}
        onClick={scrollToReservation}
        className="relative mt-6 rounded-full border border-[#5b430c] bg-[linear-gradient(180deg,#f3e4a8,#d4af37_55%,#a8801e)] px-7 py-3 text-[12.5px] font-bold uppercase tracking-[0.18em] text-[#2b1f10] shadow-[0_3px_8px_rgba(60,40,10,0.35),inset_0_1px_0_rgba(255,255,255,0.7)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2b1f10]"
      >
        {t('flipbook.backInner.cta')}
      </button>

      <address
        className="relative mt-8 text-[13px] not-italic leading-[1.7]"
        style={{ color: INK_SOFT }}
      >
        {contact.address}
        <br />
        {contact.phone}
        <br />
        {contact.workingHours}
      </address>
    </div>
  );
}

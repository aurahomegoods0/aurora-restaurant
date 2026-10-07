'use client';

import { useLanguage } from '@/context/LanguageContext';
import { visiblePages, type BookMode } from './bookModel';

interface ArrowProps {
  view: number;
  maxView: number;
  onPrev: () => void;
  onNext: () => void;
}

const Arrow = ({
  direction,
  disabled,
  label,
  onClick,
}: {
  direction: 'left' | 'right';
  disabled: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/55 bg-[#0A0A0A]/80 text-[#E8C96A] shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 disabled:cursor-not-allowed disabled:opacity-25"
  >
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      {direction === 'left' ? (
        <path d="M11.5 4L6.5 9l5 5" stroke="currentColor" strokeWidth="1.4" />
      ) : (
        <path d="M6.5 4l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
      )}
    </svg>
  </button>
);

export const FloatingArrows = ({ view, maxView, onPrev, onNext }: ArrowProps) => {
  const { t } = useLanguage();

  return (
    <>
      <div className="pointer-events-none absolute left-1 top-1/2 z-20 hidden -translate-y-1/2 sm:block lg:-left-2">
        <div className="pointer-events-auto">
          <Arrow
            direction="left"
            disabled={view <= 0}
            label={t('flipbook.controls.prev')}
            onClick={onPrev}
          />
        </div>
      </div>
      <div className="pointer-events-none absolute right-1 top-1/2 z-20 hidden -translate-y-1/2 sm:block lg:-right-2">
        <div className="pointer-events-auto">
          <Arrow
            direction="right"
            disabled={view >= maxView}
            label={t('flipbook.controls.next')}
            onClick={onNext}
          />
        </div>
      </div>
    </>
  );
};

interface ToolbarProps extends ArrowProps {
  mode: BookMode;
  totalPages: number;
  soundOn: boolean;
  onToggleSound: () => void;
}

export const BookToolbar = ({
  mode,
  view,
  maxView,
  totalPages,
  soundOn,
  onPrev,
  onNext,
  onToggleSound,
}: ToolbarProps) => {
  const { t } = useLanguage();
  const pages = visiblePages(mode, view);
  const pageLabel =
    mode === 'spread'
      ? view === 0
        ? t('flipbook.controls.cover')
        : t('flipbook.controls.pagesOf')
            .replace('{left}', String(pages.left ?? 1))
            .replace('{right}', String(pages.right))
            .replace('{total}', String(totalPages))
      : t('flipbook.controls.pageOf')
          .replace('{current}', String(pages.right))
          .replace('{total}', String(totalPages));

  return (
    <div className="mt-5 flex items-center justify-center gap-3 sm:mt-6">
      <div className="flex items-center gap-2 rounded-full border border-[#D4AF37]/25 bg-[#0A0A0A]/85 px-2 py-1.5 backdrop-blur-md">
        <Arrow
          direction="left"
          disabled={view <= 0}
          label={t('flipbook.controls.prev')}
          onClick={onPrev}
        />
        <p className="min-w-[9.5rem] px-2 text-center text-[10px] uppercase tracking-[0.22em] text-[#E8C96A]/80">
          {pageLabel}
        </p>
        <Arrow
          direction="right"
          disabled={view >= maxView}
          label={t('flipbook.controls.next')}
          onClick={onNext}
        />
        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundOn ? t('flipbook.controls.mute') : t('flipbook.controls.sound')}
          aria-pressed={soundOn}
          className="ml-0.5 flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/35 text-[#E8C96A] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
        >
          {soundOn ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 6.5v3h2.2L7 12.2V3.8L4.2 6.5H2Z" stroke="currentColor" strokeWidth="1.2" />
              <path d="M9.4 5.4c.9.7 1.4 1.6 1.4 2.6s-.5 1.9-1.4 2.6" stroke="currentColor" strokeWidth="1.2" />
              <path d="M11.4 3.8c1.5 1.2 2.3 2.8 2.3 4.2s-.8 3-2.3 4.2" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 6.5v3h2.2L7 12.2V3.8L4.2 6.5H2Z" stroke="currentColor" strokeWidth="1.2" />
              <path d="M10 6l3 4M13 6l-3 4" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

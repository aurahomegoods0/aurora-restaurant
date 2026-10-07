'use client';

import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { visiblePages, type BookMode } from './bookModel';

interface ArrowButtonProps {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
  className?: string;
}

function ArrowButton({ direction, disabled, onClick, className }: ArrowButtonProps) {
  const { t } = useLanguage();
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={t(direction === 'prev' ? 'flipbook.controls.prev' : 'flipbook.controls.next')}
      className={`flex h-12 w-12 items-center justify-center rounded-full border border-[#d4af37]/50 bg-[#0d1838]/85 text-[#e8cf7a] shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-[#f3e4a8] hover:text-white hover:shadow-[0_0_24px_rgba(212,175,55,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] disabled:pointer-events-none disabled:opacity-25 ${className ?? ''}`}
    >
      <Icon className="h-6 w-6" aria-hidden />
    </button>
  );
}

interface FloatingArrowsProps {
  view: number;
  maxView: number;
  onPrev: () => void;
  onNext: () => void;
}

/** Large arrows that float beside the book on tablet/desktop. */
export function FloatingArrows({ view, maxView, onPrev, onNext }: FloatingArrowsProps) {
  return (
    <>
      <ArrowButton
        direction="prev"
        disabled={view <= 0}
        onClick={onPrev}
        className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 md:flex"
      />
      <ArrowButton
        direction="next"
        disabled={view >= maxView}
        onClick={onNext}
        className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 md:flex"
      />
    </>
  );
}

interface BookToolbarProps {
  mode: BookMode;
  view: number;
  maxView: number;
  totalPages: number;
  soundOn: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleSound: () => void;
}

export function BookToolbar({
  mode,
  view,
  maxView,
  totalPages,
  soundOn,
  onPrev,
  onNext,
  onToggleSound,
}: BookToolbarProps) {
  const { t } = useLanguage();
  const { left, right } = visiblePages(mode, view);

  const label =
    left === null
      ? t('flipbook.controls.pageOf')
          .replace('{current}', String(right))
          .replace('{total}', String(totalPages))
      : t('flipbook.controls.pagesOf')
          .replace('{left}', String(left))
          .replace('{right}', String(right))
          .replace('{total}', String(totalPages));

  return (
    <div className="mt-2 flex items-center justify-center gap-2 sm:gap-4">
      <ArrowButton
        direction="prev"
        disabled={view <= 0}
        onClick={onPrev}
        className="shrink-0 md:hidden"
      />

      <p
        aria-live="polite"
        className="min-w-0 flex-1 truncate text-center font-serif text-sm uppercase tracking-[0.22em] text-[#e8cf7a] sm:flex-none sm:min-w-[10.5rem]"
      >
        {label}
      </p>

      <ArrowButton
        direction="next"
        disabled={view >= maxView}
        onClick={onNext}
        className="shrink-0 md:hidden"
      />

      <button
        type="button"
        onClick={onToggleSound}
        aria-pressed={soundOn}
        aria-label={t(soundOn ? 'flipbook.controls.sound' : 'flipbook.controls.mute')}
        title={t(soundOn ? 'flipbook.controls.sound' : 'flipbook.controls.mute')}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-[#d4af37]/60 hover:text-[#e8cf7a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]"
      >
        {soundOn ? (
          <Volume2 className="h-5 w-5" aria-hidden />
        ) : (
          <VolumeX className="h-5 w-5" aria-hidden />
        )}
      </button>
    </div>
  );
}

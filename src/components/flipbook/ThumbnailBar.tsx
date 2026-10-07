'use client';

import { memo, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { getMenuItemName } from '@/components/menu/menuUtils';
import type { BookMode, Thumb } from './bookModel';
import { visiblePages } from './bookModel';

interface ThumbnailBarProps {
  thumbs: Thumb[];
  mode: BookMode;
  view: number;
  onJump: (view: number) => void;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=70';

function ThumbImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      src={failed ? FALLBACK_IMAGE : src}
      alt=""
      fill
      sizes="46px"
      draggable={false}
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function ThumbnailBarImpl({ thumbs, mode, view, onJump }: ThumbnailBarProps) {
  const { t, language } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const { left, right } = visiblePages(mode, view);

  useEffect(() => {
    const track = trackRef.current;
    const active = track?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!track || !active) return;
    const target = active.offsetLeft - (track.clientWidth - active.offsetWidth) / 2;
    track.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [view]);

  return (
    <nav aria-label={t('flipbook.controls.jump')} className="mt-5 w-full">
      <div
        ref={trackRef}
        className="no-scrollbar relative mx-auto flex max-w-full overflow-x-auto px-1 pb-3 pt-1"
      >
        <div className="mx-auto flex gap-2.5">
          {thumbs.map((thumb) => {
            const active = thumb.pageNumber === right || thumb.pageNumber === left;
            const label = thumb.item ? getMenuItemName(thumb.item, language) : thumb.label;

            return (
              <button
                key={thumb.key}
                type="button"
                onClick={() => onJump(thumb.view)}
                aria-current={active ? 'page' : undefined}
                aria-label={`${t('flipbook.controls.jump')}: ${label}`}
                title={label}
                className={`group relative h-[60px] w-[46px] shrink-0 overflow-hidden rounded-[3px] border transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] ${
                  active
                    ? '-translate-y-1 border-[#f3e4a8] shadow-[0_6px_16px_rgba(212,175,55,0.45)]'
                    : 'border-white/15 opacity-70 hover:-translate-y-0.5 hover:opacity-100'
                }`}
              >
                {thumb.item ? (
                  <ThumbImage src={thumb.item.image_url} />
                ) : thumb.kind === 'cover' ? (
                  <span className="leather absolute inset-0 flex items-center justify-center font-serif text-[15px] font-semibold text-[#e8cf7a]">
                    A
                  </span>
                ) : (
                  <span className="paper absolute inset-0 flex flex-col items-center justify-center gap-[3px] px-1.5">
                    <span className="h-px w-full bg-[#8a6a14]/60" />
                    <span className="h-px w-3/4 bg-[#8a6a14]/40" />
                    <span className="h-px w-full bg-[#8a6a14]/40" />
                    <span className="h-px w-2/3 bg-[#8a6a14]/40" />
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent pb-0.5 pt-3 text-center text-[9px] font-semibold tabular-nums text-white/90">
                  {thumb.pageNumber}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export const ThumbnailBar = memo(ThumbnailBarImpl);

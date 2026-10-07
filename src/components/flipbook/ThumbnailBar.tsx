'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { getOptimizedImageUrl } from '@/components/menu/menuUtils';
import type { BookMode, Thumb } from './bookModel';

const FALLBACK =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=70';

interface ThumbnailBarProps {
  thumbs: Thumb[];
  mode: BookMode;
  view: number;
  onJump: (view: number) => void;
}

const ThumbButton = ({
  thumb,
  active,
  jumpLabel,
  onJump,
}: {
  thumb: Thumb;
  active: boolean;
  jumpLabel: string;
  onJump: (view: number) => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const isDish = thumb.kind === 'dish' && Boolean(thumb.item?.image_url);
  const surface =
    thumb.kind === 'cover' ? 'leather text-[#E8C96A]' : 'paper text-[#5c3a1e]';

  return (
    <button
      type="button"
      aria-label={`${jumpLabel}: ${thumb.label}`}
      aria-current={active ? 'true' : undefined}
      onClick={() => onJump(thumb.view)}
      className={`relative h-[72px] w-[52px] overflow-hidden rounded-sm border transition ${
        active
          ? 'border-[#D4AF37] shadow-[0_0_0_1px_rgba(212,175,55,0.35)]'
          : 'border-white/10 opacity-70 hover:border-[#D4AF37]/50 hover:opacity-100'
      }`}
    >
      {isDish ? (
        <Image
          src={
            imageError
              ? FALLBACK
              : getOptimizedImageUrl(thumb.item!.image_url, 160, 65)
          }
          alt=""
          fill
          sizes="52px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span
          className={`flex h-full w-full items-end justify-center px-1 pb-2 text-center text-[8px] uppercase tracking-[0.14em] ${surface}`}
        >
          {thumb.label}
        </span>
      )}
    </button>
  );
};

export const ThumbnailBar = ({ thumbs, view, onJump }: ThumbnailBarProps) => {
  const { t } = useLanguage();
  const jumpLabel = t('flipbook.controls.jump');

  return (
    <nav aria-label={jumpLabel} className="mt-5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max justify-center gap-2 px-1">
        {thumbs.map((thumb) => (
          <ThumbButton
            key={thumb.key}
            thumb={thumb}
            active={thumb.view === view}
            jumpLabel={jumpLabel}
            onJump={onJump}
          />
        ))}
      </div>
    </nav>
  );
};

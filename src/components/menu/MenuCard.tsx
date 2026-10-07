'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import type { MenuItem } from '@/types/menu';
import { badgeStyles, filterBadgeTags } from './menuBadges';
import {
  getMenuItemDescription,
  getMenuItemName,
  getOptimizedImageUrl,
} from './menuUtils';

interface MenuCardProps {
  item: MenuItem;
  index: number;
  onSelect: (item: MenuItem) => void;
}

const FALLBACK =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';

const MenuCard: React.FC<MenuCardProps> = ({ item, index, onSelect }) => {
  const { language, t } = useLanguage();
  const [imageError, setImageError] = React.useState(false);
  const name = getMenuItemName(item, language);
  const description = getMenuItemDescription(item, language);
  const tags = filterBadgeTags(item.tags);
  const number = String(index + 1).padStart(2, '0');

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group relative flex min-h-11 w-full items-stretch gap-4 overflow-hidden rounded-sm border border-white/[0.07] bg-white/[0.015] p-3 text-left transition-[border-color,background-color,box-shadow] duration-500 hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/[0.04] hover:shadow-[0_0_40px_-12px_rgba(212,175,55,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] sm:gap-5 sm:p-4"
      aria-label={t('menu.modal.openDish').replace('{name}', name)}
    >
      <span
        className="pointer-events-none absolute inset-y-3 left-0 w-px origin-top scale-y-0 bg-[#D4AF37] transition-transform duration-500 group-hover:scale-y-100"
        aria-hidden
      />

      <div className="relative h-[5.5rem] w-[4.25rem] shrink-0 overflow-hidden rounded-sm bg-[#121212] sm:h-[7.25rem] sm:w-[5.5rem]">
        <Image
          src={
            imageError
              ? FALLBACK
              : getOptimizedImageUrl(item.image_url, 480, 70)
          }
          alt=""
          aria-hidden
          fill
          sizes="88px"
          quality={65}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          onError={() => setImageError(true)}
        />
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
          aria-hidden
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="flex items-start gap-3">
          <span
            className="menu-index mt-0.5 shrink-0 font-serif text-[11px] tracking-[0.22em] text-[#D4AF37]/70"
            aria-hidden
          >
            {number}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <h3 className="min-w-0 font-serif text-[1.05rem] leading-snug tracking-wide text-white sm:text-xl">
                {name}
              </h3>
              <span className="menu-leader hidden sm:block" aria-hidden />
              <p className="shrink-0 font-serif text-base tabular-nums text-[#E8C96A] sm:text-lg">
                ${Number(item.price).toFixed(0)}
              </p>
            </div>
            {description ? (
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/55">
                {description}
              </p>
            ) : null}
            {tags.length > 0 ? (
              <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-hidden>
                {tags.map((tag) => (
                  <li
                    key={tag}
                    className={`rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] ${badgeStyles[tag]}`}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
};

export default MenuCard;

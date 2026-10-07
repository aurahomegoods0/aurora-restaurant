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
  onSelect: (item: MenuItem) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ item, onSelect }) => {
  const { language, t } = useLanguage();
  const [imageError, setImageError] = React.useState(false);
  const name = getMenuItemName(item, language);
  const description = getMenuItemDescription(item, language);
  const tags = filterBadgeTags(item.tags);

  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-sm border border-white/[0.08] bg-[#0A0A0A] text-left transition-shadow duration-500 hover:border-[#D4AF37]/25 hover:shadow-[0_0_25px_rgba(212,175,55,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
      aria-label={t('menu.modal.openDish').replace('{name}', name)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#121212]">
        <Image
          src={
            imageError
              ? fallbackImage
              : getOptimizedImageUrl(item.image_url, 800, 70)
          }
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={65}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-serif text-lg leading-snug tracking-wide text-white sm:text-xl">
            {name}
          </h3>
          <p className="shrink-0 text-sm font-medium tracking-wider text-[#D4AF37] sm:text-base">
            ${Number(item.price).toFixed(2)}
          </p>
        </div>

        {description ? (
          <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-white/55">
            {description}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        {tags.length > 0 ? (
          <ul className="mt-auto flex flex-wrap gap-2" aria-hidden>
            {tags.map((tag) => (
              <li
                key={tag}
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${badgeStyles[tag]}`}
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </button>
  );
};

export default MenuCard;

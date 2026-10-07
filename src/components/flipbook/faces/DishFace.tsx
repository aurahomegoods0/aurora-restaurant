'use client';

import { useState } from 'react';
import Image from 'next/image';
import { restaurantConfig } from '../../../../restaurant.config';
import { useLanguage } from '@/context/LanguageContext';
import type { MenuItem } from '@/types/menu';
import {
  getMenuItemDescription,
  getMenuItemIngredients,
  getMenuItemName,
} from '@/components/menu/menuUtils';
import { filterBadgeTags } from '@/components/menu/menuBadges';
import { useBook } from '../bookContext';
import { getWinePairing } from '../winePairings';
import { GOLD_INK, GoldDivider, INK, INK_SOFT, PageFrame, WineGlassIcon } from './decor';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';

const uzs = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

interface DishFaceProps {
  item: MenuItem;
  number: number;
  /** Heavy content (the photograph) is only mounted for pages near the reader */
  near: boolean;
  interactive: boolean;
}

export function DishFace({ item, number, near, interactive }: DishFaceProps) {
  const { language, t } = useLanguage();
  const { scrollToReservation } = useBook();
  const [imageError, setImageError] = useState(false);

  const name = getMenuItemName(item, language);
  const description = getMenuItemDescription(item, language);
  const ingredients = getMenuItemIngredients(item, language);
  const pairing = getWinePairing(item.id, item.category);
  const tags = filterBadgeTags(item.tags);
  const priceUsd = Number(item.price);
  const priceUzs = Math.round((priceUsd * restaurantConfig.currency.usdToUzs) / 1000) * 1000;

  return (
    <div
      className="absolute inset-0 flex flex-col font-serif"
      style={{ padding: '28px 34px 38px', color: INK }}
    >
      <PageFrame />

      <div
        className="relative z-10 flex items-baseline justify-between text-[11px] font-semibold uppercase tracking-[0.28em]"
        style={{ color: GOLD_INK }}
      >
        <span>
          {t('flipbook.dish.number')} {String(number).padStart(2, '0')}
        </span>
        <span>{t(`menu.categories.${item.category}`)}</span>
      </div>

      <div className="relative z-10 mt-3 h-[222px] shrink-0 p-[5px] shadow-[0_6px_14px_rgba(60,40,10,0.28)] [background:linear-gradient(135deg,#7a5a14,#f3e4a8_25%,#b8923a_50%,#fff3b8_70%,#7a5a14)]">
        <div className="relative h-full w-full overflow-hidden bg-[#1a140a]">
          {near && (
            <Image
              src={imageError ? FALLBACK_IMAGE : item.image_url}
              alt={name}
              fill
              sizes="380px"
              draggable={false}
              className="select-none object-cover"
              onError={() => setImageError(true)}
            />
          )}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_38px_rgba(0,0,0,0.55)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18),transparent_38%)]" />
          {tags.length > 0 && (
            <ul className="absolute bottom-2 left-2 flex gap-1.5" aria-hidden>
              {tags.slice(0, 3).map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-[#f3e4a8]/60 bg-black/55 px-2 py-[1px] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#f6e7b0] backdrop-blur-sm"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <h3
        className="relative z-10 mt-3.5 line-clamp-2 text-center text-[27px] font-semibold leading-[1.1] tracking-wide"
        style={{ color: INK }}
      >
        {name}
      </h3>
      <GoldDivider className="relative z-10 my-2" />

      {description && (
        <p
          className="relative z-10 line-clamp-2 text-center text-[13.5px] italic leading-[1.4]"
          style={{ color: INK_SOFT }}
        >
          {description}
        </p>
      )}

      {ingredients.length > 0 && (
        <p className="relative z-10 mt-2 line-clamp-2 text-center text-[12.5px] leading-[1.45]">
          <span
            className="mr-1.5 text-[10.5px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: GOLD_INK }}
          >
            {t('flipbook.dish.ingredients')}
          </span>
          <span style={{ color: INK_SOFT }}>{ingredients.join(' \u00b7 ')}</span>
        </p>
      )}

      <div className="relative z-10 mt-2.5 flex items-start gap-2.5 rounded-sm border border-[#b8923a]/40 bg-[#f7ecd0]/70 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
        <WineGlassIcon className="mt-0.5 h-6 w-6 shrink-0 text-[#8a6a14]" />
        <div className="min-w-0">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: GOLD_INK }}
          >
            {t('flipbook.dish.pairing')}
          </p>
          <p className="truncate text-[13.5px] font-semibold leading-tight">
            {pairing.wine}
            <span className="font-normal" style={{ color: INK_SOFT }}>
              {' '}
              &middot; {pairing.region}
            </span>
          </p>
          <p
            className="line-clamp-2 text-[12px] italic leading-[1.35]"
            style={{ color: INK_SOFT }}
          >
            {pairing.note[language]}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-auto flex items-end justify-between gap-3 pt-2">
        <div className="shrink-0 whitespace-nowrap leading-none">
          <p className="text-[30px] font-semibold tracking-wide" style={{ color: GOLD_INK }}>
            ${priceUsd.toFixed(2)}
          </p>
          <p className="mt-1 text-[12.5px] tracking-wide" style={{ color: INK_SOFT }}>
            &asymp; {uzs.format(priceUzs)} UZS
          </p>
        </div>

        <button
          type="button"
          tabIndex={interactive ? 0 : -1}
          onClick={scrollToReservation}
          className="min-w-0 rounded-full border border-[#5b430c] bg-[linear-gradient(180deg,#f3e4a8,#d4af37_55%,#a8801e)] px-4 py-2.5 text-[11px] font-bold uppercase leading-tight tracking-[0.1em] text-[#2b1f10] shadow-[0_3px_8px_rgba(60,40,10,0.35),inset_0_1px_0_rgba(255,255,255,0.7)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2b1f10]"
        >
          {t('flipbook.dish.order')}
        </button>
      </div>
    </div>
  );
}

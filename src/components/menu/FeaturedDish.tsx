'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { MenuItem } from '@/types/menu';
import { getWinePairing } from '@/components/flipbook/winePairings';
import GoldLeaf from './GoldLeaf';
import {
  getMenuItemDescription,
  getMenuItemName,
  getOptimizedImageUrl,
} from './menuUtils';

interface FeaturedDishProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

const FALLBACK =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';

const FeaturedDish: React.FC<FeaturedDishProps> = ({ item, onSelect }) => {
  const { language, t } = useLanguage();
  const [imageError, setImageError] = React.useState(false);
  const name = getMenuItemName(item, language);
  const description = getMenuItemDescription(item, language);
  const pairing = getWinePairing(item.id, item.category);

  return (
    <article className="relative mb-10 overflow-hidden rounded-sm border border-[#D4AF37]/25 bg-[#0c0c0c] shadow-[0_30px_80px_-40px_rgba(212,175,55,0.45)] lg:mb-14">
      <GoldLeaf
        sealId={item.id}
        hint={t('menu.leafHint')}
        srLabel={t('menu.leafSr')}
        liftLabel={t('menu.leafLift')}
      >
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="relative aspect-[16/10] min-h-[240px] overflow-hidden bg-[#121212] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] lg:aspect-auto lg:min-h-[420px]"
            aria-label={t('menu.modal.openDish').replace('{name}', name)}
          >
            <Image
              src={
                imageError
                  ? FALLBACK
                  : getOptimizedImageUrl(item.image_url, 1200, 70)
              }
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              quality={70}
              className="object-cover"
              onError={() => setImageError(true)}
            />
            <span
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-black/20 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#070707]"
              aria-hidden
            />
          </button>

          <div className="relative flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">
            <p className="text-[10px] uppercase tracking-[0.38em] text-[#D4AF37]">
              {t('menu.featuredTonight')}
            </p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-white/45">
              {t('menu.featuredEyebrow')} · {t(`menu.categories.${item.category}`)}
            </p>
            <h3 className="mt-4 font-serif text-3xl leading-[0.95] tracking-wide text-[#F4EDE0] sm:text-4xl lg:text-[2.75rem]">
              {name}
            </h3>
            {description ? (
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#A89F8C]">
                {description}
              </p>
            ) : null}

            <div className="mt-6 border-t border-[#D4AF37]/20 pt-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                {t('menu.pairing')}
              </p>
              <p className="mt-1.5 font-serif text-lg text-[#E8C96A]">
                {pairing.wine}
              </p>
              <p className="text-xs tracking-wide text-white/45">
                {pairing.region}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {pairing.note[language]}
              </p>
            </div>

            <div className="mt-8 flex items-end justify-between gap-4">
              <p className="font-serif text-4xl tabular-nums leading-none text-[#D4AF37]">
                ${Number(item.price).toFixed(0)}
              </p>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="inline-flex min-h-11 items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#E8C96A] hover:text-[#F3E4A8]"
              >
                {t('menu.featuredCta')}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </GoldLeaf>
    </article>
  );
};

export default FeaturedDish;

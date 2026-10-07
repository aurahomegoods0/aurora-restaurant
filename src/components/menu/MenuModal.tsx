'use client';

import React, { useId } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, X } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import type { MenuItem } from '@/types/menu';
import { getWinePairing } from '@/components/flipbook/winePairings';
import { badgeStyles, filterBadgeTags } from './menuBadges';
import {
  getHighResImageUrl,
  getMenuItemDescription,
  getMenuItemIngredients,
  getMenuItemName,
} from './menuUtils';

interface MenuModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

const MenuModal: React.FC<MenuModalProps> = ({ item, onClose }) => {
  const { t, language } = useLanguage();
  const titleId = useId();
  const descriptionId = useId();
  const open = item !== null;
  const pairing = item ? getWinePairing(item.id, item.category) : null;

  const reserve = () => {
    onClose();
    window.history.replaceState(null, '', '#reservation');
    document.querySelector('#reservation')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      {item ? (
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md" />

          <Dialog.Content
            aria-describedby={descriptionId}
            aria-labelledby={titleId}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[min(92vh,900px)] w-[min(calc(100vw-2rem),980px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-sm border border-[#D4AF37]/25 bg-[#0A0A0A] shadow-[0_0_80px_rgba(212,175,55,0.18)] outline-none sm:max-h-[90vh]"
          >
            <div className="grid max-h-full overflow-y-auto overscroll-contain lg:grid-cols-2">
              <div className="relative aspect-[4/3] min-h-[220px] bg-[#121212] lg:aspect-auto lg:min-h-[460px]">
                <Image
                  src={getHighResImageUrl(item.image_url)}
                  alt={getMenuItemName(item, language)}
                  fill
                  sizes="(max-width: 1024px) 100vw, 480px"
                  quality={75}
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0A0A0A]/50" />
              </div>

              <div className="relative flex flex-col p-6 sm:p-9">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#D4AF37]">
                      {t(`menu.categories.${item.category}`)}
                    </p>
                    <Dialog.Title
                      id={titleId}
                      className="font-serif text-2xl leading-tight tracking-wide text-white sm:text-3xl"
                    >
                      {getMenuItemName(item, language)}
                    </Dialog.Title>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-white/10 text-white/70 transition-colors hover:border-[#D4AF37]/40 hover:text-[#E8C96A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
                      aria-label={t('menu.modal.close')}
                    >
                      <X className="h-5 w-5" aria-hidden />
                    </button>
                  </Dialog.Close>
                </div>

                <p className="mb-5 font-serif text-3xl tabular-nums tracking-wide text-[#E8C96A]">
                  ${Number(item.price).toFixed(0)}
                </p>

                {(() => {
                  const description = getMenuItemDescription(item, language);
                  if (!description) return null;
                  return (
                    <Dialog.Description
                      id={descriptionId}
                      className="mb-6 text-sm leading-relaxed text-white/60"
                    >
                      {description}
                    </Dialog.Description>
                  );
                })()}

                {!getMenuItemDescription(item, language) ? (
                  <span id={descriptionId} className="sr-only">
                    {getMenuItemName(item, language)}
                  </span>
                ) : null}

                {pairing ? (
                  <div className="mb-6 rounded-sm border border-[#D4AF37]/20 bg-[#D4AF37]/[0.04] px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                      {t('menu.pairing')}
                    </p>
                    <p className="mt-1.5 font-serif text-lg text-[#E8C96A]">
                      {pairing.wine}
                    </p>
                    <p className="text-xs text-white/45">{pairing.region}</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      {pairing.note[language]}
                    </p>
                  </div>
                ) : null}

                {(() => {
                  const tags = filterBadgeTags(item.tags);
                  if (tags.length === 0) return null;
                  return (
                    <div className="mb-6">
                      <h3 className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                        {t('menu.modal.dietaryTags')}
                      </h3>
                      <ul className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <li
                            key={tag}
                            className={`rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${badgeStyles[tag]}`}
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

                {(() => {
                  const ingredients = getMenuItemIngredients(item, language);
                  if (ingredients.length === 0) return null;
                  return (
                    <div className="border-t border-white/10 pt-5">
                      <h3 className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/40">
                        {t('menu.modal.ingredients')}
                      </h3>
                      <ul className="flex flex-wrap gap-2">
                        {ingredients.map((ingredient) => (
                          <li
                            key={ingredient}
                            className="rounded-sm border border-white/10 px-2.5 py-1 text-xs tracking-wide text-white/75"
                          >
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

                <button
                  type="button"
                  onClick={reserve}
                  className="mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#F3E4A8] transition-colors hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 sm:w-auto"
                >
                  {t('menu.modal.reserve')}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
};

export default MenuModal;

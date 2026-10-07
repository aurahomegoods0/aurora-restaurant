'use client';

import React, { useId } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import type { MenuItem } from '@/types/menu';
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

const overlayMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.25 },
};

const contentMotion = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
};

const MenuModal: React.FC<MenuModalProps> = ({ item, onClose }) => {
  const { t, language } = useLanguage();
  const titleId = useId();
  const descriptionId = useId();
  const open = item !== null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      {item ? (
        <Dialog.Portal>
          <Dialog.Overlay asChild>
            <motion.div
              {...overlayMotion}
              className="fixed inset-0 z-50 backdrop-blur-md bg-black/80"
            />
          </Dialog.Overlay>

          <Dialog.Content asChild aria-describedby={descriptionId}>
            <motion.div
              {...contentMotion}
              aria-labelledby={titleId}
              className="fixed left-1/2 top-1/2 z-50 flex max-h-[min(92vh,900px)] w-[min(calc(100vw-2rem),960px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-sm border border-white/10 bg-[#0A0A0A] shadow-[0_0_60px_rgba(212,175,55,0.15)] outline-none sm:max-h-[90vh]"
            >
                <div className="grid max-h-full overflow-y-auto overscroll-contain lg:grid-cols-2">
                  <div className="relative aspect-[4/3] min-h-[220px] bg-[#121212] lg:aspect-auto lg:min-h-[420px]">
                    <Image
                      src={getHighResImageUrl(item.image_url)}
                      alt={getMenuItemName(item, language)}
                      fill
                      sizes="(max-width: 1024px) 100vw, 480px"
                      quality={75}
                      className="object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0A0A0A]/40" />
                  </div>

                  <div className="flex flex-col p-6 sm:p-8">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#D4AF37]/80">
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

                    <p className="mb-4 text-xl font-medium tracking-wider text-[#D4AF37]">
                      ${Number(item.price).toFixed(2)}
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
                                className={`rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${badgeStyles[tag]}`}
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
                        <div className="mt-auto border-t border-white/10 pt-6">
                          <h3 className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/40">
                            {t('menu.modal.ingredients')}
                          </h3>
                          <ul className="list-inside list-disc space-y-1.5 text-sm text-white/75 marker:text-[#D4AF37]/50">
                            {ingredients.map((ingredient) => (
                              <li key={ingredient}>{ingredient}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}
                  </div>
                </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
};

export default MenuModal;

'use client';

import React, { useCallback, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { galleryImages } from '@/data/atmosphere';

interface GalleryLightboxProps {
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  index,
  onClose,
  onIndexChange,
}) => {
  const { t, language } = useLanguage();
  const open = index !== null;
  const total = galleryImages.length;
  const image = index !== null ? galleryImages[index] : null;

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndexChange((index + delta + total) % total);
    },
    [index, onIndexChange, total],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') go(-1);
      if (event.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, open]);

  const caption =
    image &&
    t('about.imageOf')
      .replace('{current}', String((index ?? 0) + 1))
      .replace('{total}', String(total));

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      {image ? (
        <Dialog.Portal>
          <Dialog.Overlay asChild>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md"
            />
          </Dialog.Overlay>
          <Dialog.Content
            aria-label={image.alt[language]}
            className="fixed inset-0 z-[81] flex h-dvh max-h-dvh flex-col bg-black/40 outline-none"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
              <p className="min-w-0 truncate text-xs uppercase tracking-[0.2em] text-white/60">
                {caption}
              </p>
              <Dialog.Close
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white hover:border-[#D4AF37]/50 hover:text-[#E8C96A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
                aria-label={t('about.closeLightbox')}
              >
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 px-2 sm:grid-cols-[48px_minmax(0,1fr)_48px] sm:px-4">
              <button
                type="button"
                onClick={() => go(-1)}
                className="inline-flex h-11 w-11 items-center justify-center justify-self-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm hover:border-[#D4AF37]/60 hover:text-[#E8C96A]"
                aria-label={t('about.prevImage')}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <div className="relative h-full min-h-0 w-full max-w-5xl justify-self-center">
                <Image
                  src={image.src}
                  alt={image.alt[language]}
                  fill
                  priority
                  sizes="100vw"
                  className="object-contain"
                />
              </div>

              <button
                type="button"
                onClick={() => go(1)}
                className="inline-flex h-11 w-11 items-center justify-center justify-self-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm hover:border-[#D4AF37]/60 hover:text-[#E8C96A]"
                aria-label={t('about.nextImage')}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            <p className="shrink-0 px-4 py-3 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-sm text-white/70">
              {image.alt[language]}
            </p>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
};

export default GalleryLightbox;

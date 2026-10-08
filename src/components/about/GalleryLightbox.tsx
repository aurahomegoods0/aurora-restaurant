'use client';

import React, { useCallback, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { galleryImages } from '@/data/atmosphere';

interface GalleryLightboxProps {
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

const Arrow = ({
  direction,
  label,
  onClick,
}: {
  direction: 'left' | 'right';
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/55 bg-[#0A0A0A]/80 text-[#E8C96A] backdrop-blur-sm transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
  >
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      {direction === 'left' ? (
        <path d="M11.5 4L6.5 9l5 5" stroke="currentColor" strokeWidth="1.4" />
      ) : (
        <path d="M6.5 4l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
      )}
    </svg>
  </button>
);

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
              className="fixed inset-0 z-[80] bg-black/92 backdrop-blur-md"
            />
          </Dialog.Overlay>
          <Dialog.Content
            aria-label={image.alt[language]}
            className="fixed inset-0 z-[81] flex h-dvh max-h-dvh flex-col outline-none"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
              <p className="min-w-0 truncate font-serif text-sm tracking-[0.2em] text-[#E8C96A]/80">
                {caption}
              </p>
              <Dialog.Close
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/45 bg-[#0A0A0A]/80 text-[#E8C96A] hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
                aria-label={t('about.closeLightbox')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </Dialog.Close>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-1 px-2 sm:grid-cols-[56px_minmax(0,1fr)_56px] sm:px-4">
              <Arrow
                direction="left"
                label={t('about.prevImage')}
                onClick={() => go(-1)}
              />

              <div className="relative h-full min-h-0 w-full max-w-5xl justify-self-center overflow-hidden rounded-sm border border-[#D4AF37]/20">
                <Image
                  src={image.src}
                  alt={image.alt[language]}
                  fill
                  priority
                  sizes="100vw"
                  className="object-contain"
                />
              </div>

              <Arrow
                direction="right"
                label={t('about.nextImage')}
                onClick={() => go(1)}
              />
            </div>

            <p className="shrink-0 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-[11px] uppercase tracking-[0.22em] text-white/65">
              {image.alt[language]}
            </p>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
};

export default GalleryLightbox;

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import {
  chefName,
  chefPortrait,
  galleryImages,
  historyMilestones,
} from '@/data/atmosphere';
import GalleryLightbox from './GalleryLightbox';

const spanClass = {
  wide: 'sm:col-span-2',
  tall: 'sm:row-span-2',
  normal: '',
} as const;

const AboutSection: React.FC = () => {
  const { t, language } = useLanguage();
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section
      id="about"
      className="relative overflow-x-clip bg-[#0A0A0A] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <header className="mb-14 text-center sm:mb-16">
          <p className="mb-3 text-xs font-light uppercase tracking-[0.35em] text-[#D4AF37]">
            {t('about.eyebrow')}
          </p>
          <h2 className="text-3xl font-bold tracking-[0.12em] text-white sm:text-4xl lg:text-5xl">
            {t('about.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/50 sm:text-base">
            {t('about.subtitle')}
          </p>
        </header>

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] max-h-[640px] overflow-hidden rounded-sm border border-white/10 bg-[#121212]">
            <Image
              src={chefPortrait}
              alt={chefName}
              fill
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-cover object-top"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]">
                {t('about.chefRole')}
              </p>
              <p className="mt-1 font-serif text-2xl text-white">{chefName}</p>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-light uppercase tracking-[0.35em] text-[#D4AF37]">
              {t('about.chefEyebrow')}
            </p>
            <blockquote className="relative font-serif text-xl leading-relaxed text-white/85 sm:text-2xl">
              <span
                className="absolute -left-2 -top-8 select-none font-serif text-7xl text-[#D4AF37]/25"
                aria-hidden
              >
                “
              </span>
              {t('about.chefQuote')}
            </blockquote>
            <p className="mt-6 text-sm uppercase tracking-[0.25em] text-white/40">
              — {chefName}
            </p>
          </div>
        </div>

        <div className="mt-20 lg:mt-28">
          <p className="mb-3 text-xs font-light uppercase tracking-[0.35em] text-[#D4AF37]">
            {t('about.historyEyebrow')}
          </p>
          <h3 className="mb-10 text-2xl font-semibold tracking-[0.08em] text-white sm:text-3xl">
            {t('about.historyTitle')}
          </h3>
          <ol className="grid gap-6 md:grid-cols-3">
            {historyMilestones.map((item, index) => (
              <motion.li
                key={item.year}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className="rounded-sm border border-white/10 bg-[#121212]/60 p-6"
              >
                <p className="font-serif text-3xl text-[#E8C96A]">{item.year}</p>
                <p className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-white">
                  {item.title[language]}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  {item.body[language]}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>

        <div className="mt-20 lg:mt-28">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-3 text-xs font-light uppercase tracking-[0.35em] text-[#D4AF37]">
                {t('about.galleryEyebrow')}
              </p>
              <h3 className="text-2xl font-semibold tracking-[0.08em] text-white sm:text-3xl">
                {t('about.galleryTitle')}
              </h3>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              {t('about.galleryHint')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {galleryImages.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLightbox(index)}
                aria-label={`${t('about.openImage')}: ${item.alt[language]}`}
                className={`group relative min-h-[44px] overflow-hidden rounded-sm border border-white/10 bg-[#121212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] ${spanClass[item.span]} ${
                  item.span === 'tall' ? 'min-h-[280px] sm:min-h-[360px]' : 'aspect-[4/3] sm:aspect-auto sm:min-h-[180px]'
                }`}
              >
                <Image
                  src={item.src}
                  alt={item.alt[language]}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <GalleryLightbox
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndexChange={setLightbox}
      />
    </section>
  );
};

export default AboutSection;

'use client';

import './about.css';
import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import {
  chefName,
  chefPortrait,
  galleryImages,
  historyMilestones,
} from '@/data/atmosphere';
import GalleryLightbox from './GalleryLightbox';

const spanClass = {
  featured: 'col-span-2 row-span-2',
  wide: 'col-span-2',
  tall: 'row-span-2',
  normal: '',
} as const;

const FACT_KEYS = ['city', 'kitchen', 'seats'] as const;

const AboutSection: React.FC = () => {
  const { t, language } = useLanguage();
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#070707] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12),transparent_68%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(180,40,40,0.08),transparent_70%)]"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

      <p
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-16 hidden -translate-x-1/2 select-none font-serif text-[clamp(4rem,14vw,11rem)] font-semibold leading-none tracking-[0.18em] text-transparent opacity-[0.07] [-webkit-text-stroke:1px_rgba(212,175,55,0.35)] lg:block"
      >
        {t('about.ghost')}
      </p>

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-12 text-center sm:mb-16">
          <p className="mb-4 text-[11px] font-light uppercase tracking-[0.42em] text-[#D4AF37]">
            {t('about.eyebrow')}
          </p>
          <h2 className="font-serif text-4xl font-semibold tracking-[0.08em] text-[#F4EDE0] sm:text-5xl lg:text-6xl">
            {t('about.title')}
          </h2>
          <span
            className="mx-auto mt-6 block h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
            aria-hidden
          />
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed tracking-[0.02em] text-[#A89F8C] sm:text-base">
            {t('about.subtitle')}
          </p>
        </header>

        <article className="relative mb-16 grid overflow-hidden rounded-sm border border-[#D4AF37]/25 bg-[#0c0c0c] shadow-[0_30px_80px_-40px_rgba(212,175,55,0.45)] lg:mb-20 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative aspect-[4/5] min-h-[280px] overflow-hidden bg-[#121212] sm:min-h-[360px] lg:aspect-auto lg:min-h-[520px]">
            <Image
              src={chefPortrait}
              alt={chefName}
              fill
              sizes="(max-width: 1024px) 100vw, 48vw"
              quality={70}
              className="object-cover object-top"
            />
            <span
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/15 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#0A0A0A]"
              aria-hidden
            />
            <span
              className="about-featured-sheen pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 p-6 lg:hidden">
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#D4AF37]">
                {t('about.chefRole')}
              </p>
              <p className="mt-1 font-serif text-2xl text-white">{chefName}</p>
            </div>
          </div>

          <div className="relative flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12 lg:px-14">
            <p className="text-[10px] uppercase tracking-[0.38em] text-[#D4AF37]">
              {t('about.chefEyebrow')}
            </p>
            <p className="mt-3 hidden text-[11px] uppercase tracking-[0.22em] text-white/45 lg:block">
              {t('about.chefRole')} · {chefName}
            </p>
            <blockquote className="relative mt-6 font-serif text-2xl leading-[1.35] tracking-wide text-white sm:text-3xl lg:text-[2.15rem]">
              <span
                className="absolute -left-1 -top-8 select-none font-serif text-7xl leading-none text-[#D4AF37]/20"
                aria-hidden
              >
                “
              </span>
              {t('about.chefQuote')}
            </blockquote>
            <p className="mt-8 font-serif text-sm italic tracking-[0.12em] text-[#E8C96A]/80">
              — {chefName}
            </p>

            <ul className="mt-10 grid grid-cols-3 gap-3 border-t border-[#D4AF37]/20 pt-6">
              {FACT_KEYS.map((key) => (
                <li key={key}>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                    {t(`about.facts.${key}Label`)}
                  </p>
                  <p className="mt-1.5 font-serif text-sm text-[#E8C96A] sm:text-base">
                    {t(`about.facts.${key}`)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <div className="mb-16 lg:mb-20">
          <p className="mb-3 text-[11px] uppercase tracking-[0.38em] text-[#D4AF37]">
            {t('about.historyEyebrow')}
          </p>
          <h3 className="font-serif text-3xl font-semibold tracking-[0.06em] text-white sm:text-4xl">
            {t('about.historyTitle')}
          </h3>
          <span
            className="mt-5 block h-px w-16 bg-gradient-to-r from-[#D4AF37] to-transparent"
            aria-hidden
          />

          <ol className="mt-8 divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {historyMilestones.map((item, index) => (
              <li key={item.year} className="py-7 sm:py-8">
                <div className="flex items-start gap-3 sm:items-baseline">
                  <span
                    className="about-index mt-1 shrink-0 font-serif text-[11px] tracking-[0.22em] text-[#D4AF37]/70 sm:mt-0"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:flex-nowrap">
                      <h4 className="min-w-0 font-serif text-xl tracking-wide text-white sm:text-2xl">
                        {item.title[language]}
                      </h4>
                      <span className="about-leader hidden sm:block" aria-hidden />
                      <p className="shrink-0 font-serif text-2xl tabular-nums text-[#E8C96A] sm:text-3xl">
                        {item.year}
                      </p>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
                      {item.body[language]}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.38em] text-[#D4AF37]">
                {t('about.galleryEyebrow')}
              </p>
              <h3 className="font-serif text-3xl font-semibold tracking-[0.06em] text-white sm:text-4xl">
                {t('about.galleryTitle')}
              </h3>
            </div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">
              {t('about.galleryHint')}
            </p>
          </div>

          <div className="grid grid-cols-2 auto-rows-[9.5rem] gap-2 sm:grid-cols-4 sm:auto-rows-[11.5rem] sm:gap-3 lg:auto-rows-[13.5rem]">
            {galleryImages.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLightbox(index)}
                aria-label={`${t('about.openImage')}: ${item.alt[language]}`}
                className={`group relative min-h-11 h-full w-full overflow-hidden rounded-sm border border-[#D4AF37]/15 bg-[#121212] transition-[border-color,box-shadow] duration-500 hover:border-[#D4AF37]/50 hover:shadow-[0_20px_50px_-24px_rgba(212,175,55,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] ${spanClass[item.span]}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt[language]}
                  fill
                  sizes={
                    item.span === 'featured' || item.span === 'wide'
                      ? '(max-width: 640px) 100vw, 50vw'
                      : '(max-width: 640px) 50vw, 25vw'
                  }
                  quality={65}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden
                />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-left sm:p-4">
                  <span className="about-index font-serif text-[11px] tracking-[0.22em] text-[#E8C96A]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="line-clamp-2 max-w-[80%] text-[10px] uppercase leading-snug tracking-[0.16em] text-white/80">
                    {item.alt[language]}
                  </span>
                </span>
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

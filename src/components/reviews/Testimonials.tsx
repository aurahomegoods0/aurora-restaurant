'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { testimonials } from '@/data/atmosphere';

const Testimonials: React.FC = () => {
  const { t, language } = useLanguage();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const activeRef = useRef(0);
  activeRef.current = active;

  const scrollToIndex = useCallback((index: number) => {
    const root = scrollerRef.current;
    if (!root) return;
    const child = root.children[index] as HTMLElement | undefined;
    if (!child) return;
    root.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
  }, []);

  const step = (delta: number) => {
    const next = (active + delta + testimonials.length) % testimonials.length;
    scrollToIndex(next);
  };

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const onScroll = () => {
      const children = Array.from(root.children) as HTMLElement[];
      const left = root.scrollLeft;
      let best = 0;
      let bestDist = Infinity;
      children.forEach((child, index) => {
        const dist = Math.abs(child.offsetLeft - left);
        if (dist < bestDist) {
          bestDist = dist;
          best = index;
        }
      });
      setActive(best);
    };

    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    let inView = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { threshold: 0.4 },
    );
    observer.observe(root);

    const id = window.setInterval(() => {
      if (!inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      if (root.matches(':hover')) return;
      const next = (activeRef.current + 1) % testimonials.length;
      scrollToIndex(next);
    }, 7000);

    return () => {
      observer.disconnect();
      window.clearInterval(id);
    };
  }, [scrollToIndex]);

  return (
    <section
      id="reviews"
      className="relative overflow-x-clip bg-[#0A0A0A] px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <header>
            <p className="mb-3 text-xs font-light uppercase tracking-[0.35em] text-[#D4AF37]">
              {t('reviews.eyebrow')}
            </p>
            <h2 className="text-3xl font-bold tracking-[0.12em] text-white sm:text-4xl">
              {t('reviews.title')}
            </h2>
            <p className="mt-3 max-w-xl text-sm text-white/50">
              {t('reviews.subtitle')}
            </p>
          </header>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 hover:border-[#D4AF37]/50 hover:text-[#E8C96A]"
              aria-label={t('reviews.prev')}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 hover:border-[#D4AF37]/50 hover:text-[#E8C96A]"
              aria-label={t('reviews.next')}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {testimonials.map((item) => (
            <article
              key={item.id}
              className="w-[min(100%,22rem)] shrink-0 snap-start rounded-sm border border-white/10 bg-[#121212] p-6"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#D4AF37]/30">
                  <Image
                    src={item.photo}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{item.name}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                    {item.city[language]}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star < item.rating
                        ? 'fill-[#D4AF37] text-[#D4AF37]'
                        : 'text-white/20'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                {item.text[language]}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {testimonials.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToIndex(index)}
              className={`h-11 min-w-[44px] px-1 ${
                index === active ? 'text-[#D4AF37]' : 'text-white/25'
              }`}
              aria-label={`${t('reviews.goTo')} ${index + 1}`}
              aria-current={index === active ? true : undefined}
            >
              <span
                className={`mx-auto block h-1.5 rounded-full ${
                  index === active ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-current'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

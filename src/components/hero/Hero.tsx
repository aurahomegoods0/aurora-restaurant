'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { restaurantConfig } from '../../../restaurant.config';
import { useLanguage } from '../../context/LanguageContext';
import { useMediaQuery } from '@/lib/use-media-query';
import MagneticButton from './MagneticButton';
import Marquee from './Marquee';
import { useLiveStatus } from './useLiveStatus';

const GoldDust = dynamic(() => import('./GoldDust'), { ssr: false });

interface AuroraLayer {
  color: string;
  className: string;
  drift: { x: number[]; y: number[]; rotate: number[] };
  duration: number;
}

const AURORA_LAYERS: AuroraLayer[] = [
  {
    color: 'rgba(212, 175, 55, 0.55)',
    className: 'left-[-10%] top-[5%] h-[55vh] w-[70vw]',
    drift: { x: [0, 120, -60, 0], y: [0, 60, 120, 0], rotate: [0, 12, -8, 0] },
    duration: 26,
  },
  {
    color: 'rgba(16, 120, 96, 0.5)',
    className: 'right-[-15%] top-[15%] h-[60vh] w-[65vw]',
    drift: { x: [0, -140, 40, 0], y: [0, 90, -40, 0], rotate: [0, -10, 14, 0] },
    duration: 32,
  },
];

const tashkentClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Tashkent',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

const useTashkentTime = (): string => {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(tashkentClock.format(new Date()));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);
  return time;
};

const scrollTo = (target: string) => {
  window.history.replaceState(null, '', target);
  document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
};

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const isLg = useMediaQuery('(min-width: 1024px)');
  const live = useLiveStatus();
  const clock = useTashkentTime();
  const sectionRef = useRef<HTMLElement>(null);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 40, damping: 20 });
  const springY = useSpring(pointerY, { stiffness: 40, damping: 20 });
  const auroraX = useTransform(springX, [-1, 1], [-40, 40]);
  const auroraY = useTransform(springY, [-1, 1], [-30, 30]);
  const ghostX = useTransform(springX, [-1, 1], [30, -30]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 160]);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (reduceMotion || event.pointerType !== 'mouse') return;
      const { innerWidth, innerHeight } = window;
      pointerX.set((event.clientX / innerWidth) * 2 - 1);
      pointerY.set((event.clientY / innerHeight) * 2 - 1);
    },
    [pointerX, pointerY, reduceMotion],
  );

  const marqueeItems = t('hero.marquee')
    .split('·')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <section
      id="hero"
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#070707]"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={reduceMotion || !isLg ? undefined : { y: backgroundY }}
        aria-hidden
      >
        {isLg ? (
          <motion.div
            className="absolute inset-[-10%]"
            style={reduceMotion ? undefined : { x: auroraX, y: auroraY }}
          >
            {AURORA_LAYERS.map((layer, index) => (
              <motion.div
                key={index}
                className={`absolute rounded-full blur-[80px] ${layer.className}`}
                style={{
                  background: `radial-gradient(ellipse at center, ${layer.color} 0%, transparent 70%)`,
                }}
                animate={reduceMotion ? undefined : layer.drift}
                transition={{
                  duration: layer.duration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        ) : (
          <>
            <div className="absolute left-[-20%] top-[-8%] h-[42vh] w-[80vw] rounded-full bg-[radial-gradient(ellipse,rgba(212,175,55,0.2),transparent_70%)]" />
            <div className="absolute right-[-25%] top-[18%] h-[38vh] w-[70vw] rounded-full bg-[radial-gradient(ellipse,rgba(16,120,96,0.16),transparent_70%)]" />
          </>
        )}

        {isLg ? (
          <motion.span
            className="absolute left-1/2 top-[18%] -translate-x-1/2 select-none whitespace-nowrap font-serif text-[clamp(10rem,32vw,34rem)] font-bold leading-none tracking-[0.1em] text-transparent [-webkit-text-stroke:1px_rgba(212,175,55,0.12)]"
            style={reduceMotion ? undefined : { x: ghostX }}
          >
            {restaurantConfig.name}
          </motion.span>
        ) : null}

        {isLg ? <GoldDust /> : null}
      </motion.div>

      <div className="hero-grain pointer-events-none absolute inset-0 z-[1] opacity-[0.07] mix-blend-overlay" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(7,7,7,0.85)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-48 bg-gradient-to-b from-transparent to-[#070707]" />

      <motion.div
        style={reduceMotion || !isLg ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-4 pb-12 pt-32 sm:px-6 lg:px-8 lg:pb-28"
      >
        <div className="mx-auto flex max-w-[980px] flex-col items-center text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-[#D4AF37] sm:text-xs">
            {t('hero.sideText')}
          </p>
          <span className="mt-6 block h-px w-16 bg-[#D4AF37]" aria-hidden />
          <h1 className="mt-6 max-w-[18ch] font-serif text-[clamp(2.25rem,5.4vw,4rem)] font-medium leading-[1.15] tracking-[0.02em] text-[#F4EDE0] sm:max-w-none">
            {t('hero.title')}{' '}
            <span className="text-[#D4AF37]">{t('hero.titleAccent')}</span>
          </h1>
          <p className="mt-5 max-w-[560px] text-[15px] font-light leading-relaxed tracking-[0.02em] text-[#A89F8C] sm:text-lg">
            {t('hero.description')}
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <MagneticButton
              type="button"
              onClick={() => scrollTo('#reservation')}
              className="group relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-[2px] bg-[#D4AF37] px-7 py-4 text-[12px] font-medium uppercase tracking-[0.18em] text-[#070707] transition-colors duration-300 hover:bg-[#E8C96A]"
            >
              <span className="relative">{t('hero.reserveTable')}</span>
              <ArrowUpRight
                className="relative h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </MagneticButton>

            <button
              type="button"
              onClick={() => scrollTo('#flipbook')}
              className="inline-flex min-h-11 items-center justify-center rounded-[2px] border border-[#D4AF37]/55 px-7 py-4 text-[12px] font-medium uppercase tracking-[0.18em] text-[#D4AF37] transition-colors duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              {t('hero.openBook')}
            </button>
          </div>
        </div>

      </motion.div>

      <div className="relative z-10 lg:absolute lg:inset-x-0 lg:bottom-0">
        <Marquee items={marqueeItems} />

        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-white/55">
            <span className="relative flex h-2 w-2">
              {live.isOpen && isLg ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              ) : null}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  live.isOpen ? 'bg-emerald-400' : 'bg-white/30'
                }`}
              />
            </span>
            <span className={live.isOpen ? 'text-white/85' : undefined}>
              {live.isOpen ? t('hero.openNow') : t('hero.closedNow')}
            </span>
            <span className="text-white/25">·</span>
            <span>
              {restaurantConfig.openingHours.open}–
              {restaurantConfig.openingHours.close}
            </span>
            {clock && (
              <>
                <span className="hidden text-white/25 sm:inline">·</span>
                <span className="hidden tabular-nums text-[#E8C96A]/80 sm:inline">
                  {clock}
                  <span className="ml-2 text-white/35">{t('hero.localTime')}</span>
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => scrollTo('#menu')}
            className="group order-last flex min-h-11 w-full items-center justify-center gap-3 text-[10px] font-light uppercase tracking-[0.3em] text-white/45 transition-colors duration-300 hover:text-[#D4AF37] sm:order-none sm:w-auto"
            aria-label={t('hero.scrollDown')}
          >
            <span>{t('hero.scrollDown')}</span>
            <span className="hero-scroll-hint flex">
              <ArrowDown className="h-3.5 w-3.5" aria-hidden />
            </span>
          </button>

          {live.nextSlot && live.availableTables !== null && (
            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                {t('hero.availableTables')} · {t('hero.nextSlot')} {live.nextSlot}
              </p>
              <p className="mt-1 font-serif text-3xl leading-none text-[#E8C96A] tabular-nums">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={live.availableTables}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="inline-block"
                  >
                    {live.availableTables}
                  </motion.span>
                </AnimatePresence>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;

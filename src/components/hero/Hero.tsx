'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import GoldDust from './GoldDust';
import MagneticButton from './MagneticButton';
import Marquee from './Marquee';
import Navbar from './Navbar';
import SignatureDish from './SignatureDish';
import { useLiveStatus } from './useLiveStatus';

const BRAND = restaurantConfig.name.split('');
const INTRO_SEEN_KEY = 'aurora:intro-seen';

interface AuroraLayer {
  color: string;
  className: string;
  drift: { x: number[]; y: number[]; rotate: number[] };
  duration: number;
}

/** Aurora curtains: colour, resting position, and a slow drift path. */
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
  {
    color: 'rgba(76, 29, 149, 0.45)',
    className: 'left-[20%] bottom-[-10%] h-[50vh] w-[60vw]',
    drift: { x: [0, 80, -100, 0], y: [0, -80, -20, 0], rotate: [0, 8, -12, 0] },
    duration: 29,
  },
  {
    color: 'rgba(232, 201, 106, 0.35)',
    className: 'left-[45%] top-[35%] h-[35vh] w-[40vw]',
    drift: { x: [0, -60, 90, 0], y: [0, 50, -70, 0], rotate: [0, -16, 6, 0] },
    duration: 23,
  },
];

const letterVariants = {
  hidden: { opacity: 0, y: 32, filter: 'blur(14px)' },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: 1.1 + index * 0.09,
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
});

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
  document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
};

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const live = useLiveStatus();
  const clock = useTashkentTime();
  const sectionRef = useRef<HTMLElement>(null);
  const [showIntro, setShowIntro] = useState(true);

  // Mouse parallax for the aurora, softened with a spring.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 40, damping: 20 });
  const springY = useSpring(pointerY, { stiffness: 40, damping: 20 });
  const auroraX = useTransform(springX, [-1, 1], [-40, 40]);
  const auroraY = useTransform(springY, [-1, 1], [-30, 30]);
  const ghostX = useTransform(springX, [-1, 1], [30, -30]);

  // Scroll parallax: content drifts up and fades as the hero leaves the viewport.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 160]);

  useEffect(() => {
    if (sessionStorage.getItem(INTRO_SEEN_KEY) || reduceMotion) {
      setShowIntro(false);
      return;
    }
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1');
      setShowIntro(false);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

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
      className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0A0A0A]"
    >
      {/* First-visit intro: a gold line is drawn, then the hero is revealed */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            className="absolute inset-0 z-40 flex items-center justify-center bg-[#0A0A0A]"
            exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
            aria-hidden
          >
            <motion.div
              className="h-px w-[min(60vw,420px)] origin-left bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background: aurora curtains, ghost wordmark, gold dust, grain, vignette */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={reduceMotion ? undefined : { y: backgroundY }}
        aria-hidden
      >
        <motion.div
          className="absolute inset-[-10%]"
          style={reduceMotion ? undefined : { x: auroraX, y: auroraY }}
        >
          {AURORA_LAYERS.map((layer, index) => (
            <motion.div
              key={index}
              className={`absolute rounded-full blur-[110px] ${layer.className}`}
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

        {/* Huge outlined wordmark, barely visible, moving against the cursor */}
        <motion.span
          className="absolute left-1/2 top-[18%] -translate-x-1/2 select-none whitespace-nowrap font-serif text-[clamp(10rem,32vw,34rem)] font-bold leading-none tracking-[0.1em] text-transparent [-webkit-text-stroke:1px_rgba(212,175,55,0.12)]"
          style={reduceMotion ? undefined : { x: ghostX }}
        >
          {restaurantConfig.name}
        </motion.span>

        <GoldDust />
      </motion.div>

      <div className="hero-grain pointer-events-none absolute inset-0 z-[1] opacity-[0.07] mix-blend-overlay" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(10,10,10,0.85)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-48 bg-gradient-to-b from-transparent to-[#0A0A0A]" />

      <div className="relative z-20">
        <Navbar />
      </div>

      {/* Vertical side text + gold thread (desktop) */}
      <motion.div
        {...fadeUp(1.8)}
        className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-6 lg:flex xl:right-10"
        aria-hidden
      >
        <span className="h-24 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/70 to-transparent" />
        <span className="text-[10px] font-light uppercase tracking-[0.45em] text-white/50 [writing-mode:vertical-rl]">
          {t('hero.sideText')}
        </span>
        <span className="h-24 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/70 to-transparent" />
      </motion.div>

      {/* Main content: text left, floating dish card right */}
      <motion.div
        style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-4 pb-12 pt-32 sm:px-6 lg:grid-cols-[1fr_auto] lg:gap-16 lg:px-8 lg:pb-40 lg:pr-28"
      >
        <div>
          <motion.p
            {...fadeUp(0.9)}
            className="mb-6 flex items-center gap-4 text-xs font-light uppercase tracking-[0.4em] text-[#D4AF37] sm:text-sm"
          >
            <span className="h-px w-10 bg-[#D4AF37]/70" aria-hidden />
            {t('hero.intro')}
          </motion.p>

          <h1
            className="relative whitespace-nowrap font-serif text-[clamp(3rem,13vw,12rem)] font-semibold leading-[0.9] tracking-[0.08em] text-white"
            aria-label={restaurantConfig.name}
          >
            {BRAND.map((letter, index) => (
              <motion.span
                key={index}
                custom={index}
                variants={letterVariants}
                initial={reduceMotion ? 'visible' : 'hidden'}
                animate="visible"
                whileHover={reduceMotion ? undefined : { y: -10, scale: 1.04 }}
                className="inline-block bg-gradient-to-b from-[#F3E4A8] via-[#D4AF37] to-[#8C6D1F] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(212,175,55,0.25)] transition-transform duration-300"
                aria-hidden
              >
                {letter}
              </motion.span>
            ))}

            {/* Light sweep across the wordmark every few seconds */}
            {!reduceMotion && (
              <motion.span
                className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent mix-blend-overlay"
                initial={{ left: '-40%' }}
                animate={{ left: ['-40%', '140%'] }}
                transition={{
                  duration: 1.6,
                  delay: 2.6,
                  repeat: Infinity,
                  repeatDelay: 5,
                  ease: 'easeInOut',
                }}
                aria-hidden
              />
            )}
          </h1>

          <motion.p
            {...fadeUp(1.9)}
            className="mt-6 max-w-xl text-sm font-light leading-relaxed text-white/60 sm:text-base lg:text-lg"
          >
            {t('hero.description')}
          </motion.p>

          <motion.div
            {...fadeUp(2.1)}
            className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8"
          >
            <MagneticButton
              type="button"
              onClick={() => scrollTo('#reservation')}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-[#D4AF37]/50 bg-white/[0.04] px-8 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#F3E4A8] backdrop-blur-md transition-[border-color,box-shadow] duration-500 hover:border-[#D4AF37] hover:shadow-[0_0_50px_rgba(212,175,55,0.35)]"
            >
              <span
                className="absolute inset-y-0 left-[-60%] w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent transition-all duration-700 group-hover:left-[120%]"
                aria-hidden
              />
              <span className="relative">{t('hero.reserveTable')}</span>
              <ArrowUpRight
                className="relative h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </MagneticButton>

            <button
              type="button"
              onClick={() => scrollTo('#menu')}
              className="group relative text-xs font-medium uppercase tracking-[0.25em] text-white/70 transition-colors duration-300 hover:text-white"
            >
              {t('hero.exploreMenu')}
              <span
                className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-[#D4AF37] transition-transform duration-500 group-hover:scale-x-100"
                aria-hidden
              />
            </button>
          </motion.div>
        </div>

        <SignatureDish onOpenMenu={() => scrollTo('#menu')} />
      </motion.div>

      {/* Bottom: marquee + live status bar */}
      <motion.div
        {...fadeUp(2.4)}
        className="relative z-10 lg:absolute lg:inset-x-0 lg:bottom-0"
      >
        <Marquee items={marqueeItems} />

        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-white/55">
            <span className="relative flex h-2 w-2">
              {live.isOpen && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              )}
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
            className="group order-last flex w-full items-center justify-center gap-3 text-[10px] font-light uppercase tracking-[0.3em] text-white/45 transition-colors duration-300 hover:text-[#D4AF37] sm:order-none sm:w-auto"
            aria-label={t('hero.scrollDown')}
          >
            <span>{t('hero.scrollDown')}</span>
            <motion.span
              animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="flex"
            >
              <ArrowDown className="h-3.5 w-3.5" aria-hidden />
            </motion.span>
          </button>

          {live.nextSlot && (
            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                {t('hero.availableTables')} · {t('hero.nextSlot')} {live.nextSlot}
              </p>
              <p className="mt-1 font-serif text-3xl leading-none text-[#E8C96A] tabular-nums">
                {live.availableTables === null ? (
                  <span className="text-base text-white/40">
                    {t('hero.tablesLoading')}
                  </span>
                ) : (
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
                )}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;

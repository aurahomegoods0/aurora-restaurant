'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase/client';
import type { MenuItem } from '@/types/menu';
import { getHighResImageUrl, getMenuItemName } from '../menu/menuUtils';

const ROTATE_EVERY_MS = 6000;
const MAX_DISHES = 4;

type Dish = Pick<
  MenuItem,
  'id' | 'name_uz' | 'name_en' | 'name_ru' | 'price' | 'image_url' | 'category'
>;

interface SignatureDishProps {
  onOpenMenu: () => void;
}

/**
 * A floating, 3D-tilting card that cycles through signature dishes pulled
 * from the live menu. Desktop only; the hero stays text-first on mobile.
 */
const SignatureDish: React.FC<SignatureDishProps> = ({ onOpenMenu }) => {
  const { t, language } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [index, setIndex] = useState(0);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(useTransform(tiltY, [-0.5, 0.5], [10, -10]), {
    stiffness: 120,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(tiltX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 120,
    damping: 18,
  });
  const glareX = useTransform(tiltX, [-0.5, 0.5], ['20%', '80%']);
  const glareY = useTransform(tiltY, [-0.5, 0.5], ['20%', '80%']);
  const glare = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.18), transparent 55%)`,
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabase
        .from('menu_items')
        .select('id, name_uz, name_en, name_ru, price, image_url, category')
        .in('category', ['steaks', 'mains', 'desserts'])
        .order('price', { ascending: false })
        .limit(12);

      if (cancelled || !data) return;

      // One dish per category keeps the rotation varied.
      const seen = new Set<string>();
      const picked = (data as Dish[]).filter((dish) => {
        if (seen.has(dish.category)) return false;
        seen.add(dish.category);
        return true;
      });
      const rest = (data as Dish[]).filter((dish) => !picked.includes(dish));
      setDishes([...picked, ...rest].slice(0, MAX_DISHES));
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (dishes.length < 2 || reduceMotion) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % dishes.length),
      ROTATE_EVERY_MS,
    );
    return () => window.clearInterval(timer);
  }, [dishes.length, reduceMotion]);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      tiltX.set((event.clientX - rect.left) / rect.width - 0.5);
      tiltY.set((event.clientY - rect.top) / rect.height - 0.5);
    },
    [reduceMotion, tiltX, tiltY],
  );

  const handlePointerLeave = useCallback(() => {
    tiltX.set(0);
    tiltY.set(0);
  }, [tiltX, tiltY]);

  const dish = dishes[index];
  if (!dish) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: -4 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay: 1.6, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative hidden lg:block"
      style={{ perspective: 1200 }}
    >
      {/* Orbit ring behind the card */}
      <motion.div
        className="pointer-events-none absolute -inset-10 rounded-full border border-dashed border-[#D4AF37]/25"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      >
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#E8C96A] shadow-[0_0_12px_rgba(232,201,106,0.9)]" />
      </motion.div>

      <motion.div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={onOpenMenu}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') onOpenMenu();
        }}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="group relative w-[300px] cursor-pointer overflow-hidden rounded-[28px] border border-white/10 bg-[#121212]/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8),0_0_60px_-10px_rgba(212,175,55,0.25)] backdrop-blur-xl xl:w-[340px]"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={getHighResImageUrl(dish.image_url)}
                alt={getMenuItemName(dish as MenuItem, language)}
                fill
                sizes="340px"
                priority
                className="object-cover transition-transform duration-[6000ms] ease-out group-hover:scale-110"
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent" />

          {/* Glare that follows the cursor */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: glare }}
            aria-hidden
          />

          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#0A0A0A]/60 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#E8C96A] backdrop-blur">
            <Sparkles className="h-3 w-3" aria-hidden />
            {t('hero.chefsPick')}
          </div>
        </div>

        <div
          className="relative -mt-16 px-6 pb-6"
          style={{ transform: 'translateZ(40px)' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">
                {t(`menu.categories.${dish.category}`)}
              </p>
              <h3 className="mt-2 font-serif text-2xl leading-tight text-white">
                {getMenuItemName(dish as MenuItem, language)}
              </h3>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-semibold text-[#E8C96A]">
                  ${Number(dish.price).toFixed(2)}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 transition-colors group-hover:text-[#D4AF37]">
                  {t('hero.viewDish')} →
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="mt-5 flex gap-1.5" aria-hidden>
            {dishes.map((entry, dotIndex) => (
              <span
                key={entry.id}
                className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-white/10"
              >
                {dotIndex === index && (
                  <motion.span
                    key={`${entry.id}-${index}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: reduceMotion ? 0 : ROTATE_EVERY_MS / 1000,
                      ease: 'linear',
                    }}
                    className="absolute inset-0 origin-left bg-[#D4AF37]"
                  />
                )}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SignatureDish;

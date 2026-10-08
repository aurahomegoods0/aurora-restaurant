'use client';

import { motion, useTransform } from 'framer-motion';
import { restaurantConfig } from '../../../restaurant.config';
import { useBook } from './bookContext';
import { BOOK_TOP, clamp, OVERHANG, PAGE_H, PAGE_W, stageWidth } from './bookModel';

const SPINE_W = 36;

/** Leather spine with gold-stamped title, visible once the book is open. */
export function Spine() {
  const { position, mode } = useBook();
  if (mode !== 'spread') return null;

  const width = stageWidth(mode);
  const x = useTransform(position, (p) => -(PAGE_W / 2) * (1 - clamp(p, 0, 1)));
  const opacity = useTransform(position, (p) => {
    if (p < 0.55) return 0;
    const fraction = p - Math.floor(p);
    const passing = Math.min(1, Math.sin(Math.PI * fraction) * 2.2);
    return (1 - passing) * clamp((p - 0.55) / 0.45, 0, 1);
  });

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        left: width / 2 - SPINE_W / 2,
        top: BOOK_TOP - OVERHANG,
        width: SPINE_W,
        height: PAGE_H + 2 * OVERHANG,
        x,
        opacity,
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="leather absolute inset-x-[4px] top-[8px] bottom-[8px] overflow-hidden rounded-[2px] shadow-[inset_6px_0_10px_rgba(0,0,0,0.55),inset_-6px_0_10px_rgba(0,0,0,0.55),0_0_18px_rgba(0,0,0,0.45)]">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(255,255,255,0.28) 36%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.22) 64%, rgba(0,0,0,0.7) 100%)',
          }}
        />
        <span className="gold-foil absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[11px] font-semibold tracking-[0.45em] [writing-mode:vertical-rl] [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent]">
          {restaurantConfig.name}
        </span>
      </div>
      {(['top-0', 'bottom-0'] as const).map((edge) => (
        <div
          key={edge}
          className={`leather absolute inset-x-0 h-[10px] ${edge}`}
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(0,0,0,0.7), rgba(255,255,255,0.34) 34%, rgba(255,255,255,0.06) 56%, rgba(0,0,0,0.65))',
            backgroundBlendMode: 'normal',
          }}
        />
      ))}
    </motion.div>
  );
}

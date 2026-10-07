'use client';

import { memo } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useBook } from './bookContext';
import { clamp, PAGE_H, PAGE_W, type LeafModel } from './bookModel';
import { PageFace } from './PageFace';

/** Vertical gap between stacked leaves; just enough to keep coplanar faces from fighting. */
const Z_STEP = 0.5;
/** How far the free edge rises while the leaf is mid-turn (before perspective). */
const LIFT = 14;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

interface LeafProps {
  index: number;
  leaf: LeafModel;
  /** Rounded current view; drives which faces are exposed and which mount heavy content */
  focus: number;
  frontNumber: number | null;
  backNumber: number | null;
}

function LeafImpl({ index, leaf, focus, frontNumber, backNumber }: LeafProps) {
  const { position, mode, leafCount } = useBook();
  const last = leafCount - 1;

  // Boards sit at the bottom of each pile; pages stack above them in reading order.
  const zUnturned = index === last ? 0 : (last - index) * Z_STEP + 1;
  const zTurned = index === 0 ? 0 : index * Z_STEP + 1;

  const transform = useTransform(position, (p) => {
    const t = clamp(p - index, 0, 1);
    const swing = Math.sin(Math.PI * t);
    const z = lerp(zUnturned, zTurned, t) + LIFT * swing;
    const skew = -2.4 * swing;
    return `translateZ(${z.toFixed(2)}px) rotateY(${(-180 * t).toFixed(3)}deg) skewY(${skew.toFixed(3)}deg)`;
  });

  // Leaves buried deep in either pile can't be seen; hiding them keeps GPU memory low.
  // The two boards stay put because they form the visible rim of the book.
  const visibility = useTransform(position, (p) => {
    if (mode === 'single' && index < last && p >= index + 1) return 'hidden';
    if (index === 0 || index === last) return 'visible';
    return Math.abs(index + 0.5 - p) < 2.6 ? 'visible' : 'hidden';
  });

  const frontVisible = index === focus;
  const backVisible = mode === 'spread' && index === focus - 1;
  const near = Math.abs(index - focus) <= 3;

  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{
        width: PAGE_W,
        height: PAGE_H,
        transformOrigin: '0 50%',
        transformStyle: 'preserve-3d',
        transform,
        visibility,
        willChange: 'transform',
      }}
    >
      <PageFace
        side="front"
        leafIndex={index}
        content={leaf.front}
        hardcover={leaf.hardcover}
        pageNumber={frontNumber}
        near={near}
        visible={frontVisible}
      />
      <PageFace
        side="back"
        leafIndex={index}
        content={leaf.back}
        hardcover={leaf.hardcover}
        pageNumber={backNumber}
        near={near}
        visible={backVisible}
      />
    </motion.div>
  );
}

export const Leaf = memo(LeafImpl);

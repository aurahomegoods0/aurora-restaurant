'use client';

import { motion, useTransform } from 'framer-motion';
import { useBook } from './bookContext';
import { BOOK_TOP, clamp, OVERHANG, PAGE_H, PAGE_W, stageWidth } from './bookModel';

const MAX_EDGE = 11;

/**
 * The remaining unread (right) and already-read (left) page block, drawn as
 * thin stacked paper edges so the book has thickness even when closed.
 */
export function PaperStack() {
  const { position, mode, leafCount } = useBook();
  const width = stageWidth(mode);
  const last = leafCount - 1;

  const bookX = useTransform(position, (p) =>
    mode === 'spread' ? -(PAGE_W / 2) * (1 - clamp(p, 0, 1)) : 0,
  );

  const rightWidth = useTransform(position, (p) => {
    const remaining = Math.max(0, last - p);
    return Math.min(MAX_EDGE, remaining * 1.15);
  });
  const leftWidth = useTransform(position, (p) => {
    if (mode !== 'spread') return 0;
    return Math.min(MAX_EDGE, Math.max(0, p - 0.15) * 1.15);
  });
  const leftEdge = useTransform(leftWidth, (w) => -PAGE_W - w);

  const spineLeft = mode === 'spread' ? width / 2 : 0;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        left: spineLeft,
        top: BOOK_TOP,
        width: PAGE_W,
        height: PAGE_H,
        x: bookX,
      }}
    >
      <motion.div
        className="absolute top-[3px] bottom-[3px] overflow-hidden rounded-r-[2px]"
        style={{
          left: PAGE_W,
          width: rightWidth,
          background:
            'repeating-linear-gradient(90deg, #efe4c4 0px, #efe4c4 1px, #d8c89a 1px, #cbb888 2px)',
          boxShadow: '2px 0 6px rgba(0,0,0,0.28)',
        }}
      />
      <motion.div
        className="absolute top-[3px] bottom-[3px] overflow-hidden rounded-l-[2px]"
        style={{
          left: leftEdge,
          width: leftWidth,
          background:
            'repeating-linear-gradient(90deg, #cbb888 0px, #efe4c4 1px, #efe4c4 2px)',
          boxShadow: '-2px 0 6px rgba(0,0,0,0.28)',
        }}
      />
      <div
        className="absolute -bottom-[6px] left-[8%] right-[4%] h-[10px] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.35), transparent 70%)',
          filter: 'blur(3px)',
        }}
      />
    </motion.div>
  );
}

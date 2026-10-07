'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { MenuItem } from '@/types/menu';
import { BookEngine } from './BookEngine';
import {
  convertView,
  SPREAD_MIN_WIDTH,
  STAGE_H,
  stageWidth,
  buildBook,
  type BookMode,
} from './bookModel';

const MAX_SCALE = 1.08;
const MIN_SCALE = 0.4;

interface Layout {
  mode: BookMode;
  scale: number;
}

const computeLayout = (containerWidth: number, viewportHeight: number): Layout => {
  const mode: BookMode = containerWidth >= SPREAD_MIN_WIDTH ? 'spread' : 'single';
  // Keep the whole book on screen height-wise, but never shrink below readable on phones.
  const byHeight = Math.max(0.5, (viewportHeight - 170) / STAGE_H);
  const byWidth = containerWidth / stageWidth(mode);
  return {
    mode,
    scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, byWidth, byHeight)),
  };
};

/**
 * Measures the available room, chooses a two-page spread or single-page layout, and scales
 * the fixed-size book to fit. The wrapper reserves the exact scaled size, so nothing shifts.
 */
export function FlipBook({ items }: { items: MenuItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef(0);
  const modeRef = useRef<BookMode | null>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [initialView, setInitialView] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frame = 0;
    const measure = () => {
      const next = computeLayout(container.clientWidth, window.innerHeight);

      if (modeRef.current && modeRef.current !== next.mode) {
        // Carry the reader's place over when the layout flips (rotate / resize).
        const { maxView } = buildBook(items, next.mode);
        setInitialView(convertView(viewRef.current, modeRef.current, next.mode, maxView));
      }
      modeRef.current = next.mode;

      setLayout((current) =>
        current &&
        current.mode === next.mode &&
        Math.abs(current.scale - next.scale) < 0.003
          ? current
          : next,
      );
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(container);
    window.addEventListener('resize', schedule);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [items]);

  const handleViewChange = useCallback((view: number) => {
    viewRef.current = view;
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      {layout ? (
        <BookEngine
          key={layout.mode}
          items={items}
          mode={layout.mode}
          scale={layout.scale}
          initialView={initialView}
          onViewChange={handleViewChange}
        />
      ) : (
        <div style={{ height: STAGE_H * 0.6 }} aria-hidden />
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { useBook } from './bookContext';
import {
  BOOK_TOP,
  clamp,
  OVERHANG,
  PAGE_H,
  PAGE_W,
  stageWidth,
  type BookMode,
} from './bookModel';

interface TableCastShadowProps {
  mode: BookMode;
}

/**
 * 2D canvas shadow under the book. FaceShading paints the 3D light on the
 * pages themselves; this layer is the shadow the lifting leaf casts on the table.
 */
export function TableCastShadow({ mode }: TableCastShadowProps) {
  const { position } = useBook();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = stageWidth(mode);
  const height = PAGE_H + OVERHANG + 70;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const spineXAt = (p: number): number =>
      mode === 'spread' ? width / 2 - (PAGE_W / 2) * (1 - clamp(p, 0, 1)) : 0;

    const paint = (p: number) => {
      ctx.clearRect(0, 0, width, height);

      const t = p - Math.floor(p);
      if (t < 0.004 || t > 0.996) return;

      const swing = Math.sin(Math.PI * t);
      const spine = spineXAt(p);
      const freeEdge = spine + PAGE_W * Math.cos(Math.PI * t);
      const left = Math.min(spine, freeEdge);
      const right = Math.max(spine, freeEdge);
      const span = Math.max(8, right - left);

      const top = 8;
      const bottom = PAGE_H + OVERHANG - 4;

      ctx.save();
      ctx.globalAlpha = 0.22 + 0.45 * swing;

      const gradient = ctx.createLinearGradient(left, 0, right, 0);
      if (freeEdge >= spine) {
        gradient.addColorStop(0, 'rgba(8, 4, 0, 0.05)');
        gradient.addColorStop(0.55, 'rgba(8, 4, 0, 0.55)');
        gradient.addColorStop(1, 'rgba(8, 4, 0, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(8, 4, 0, 0)');
        gradient.addColorStop(0.45, 'rgba(8, 4, 0, 0.55)');
        gradient.addColorStop(1, 'rgba(8, 4, 0, 0.05)');
      }

      ctx.fillStyle = gradient;
      ctx.filter = `blur(${(4 + 10 * swing).toFixed(1)}px)`;
      ctx.beginPath();
      ctx.moveTo(spine, top);
      ctx.lineTo(freeEdge, top + 18 * swing);
      ctx.lineTo(freeEdge, bottom - 18 * swing);
      ctx.lineTo(spine, bottom);
      ctx.closePath();
      ctx.fill();

      // Soft elliptical puddle under the free edge, strongest at mid-turn.
      ctx.filter = `blur(${(8 + 14 * swing).toFixed(1)}px)`;
      ctx.globalAlpha = 0.28 * swing;
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.beginPath();
      ctx.ellipse(
        freeEdge,
        bottom + 6,
        Math.max(24, span * 0.35),
        18 + 10 * swing,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    };

    paint(position.get());
    return position.on('change', paint);
  }, [position, width, height, mode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute left-0"
      style={{
        top: BOOK_TOP,
        width,
        height,
      }}
    />
  );
}

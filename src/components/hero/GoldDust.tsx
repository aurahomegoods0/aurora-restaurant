'use client';

import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  driftX: number;
  phase: number;
  alpha: number;
  twinkle: number;
}

const PARTICLE_DENSITY = 1 / 18000; // one particle per N px²
const MAX_PARTICLES = 90;

/** Slowly rising, twinkling gold specks drawn on a canvas. */
const GoldDust: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduceMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let frame = 0;
    let width = 0;
    let height = 0;

    const spawn = (atRandomHeight: boolean): Particle => ({
      x: Math.random() * width,
      y: atRandomHeight ? Math.random() * height : height + 10,
      radius: 0.6 + Math.random() * 1.6,
      speedY: 0.15 + Math.random() * 0.35,
      driftX: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.25 + Math.random() * 0.55,
      twinkle: 0.5 + Math.random() * 1.5,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(
        MAX_PARTICLES,
        Math.round(width * height * PARTICLE_DENSITY),
      );
      particles = Array.from({ length: count }, () => spawn(true));
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.y -= p.speedY;
        p.x += p.driftX + Math.sin(time / 1500 + p.phase) * 0.15;

        if (p.y < -10 || p.x < -10 || p.x > width + 10) {
          Object.assign(p, spawn(false));
        }

        const glow = 0.5 + 0.5 * Math.sin(time / 1000 * p.twinkle + p.phase);
        const alpha = p.alpha * (0.4 + 0.6 * glow);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 201, 106, ${alpha.toFixed(3)})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
        ctx.fill();
      }

      frame = requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    frame = requestAnimationFrame(render);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
      } else {
        frame = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
};

export default GoldDust;

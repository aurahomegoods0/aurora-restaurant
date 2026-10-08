'use client';

import './gold-leaf.css';
import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  isGoldLeafLifted,
  rememberGoldLeafLifted,
} from '@/lib/gold-leaf';

interface GoldLeafProps {
  sealId: string;
  hint: string;
  srLabel: string;
  liftLabel: string;
  children: React.ReactNode;
  onUnsealed?: () => void;
}

interface Flake {
  id: number;
  x: number;
  y: number;
  fx: number;
  fy: number;
  fr: number;
}

type Phase = 'boot' | 'sealed' | 'peeling' | 'gone';

const REVEAL_RATIO = 0.24;

const paintFoil = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => {
  const wash = ctx.createLinearGradient(0, 0, width, height);
  wash.addColorStop(0, '#4a3610');
  wash.addColorStop(0.18, '#c9a227');
  wash.addColorStop(0.42, '#f4e4a4');
  wash.addColorStop(0.58, '#d4af37');
  wash.addColorStop(0.82, '#8c6d1f');
  wash.addColorStop(1, '#2e2208');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 70; i += 1) {
    ctx.beginPath();
    ctx.strokeStyle = i % 2 === 0 ? '#fff6d0' : '#5c4310';
    ctx.lineWidth = 0.7 + (i % 5) * 0.15;
    const x = ((i * 97) % width) + (i % 9);
    const y = ((i * 53) % height) + (i % 7);
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 36, y + 10, x + 72, y - 8);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = '#fff8dc';
  for (let i = 0; i < 900; i += 1) {
    ctx.fillRect((i * 37) % width, (i * 19) % height, 1.2, 1.2);
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#2a1e08';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${Math.min(width, height) * 0.12}px Georgia, serif`;
  ctx.fillText('AURORA', width / 2, height / 2);
  ctx.restore();

  const rim = 10;
  ctx.strokeStyle = 'rgba(42, 30, 8, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(rim, rim, width - rim * 2, height - rim * 2);
};

const scratchedRatio = (ctx: CanvasRenderingContext2D): number => {
  const { width, height } = ctx.canvas;
  const cols = 36;
  const rows = 24;
  const stepX = Math.max(1, Math.floor(width / cols));
  const stepY = Math.max(1, Math.floor(height / rows));
  const data = ctx.getImageData(0, 0, width, height).data;
  let clear = 0;
  let total = 0;
  for (let y = 0; y < height; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      total += 1;
      if (data[(y * width + x) * 4 + 3] < 48) clear += 1;
    }
  }
  return total === 0 ? 0 : clear / total;
};

const GoldLeaf: React.FC<GoldLeafProps> = ({
  sealId,
  hint,
  srLabel,
  liftLabel,
  children,
  onUnsealed,
}) => {
  const reduceMotion = useReducedMotion();
  const labelId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const drawingRef = useRef(false);
  const doneRef = useRef(false);
  const sampleRef = useRef(0);
  const flakeId = useRef(0);
  const [phase, setPhase] = useState<Phase>('boot');
  const [nail, setNail] = useState<{ x: number; y: number } | null>(null);
  const [flakes, setFlakes] = useState<Flake[]>([]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    rememberGoldLeafLifted(sealId);
    setPhase('peeling');
    window.setTimeout(() => {
      setPhase('gone');
      onUnsealed?.();
    }, reduceMotion ? 420 : 860);
  }, [onUnsealed, reduceMotion, sealId]);

  const syncCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintFoil(ctx, rect.width, rect.height);
  }, []);

  useEffect(() => {
    if (isGoldLeafLifted(sealId)) {
      doneRef.current = true;
      setPhase('gone');
      return;
    }
    setPhase('sealed');
  }, [sealId]);

  useEffect(() => {
    if (phase !== 'sealed') return;
    syncCanvas();
    const parent = canvasRef.current?.parentElement;
    if (!parent || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (!drawingRef.current && !doneRef.current) syncCanvas();
    });
    ro.observe(parent);
    return () => ro.disconnect();
  }, [phase, syncCanvas]);

  const scratchTo = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const px = x - rect.left;
    const py = y - rect.top;
    const last = lastRef.current;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = rect.width < 480 ? 52 : 44;
    ctx.beginPath();
    if (last) ctx.moveTo(last.x, last.y);
    else ctx.moveTo(px, py);
    ctx.lineTo(px, py);
    ctx.stroke();
    lastRef.current = { x: px, y: py };
    setNail({ x: px, y: py });

    flakeId.current += 1;
    const id = flakeId.current;
    setFlakes((prev) =>
      [
        ...prev.slice(-14),
        {
          id,
          x: px,
          y: py,
          fx: (id % 2 === 0 ? 1 : -1) * (12 + (id % 18)),
          fy: 28 + (id % 24),
          fr: (id % 7) * 18,
        },
      ].slice(-16),
    );
    window.setTimeout(() => {
      setFlakes((prev) => prev.filter((flake) => flake.id !== id));
    }, 740);

    sampleRef.current += 1;
    if (sampleRef.current % 6 === 0 && scratchedRatio(ctx) >= REVEAL_RATIO) {
      finish();
    }
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'sealed' || reduceMotion) return;
    if (event.pointerType === 'touch') event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    drawingRef.current = true;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* synthetic / already captured */
    }
    lastRef.current = null;
    scratchTo(event.clientX, event.clientY);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drawingRef.current || phase !== 'sealed') return;
    scratchTo(event.clientX, event.clientY);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    drawingRef.current = false;
    lastRef.current = null;
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      /* ignore */
    }
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (phase === 'sealed' && ctx && scratchedRatio(ctx) >= REVEAL_RATIO) {
      finish();
    }
  };

  const liftByKey = () => {
    if (phase !== 'sealed') return;
    finish();
  };

  const sealed = phase === 'sealed' || phase === 'peeling';

  return (
    <div className="gold-leaf-root">
      <div className={sealed ? 'pointer-events-none select-none' : undefined}>
        {children}
      </div>

      {phase === 'boot' ? (
        <div className="gold-leaf-stage bg-[#0c0c0c]" aria-hidden />
      ) : null}

      {phase === 'sealed' || phase === 'peeling' ? (
        <div
          role="button"
          tabIndex={0}
          className={`gold-leaf-stage${phase === 'peeling' ? ' is-peeling' : ''}`}
          aria-labelledby={labelId}
          aria-keyshortcuts="Enter Space"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              liftByKey();
            }
          }}
          onClick={() => {
            if (reduceMotion) liftByKey();
          }}
        >
          <canvas ref={canvasRef} className="gold-leaf-canvas" aria-hidden />
          {phase === 'sealed' ? (
            <div
              className={`gold-leaf-hint${nail ? ' is-scratching' : ''}`}
              aria-hidden
            >
              <p className="gold-leaf-hint-kicker">{liftLabel}</p>
              <p className="gold-leaf-hint-title">{hint}</p>
            </div>
          ) : null}
          {nail && phase === 'sealed' && !reduceMotion ? (
            <span
              className="gold-leaf-nail"
              style={{ left: nail.x, top: nail.y }}
              aria-hidden
            />
          ) : null}
          {flakes.map((flake) => (
            <span
              key={flake.id}
              className="gold-leaf-flake"
              style={{
                left: flake.x,
                top: flake.y,
                ['--fx' as string]: `${flake.fx}px`,
                ['--fy' as string]: `${flake.fy}px`,
                ['--fr' as string]: `${flake.fr}deg`,
              }}
              aria-hidden
            />
          ))}
        </div>
      ) : null}

      {sealed ? (
        <p id={labelId} className="sr-only">
          {srLabel}
        </p>
      ) : null}
    </div>
  );
};

export default GoldLeaf;

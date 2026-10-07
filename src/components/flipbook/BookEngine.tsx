'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { pageTurnSound } from '@/lib/audio/pageTurnSound';
import type { MenuItem } from '@/types/menu';
import { BookToolbar, FloatingArrows } from './BookControls';
import { BookContext, type BookContextValue } from './bookContext';
import {
  BOOK_TOP,
  buildBook,
  clamp,
  OVERHANG,
  PAGE_H,
  PAGE_W,
  STAGE_H,
  stageWidth,
  type BookMode,
  type Corner,
} from './bookModel';
import { CORNER_ZONE, CURL_MAX, CURL_MIN } from './curl';
import { Leaf } from './Leaf';
import { PaperStack } from './PaperStack';
import { Spine } from './Spine';
import { TableCastShadow } from './TableCastShadow';
import { ThumbnailBar } from './ThumbnailBar';

const SOUND_STORAGE_KEY = 'aurora:book-sound';
const DRAG_THRESHOLD = 6;
/** Position units per second above which a release counts as a flick. */
const FLICK_VELOCITY = 0.8;

type Direction = 1 | -1;

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  /** Pointer position relative to the spine, in book px, at pointer-down */
  bx0: number;
  sideDir: Direction | 0;
  tapDir: Direction | 0;
  started: boolean;
  base: number;
  r: number;
  offset: number;
  lastT: number;
  lastPosition: number;
  lastTime: number;
  velocity: number;
  corner: Corner;
}

interface CornerHit {
  corner: Corner;
  dir: Direction;
  face: string;
  curl: boolean;
}

interface BookEngineProps {
  items: MenuItem[];
  mode: BookMode;
  scale: number;
  initialView: number;
  onViewChange: (view: number) => void;
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export function BookEngine({
  items,
  mode,
  scale,
  initialView,
  onViewChange,
}: BookEngineProps) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  const book = useMemo(() => buildBook(items, mode), [items, mode]);
  const { maxView } = book;
  const stageW = stageWidth(mode);
  const startView = clamp(initialView, 0, maxView);

  const position = useMotionValue(startView);
  const curlFace = useMotionValue('');
  const curlCorner = useMotionValue<Corner>('tr');
  const curlTarget = useMotionValue(0);
  const curlSize = useSpring(curlTarget, { stiffness: 240, damping: 26, mass: 0.7 });

  const [focus, setFocus] = useState(startView);
  const [soundOn, setSoundOn] = useState(true);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const targetRef = useRef(startView);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const inViewRef = useRef(false);

  const spineX = useCallback(
    (p: number): number =>
      mode === 'spread' ? stageW / 2 - (PAGE_W / 2) * (1 - clamp(p, 0, 1)) : 0,
    [mode, stageW],
  );

  const bookX = useTransform(position, (p) =>
    mode === 'spread' ? -(PAGE_W / 2) * (1 - clamp(p, 0, 1)) : 0,
  );
  const tableShadowScale = useTransform(position, (p) =>
    mode === 'spread' ? 0.52 + 0.48 * clamp(p, 0, 1) : 1,
  );

  /* ------------------------------ animation ------------------------------ */

  const animateTo = useCallback(
    (target: number, velocity = 0) => {
      animationRef.current?.stop();
      animationRef.current = null;
      targetRef.current = target;

      const distance = Math.abs(target - position.get());
      if (distance < 0.0005) {
        position.set(target);
        return;
      }
      if (reduceMotion) {
        position.set(target);
        return;
      }

      const onComplete = () => {
        animationRef.current = null;
        if (distance > 0.3) pageTurnSound.playLand(clamp(distance, 0.4, 1));
      };

      animationRef.current =
        distance <= 1.05
          ? animate(position, target, {
              type: 'spring',
              stiffness: 100,
              damping: 19,
              velocity,
              restDelta: 0.0008,
              restSpeed: 0.01,
              onComplete,
            })
          : animate(position, target, {
              type: 'tween',
              duration: Math.min(2.6, 0.5 + 0.22 * distance),
              ease: [0.45, 0.05, 0.25, 1],
              onComplete,
            });
    },
    [position, reduceMotion],
  );

  const goTo = useCallback(
    (view: number) => {
      pageTurnSound.unlock();
      animateTo(clamp(Math.round(view), 0, maxView));
    },
    [animateTo, maxView],
  );

  const next = useCallback(() => goTo(targetRef.current + 1), [goTo]);
  const prev = useCallback(() => goTo(targetRef.current - 1), [goTo]);

  const scrollToReservation = useCallback(() => {
    document
      .getElementById('reservation')
      ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }, [reduceMotion]);

  /* --------------------- focus tracking + paper sounds --------------------- */

  useEffect(() => {
    let previous = position.get();
    let previousTime = performance.now();

    const unsubscribe = position.on('change', (p) => {
      const now = performance.now();
      const seconds = Math.max(0.001, (now - previousTime) / 1000);
      const speed = Math.abs(p - previous) / seconds;

      // A turn "starts" once a leaf has lifted ~10% in either direction.
      const forward = Math.floor(p - 0.1) - Math.floor(previous - 0.1);
      const backward = Math.floor(previous + 0.1) - Math.floor(p + 0.1);
      if (forward > 0 || backward > 0) {
        pageTurnSound.playTurn(clamp(speed / 2.5, 0.35, 1));
      }

      previous = p;
      previousTime = now;

      const rounded = Math.round(p);
      setFocus((current) => (current === rounded ? current : rounded));
    });

    return () => {
      unsubscribe();
      animationRef.current?.stop();
    };
  }, [position]);

  useEffect(() => {
    onViewChange(focus);
  }, [focus, onViewChange]);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(SOUND_STORAGE_KEY) === 'off') setSoundOn(false);
    } catch {
      /* storage can be unavailable (private mode) */
    }
  }, []);

  useEffect(() => {
    pageTurnSound.enabled = soundOn;
  }, [soundOn]);

  const toggleSound = useCallback(() => {
    setSoundOn((current) => {
      const nextValue = !current;
      try {
        window.localStorage.setItem(SOUND_STORAGE_KEY, nextValue ? 'on' : 'off');
      } catch {
        /* ignore */
      }
      if (nextValue) {
        pageTurnSound.enabled = true;
        pageTurnSound.unlock();
        pageTurnSound.playTurn(0.6);
      }
      return nextValue;
    });
  }, []);

  /* ------------------------------- keyboard ------------------------------- */

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.25 },
    );
    observer.observe(root);

    const onKeyDown = (event: KeyboardEvent) => {
      if (!inViewRef.current || event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      ) {
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prev();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [next, prev]);

  /* ------------------------------- pointer -------------------------------- */

  const pointerToBook = useCallback(
    (clientX: number, clientY: number, p: number) => {
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return { bx: 0, by: 0, sx: 0 };
      const sx = (clientX - rect.left) / scale;
      const sy = (clientY - rect.top) / scale;
      return { bx: sx - spineX(p), by: sy - BOOK_TOP, sx };
    },
    [scale, spineX],
  );

  const cornerAt = useCallback(
    (bx: number, by: number, view: number): CornerHit | null => {
      const top = by <= CORNER_ZONE && by >= -OVERHANG;
      const bottom = by >= PAGE_H - CORNER_ZONE && by <= PAGE_H + OVERHANG;
      if (!top && !bottom) return null;
      const vertical = top ? 't' : 'b';

      if (bx >= PAGE_W - CORNER_ZONE && bx <= PAGE_W + OVERHANG) {
        if (view >= maxView) return null;
        return {
          corner: `${vertical}r` as Corner,
          dir: 1,
          face: `f${view}`,
          curl: !book.leaves[view].hardcover,
        };
      }

      if (mode === 'spread' && bx <= -(PAGE_W - CORNER_ZONE) && bx >= -(PAGE_W + OVERHANG)) {
        if (view <= 0) return null;
        return {
          corner: `${vertical}l` as Corner,
          dir: -1,
          face: `b${view - 1}`,
          curl: !book.leaves[view - 1].hardcover,
        };
      }
      return null;
    },
    [book.leaves, maxView, mode],
  );

  const isInsideBook = useCallback(
    (bx: number, by: number): boolean => {
      if (by < -OVERHANG || by > PAGE_H + OVERHANG) return false;
      return mode === 'spread'
        ? Math.abs(bx) <= PAGE_W + OVERHANG
        : bx >= 0 && bx <= PAGE_W + OVERHANG;
    },
    [mode],
  );

  const updateHover = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== 'mouse') return;
      const stage = stageRef.current;
      if (!stage) return;

      const p = position.get();
      if (Math.abs(p - Math.round(p)) > 0.01) {
        curlTarget.set(0);
        return;
      }

      const overControl = (event.target as HTMLElement).closest('button');
      const { bx, by } = pointerToBook(event.clientX, event.clientY, p);
      const hit = overControl ? null : cornerAt(bx, by, Math.round(p));

      if (hit?.curl) {
        const vertexX = hit.corner[1] === 'r' ? PAGE_W : -PAGE_W;
        const vertexY = hit.corner[0] === 't' ? 0 : PAGE_H;
        const distance = Math.max(Math.abs(bx - vertexX), Math.abs(by - vertexY));
        curlFace.set(hit.face);
        curlCorner.set(hit.corner);
        curlTarget.set(lerp(CURL_MAX, CURL_MIN, clamp(distance / CORNER_ZONE, 0, 1)));
      } else {
        curlTarget.set(0);
      }

      stage.style.cursor = hit
        ? 'pointer'
        : isInsideBook(bx, by)
          ? 'grab'
          : 'default';
    },
    [cornerAt, curlCorner, curlFace, curlTarget, isInsideBook, pointerToBook, position],
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pageTurnSound.unlock();
    suppressClickRef.current = false;

    const p = position.get();
    const { bx, by } = pointerToBook(event.clientX, event.clientY, p);
    if (!isInsideBook(bx, by)) return;

    const onControl = (event.target as HTMLElement).closest('button, a, input');
    const settled = Math.abs(p - Math.round(p)) < 0.01;
    const hit = !onControl && settled ? cornerAt(bx, by, Math.round(p)) : null;

    // A tap on the closed cover opens the book.
    const opensCover =
      !onControl && mode === 'spread' && settled && Math.round(p) === 0 && bx > 0;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      bx0: bx,
      sideDir: mode === 'spread' ? (bx > 0 ? 1 : -1) : 0,
      tapDir: hit ? hit.dir : opensCover ? 1 : 0,
      started: false,
      base: 0,
      r: PAGE_W / 2,
      offset: 0,
      lastT: 0,
      lastPosition: p,
      lastTime: performance.now(),
      velocity: 0,
      corner: by < PAGE_H / 2 ? (bx > 0 ? 'tr' : 'tl') : bx > 0 ? 'br' : 'bl',
    };
  };

  const beginDrag = (drag: DragState, dir: Direction, event: ReactPointerEvent<HTMLDivElement>) => {
    animationRef.current?.stop();
    animationRef.current = null;

    const p0 = position.get();
    const base = clamp(
      dir > 0 ? Math.floor(p0 + 1e-6) : Math.ceil(p0 - 1e-6) - 1,
      0,
      maxView - 1,
    );
    const t0 = clamp(p0 - base, 0, 1);
    const r =
      mode === 'spread' ? clamp(Math.abs(drag.bx0), PAGE_W * 0.45, PAGE_W) : PAGE_W / 2;

    drag.base = base;
    drag.r = r;
    drag.offset = r * Math.cos(Math.PI * t0) - drag.bx0;
    drag.lastT = t0;
    drag.lastPosition = p0;
    drag.lastTime = performance.now();
    drag.velocity = 0;
    drag.started = true;

    suppressClickRef.current = true;
    const turning = book.leaves[base];
    if (turning && !turning.hardcover) {
      curlFace.set(dir > 0 ? `f${base}` : `b${base}`);
      curlCorner.set(drag.corner);
      curlTarget.set(CURL_MAX);
    } else {
      curlTarget.set(0);
    }
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* the pointer may already be gone; the drag still works without capture */
    }
    if (stageRef.current) stageRef.current.style.cursor = 'grabbing';
  };

  const dragTo = (drag: DragState, clientX: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = (clientX - rect.left) / scale;

    // The spine slides while the cover opens, so solve for t with a few fixed-point steps.
    let t = drag.lastT;
    for (let i = 0; i < 3; i++) {
      const xp = sx - spineX(drag.base + t) + drag.offset;
      t = Math.acos(clamp(xp / drag.r, -1, 1)) / Math.PI;
    }

    const nextPosition = drag.base + t;
    const now = performance.now();
    const seconds = Math.max(0.001, (now - drag.lastTime) / 1000);
    const instant = (nextPosition - drag.lastPosition) / seconds;
    drag.velocity = drag.velocity * 0.6 + instant * 0.4;
    drag.lastPosition = nextPosition;
    drag.lastTime = now;
    drag.lastT = t;

    position.set(nextPosition);
    curlTarget.set(t < 0.38 ? CURL_MAX * (1 - t / 0.38) : 0);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      updateHover(event);
      return;
    }

    if (!drag.started) {
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.2) return;

      const dir: Direction = mode === 'spread' ? (drag.sideDir as Direction) : dx < 0 ? 1 : -1;
      const p0 = position.get();
      const available = dir > 0 ? p0 < maxView - 1e-3 : p0 > 1e-3;
      if (!available) {
        dragRef.current = null;
        return;
      }
      beginDrag(drag, dir, event);
    }

    dragTo(drag, event.clientX);
  };

  const endPointer = (event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;

    if (drag.started) {
      try {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      } catch {
        /* already released */
      }
      const t = clamp(position.get() - drag.base, 0, 1);
      const flick = Math.abs(drag.velocity) > FLICK_VELOCITY;
      const forward = flick ? drag.velocity > 0 : t > 0.5;
      curlTarget.set(0);
      animateTo(forward ? drag.base + 1 : drag.base, drag.velocity);
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
      updateHover(event);
      return;
    }

    if (!cancelled && drag.tapDir !== 0) {
      goTo(targetRef.current + drag.tapDir);
    }
  };

  const onPointerLeave = () => {
    curlTarget.set(0);
    if (stageRef.current && !dragRef.current) stageRef.current.style.cursor = 'default';
  };

  /* -------------------------------- render -------------------------------- */

  const context = useMemo<BookContextValue>(
    () => ({
      position,
      mode,
      leafCount: book.leaves.length,
      toc: book.toc,
      curlFace,
      curlCorner,
      curlSize,
      goTo,
      scrollToReservation,
    }),
    [position, mode, book.leaves.length, book.toc, curlFace, curlCorner, curlSize, goTo, scrollToReservation],
  );

  return (
    <BookContext.Provider value={context}>
      <div ref={rootRef} className="relative w-full">
        <div className="relative mx-auto w-full">
          <div
            className="relative mx-auto"
            style={{ width: stageW * scale, height: STAGE_H * scale }}
          >
            <div
              ref={stageRef}
              role="group"
              aria-roledescription="book"
              aria-label={t('flipbook.title')}
              className="absolute left-0 top-0 select-none"
              style={{
                width: stageW,
                height: STAGE_H,
                transform: `scale(${scale})`,
                transformOrigin: '0 0',
                perspective: 2500,
                overflowX: mode === 'single' ? 'clip' : 'visible',
                touchAction: 'pan-y',
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={(event) => endPointer(event, false)}
              onPointerCancel={(event) => endPointer(event, true)}
              onPointerLeave={onPointerLeave}
              onClickCapture={(event) => {
                if (suppressClickRef.current) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              }}
              onDragStart={(event) => event.preventDefault()}
            >
              <motion.div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  left: 20,
                  right: 20,
                  top: BOOK_TOP + PAGE_H + OVERHANG - 14,
                  height: 58,
                  scaleX: tableShadowScale,
                  background:
                    'radial-gradient(ellipse at 50% 28%, rgba(0,0,0,0.78), rgba(0,0,0,0.38) 46%, transparent 72%)',
                  filter: 'blur(6px)',
                }}
              />

              <TableCastShadow mode={mode} />
              <PaperStack />

              <motion.div
                className="absolute"
                style={{
                  left: mode === 'spread' ? stageW / 2 : 0,
                  top: BOOK_TOP,
                  width: PAGE_W,
                  height: PAGE_H,
                  x: bookX,
                  transformStyle: 'preserve-3d',
                }}
              >
                {book.leaves.map((leaf, index) => (
                  <Leaf
                    key={index}
                    index={index}
                    leaf={leaf}
                    focus={focus}
                    frontNumber={mode === 'spread' ? index * 2 + 1 : index + 1}
                    backNumber={mode === 'spread' ? index * 2 + 2 : null}
                  />
                ))}
              </motion.div>

              <Spine />
            </div>
          </div>

          <FloatingArrows view={focus} maxView={maxView} onPrev={prev} onNext={next} />
        </div>

        <BookToolbar
          mode={mode}
          view={focus}
          maxView={maxView}
          totalPages={book.totalPages}
          soundOn={soundOn}
          onPrev={prev}
          onNext={next}
          onToggleSound={toggleSound}
        />

        <ThumbnailBar thumbs={book.thumbs} mode={mode} view={focus} onJump={goTo} />

        <p className="mt-3 text-center text-[10px] uppercase tracking-[0.32em] text-[#D4AF37]/45">
          {t('flipbook.controls.hint')}
        </p>
      </div>
    </BookContext.Provider>
  );
}

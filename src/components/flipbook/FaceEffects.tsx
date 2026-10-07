'use client';

import { motion, useTransform } from 'framer-motion';
import { useBook } from './bookContext';
import { clamp, PAGE_W, type Corner } from './bookModel';
import { FLAP_BOX, FLAPS } from './curl';

const SHADOW_FADE = 80;

interface FaceShadingProps {
  leafIndex: number;
  side: 'front' | 'back';
  /** Offset between the shaded layer and the page rect (hard covers overhang on one side) */
  inset: number;
}

/**
 * Light and shadow that depend on the live page position:
 *  - a projection shadow cast onto this face by the neighbouring leaf that is turning above it
 *  - self shading while this face is itself rotating away from the light
 * Everything is transform/opacity only, so it never triggers layout or repaints the page.
 */
export function FaceShading({ leafIndex, side, inset }: FaceShadingProps) {
  const { position, leafCount } = useBook();

  const sourceIndex = side === 'front' ? leafIndex - 1 : leafIndex + 1;
  const hasSource = sourceIndex >= 0 && sourceIndex < leafCount;

  const castX = useTransform(position, (p) => {
    const cos = Math.cos(Math.PI * clamp(p - sourceIndex, 0, 1));
    return side === 'front'
      ? PAGE_W * cos - PAGE_W + inset
      : PAGE_W * (1 + cos) - SHADOW_FADE + inset;
  });
  const castOpacity = useTransform(position, (p) =>
    Math.sin(Math.PI * clamp(p - sourceIndex, 0, 1)),
  );
  const selfOpacity = useTransform(
    position,
    (p) => 0.6 * Math.sin(Math.PI * clamp(p - leafIndex, 0, 1)),
  );

  const castBackground =
    side === 'front'
      ? `linear-gradient(to right, rgba(20,10,0,0.22) 0, rgba(20,10,0,0.62) ${PAGE_W - 8}px, transparent ${PAGE_W + SHADOW_FADE}px)`
      : `linear-gradient(to right, transparent 0, rgba(20,10,0,0.62) ${SHADOW_FADE}px, rgba(20,10,0,0.22) 100%)`;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: selfOpacity,
          background:
            side === 'front'
              ? 'linear-gradient(to right, rgba(20,10,0,0.6) 0%, rgba(20,10,0,0.12) 100%)'
              : 'linear-gradient(to left, rgba(20,10,0,0.6) 0%, rgba(20,10,0,0.12) 100%)',
          willChange: 'opacity',
        }}
      />
      {hasSource && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-full"
          style={{
            width: PAGE_W + SHADOW_FADE,
            x: castX,
            opacity: castOpacity,
            background: castBackground,
            willChange: 'transform, opacity',
          }}
        />
      )}
    </>
  );
}

interface FlapProps {
  corner: Corner;
  id: string;
}

function Flap({ corner, id }: FlapProps) {
  const { curlFace, curlCorner, curlSize } = useBook();
  const geometry = FLAPS[corner];

  const scale = useTransform(() =>
    curlFace.get() === id && curlCorner.get() === corner
      ? Math.max(0, curlSize.get()) / FLAP_BOX
      : 0,
  );
  const opacity = useTransform(scale, (value) => (value > 0.01 ? 1 : 0));

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        ...geometry.anchor,
        width: FLAP_BOX,
        height: FLAP_BOX,
        transformOrigin: geometry.origin,
        scale,
        opacity,
        filter: geometry.shadow,
        willChange: 'transform, opacity',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          clipPath: geometry.polygon,
          background: `linear-gradient(${geometry.gradientAngle}deg, #fffdf3 50%, #efe4c4 62%, #d3c196 100%)`,
        }}
      />
    </motion.div>
  );
}

/** The folded-over paper triangles for the corners that belong to this side of a leaf. */
export function CornerFlaps({
  side,
  leafIndex,
}: {
  side: 'front' | 'back';
  leafIndex: number;
}) {
  const id = `${side === 'front' ? 'f' : 'b'}${leafIndex}`;
  const corners: Corner[] = side === 'front' ? ['tr', 'br'] : ['tl', 'bl'];
  return (
    <>
      {corners.map((corner) => (
        <Flap key={corner} corner={corner} id={id} />
      ))}
    </>
  );
}

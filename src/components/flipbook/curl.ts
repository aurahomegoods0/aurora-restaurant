import type { Corner } from './bookModel';

/** Side length of the square box that holds a folded-over flap at full size. */
export const FLAP_BOX = 112;

/** Largest peel size reached when hovering exactly on the corner. */
export const CURL_MAX = 64;
export const CURL_MIN = 26;
/** Hover/tap zone measured from the page corner. */
export const CORNER_ZONE = 92;

interface FlapGeometry {
  anchor: { top?: 0; bottom?: 0; left?: 0; right?: 0 };
  origin: string;
  polygon: string;
  /** Gradient runs from the crease (50%) towards the folded-over vertex (100%). */
  gradientAngle: number;
  shadow: string;
}

/*
 * A 45deg corner fold: the vertex V is cut off along the crease A-B and its mirror
 * image V' lands on the page. The flap box is anchored at V and scaled by size/FLAP_BOX,
 * so the animation stays a pure transform.
 */
export const FLAPS: Record<Corner, FlapGeometry> = {
  tr: {
    anchor: { top: 0, right: 0 },
    origin: '100% 0',
    polygon: 'polygon(0 0, 100% 100%, 0 100%)',
    gradientAngle: 225,
    shadow: 'drop-shadow(-4px 5px 5px rgba(40, 24, 6, 0.38))',
  },
  br: {
    anchor: { bottom: 0, right: 0 },
    origin: '100% 100%',
    polygon: 'polygon(0 100%, 100% 0, 0 0)',
    gradientAngle: 315,
    shadow: 'drop-shadow(-4px -5px 5px rgba(40, 24, 6, 0.38))',
  },
  tl: {
    anchor: { top: 0, left: 0 },
    origin: '0 0',
    polygon: 'polygon(100% 0, 0 100%, 100% 100%)',
    gradientAngle: 135,
    shadow: 'drop-shadow(4px 5px 5px rgba(40, 24, 6, 0.38))',
  },
  bl: {
    anchor: { bottom: 0, left: 0 },
    origin: '0 100%',
    polygon: 'polygon(100% 100%, 0 0, 100% 0)',
    gradientAngle: 45,
    shadow: 'drop-shadow(4px -5px 5px rgba(40, 24, 6, 0.38))',
  },
};

/** clip-path that removes the corner triangle from the page. */
export const clipForCorner = (corner: Corner, size: number): string => {
  const s = `${size.toFixed(1)}px`;
  switch (corner) {
    case 'tr':
      return `polygon(0 0, calc(100% - ${s}) 0, 100% ${s}, 100% 100%, 0 100%)`;
    case 'br':
      return `polygon(0 0, 100% 0, 100% calc(100% - ${s}), calc(100% - ${s}) 100%, 0 100%)`;
    case 'tl':
      return `polygon(${s} 0, 100% 0, 100% 100%, 0 100%, 0 ${s})`;
    case 'bl':
      return `polygon(0 0, 100% 0, 100% 100%, ${s} 100%, 0 calc(100% - ${s}))`;
  }
};

export const faceId = (side: 'front' | 'back', leafIndex: number): string =>
  `${side === 'front' ? 'f' : 'b'}${leafIndex}`;

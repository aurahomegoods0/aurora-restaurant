'use client';

import { memo, type ReactNode } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useBook } from './bookContext';
import { OVERHANG, type PageContent } from './bookModel';
import { clipForCorner, faceId } from './curl';
import { CornerFlaps, FaceShading } from './FaceEffects';
import { DishFace } from './faces/DishFace';
import {
  BackCoverArt,
  BackInnerPage,
  CoverFront,
  IntroPage,
} from './faces/CoverFaces';
import { ChefNotePage, OrnamentPage, PaperBackPage } from './faces/NoteFaces';

interface PageFaceProps {
  side: 'front' | 'back';
  leafIndex: number;
  content: PageContent;
  hardcover: boolean;
  pageNumber: number | null;
  /** Mount heavy content (photos) */
  near: boolean;
  /** Currently one of the visible pages: focusable and exposed to assistive tech */
  visible: boolean;
}

/** Spine-side darkening that makes the paper look like it curves into the gutter. */
function GutterShade({ side }: { side: 'front' | 'back' }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background: `linear-gradient(${
          side === 'front' ? 'to right' : 'to left'
        }, rgba(30,18,4,0.42) 0, rgba(30,18,4,0.16) 3.5%, rgba(30,18,4,0.05) 9%, transparent 17%)`,
      }}
    />
  );
}

function renderContent(
  content: PageContent,
  near: boolean,
  visible: boolean,
): ReactNode {
  switch (content.kind) {
    case 'cover':
      return <CoverFront active={visible} />;
    case 'backCover':
      return <BackCoverArt />;
    case 'intro':
      return <IntroPage interactive={visible} />;
    case 'dish':
      return (
        <DishFace
          item={content.item}
          number={content.number}
          near={near}
          interactive={visible}
        />
      );
    case 'note':
      return content.variant === 'chef' ? <ChefNotePage /> : <OrnamentPage />;
    case 'backInner':
      return <BackInnerPage interactive={visible} />;
    case 'paperBack':
      return <PaperBackPage />;
  }
}

function PageFaceImpl({
  side,
  leafIndex,
  content,
  hardcover,
  pageNumber,
  near,
  visible,
}: PageFaceProps) {
  const { curlFace, curlCorner, curlSize } = useBook();
  const id = faceId(side, leafIndex);

  const clipPath = useTransform(() => {
    const size = curlSize.get();
    return !hardcover && curlFace.get() === id && size > 0.5
      ? clipForCorner(curlCorner.get(), size)
      : 'none';
  });

  const isBoardArt = content.kind === 'cover' || content.kind === 'backCover';
  const hasInnerPaper = hardcover && !isBoardArt;

  // Hard covers overhang the page block on three sides; which side is the free edge flips with the face.
  const boardStyle = hardcover
    ? {
        top: -OVERHANG,
        bottom: -OVERHANG,
        left: side === 'front' ? 0 : -OVERHANG,
        right: side === 'front' ? -OVERHANG : 0,
      }
    : { top: 0, bottom: 0, left: 0, right: 0 };
  const shadeInset = hardcover && side === 'back' ? OVERHANG : 0;

  const paperInset =
    side === 'front'
      ? { top: OVERHANG, bottom: OVERHANG, left: 0, right: OVERHANG }
      : { top: OVERHANG, bottom: OVERHANG, left: OVERHANG, right: 0 };

  return (
    <div
      className="absolute inset-0"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: side === 'back' ? 'rotateY(180deg)' : undefined,
      }}
      aria-hidden={!visible}
      inert={!visible}
    >
      <motion.div
        className={`absolute ${hardcover ? 'leather rounded-[2px]' : 'paper'}`}
        style={{
          ...boardStyle,
          boxShadow: hardcover
            ? '0 1px 0 rgba(255,255,255,0.12) inset, 0 0 0 1px rgba(0,0,0,0.55), 0 8px 18px rgba(0,0,0,0.5)'
            : 'inset 0 0 46px rgba(120,86,30,0.16), 0 0 0 1px rgba(120,90,40,0.18)',
          clipPath,
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {hasInnerPaper ? (
            <div className="paper absolute" style={paperInset}>
              {renderContent(content, near, visible)}
              <GutterShade side={side} />
            </div>
          ) : (
            <>
              {renderContent(content, near, visible)}
              {!isBoardArt && <GutterShade side={side} />}
            </>
          )}

          {pageNumber !== null && !isBoardArt && (
            <span
              aria-hidden
              className={`absolute bottom-[19px] font-serif text-[10px] tracking-[0.2em] text-[#8a6a14]/70 ${
                side === 'front' ? 'right-[34px]' : 'left-[34px]'
              }`}
              style={
                hasInnerPaper
                  ? side === 'front'
                    ? { bottom: OVERHANG + 19, right: 34 + OVERHANG }
                    : { bottom: OVERHANG + 19, left: 34 + OVERHANG }
                  : undefined
              }
            >
              {pageNumber}
            </span>
          )}

          <FaceShading leafIndex={leafIndex} side={side} inset={shadeInset} />
        </div>
      </motion.div>

      {!hardcover && <CornerFlaps side={side} leafIndex={leafIndex} />}
    </div>
  );
}

export const PageFace = memo(PageFaceImpl);

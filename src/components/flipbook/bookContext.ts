'use client';

import { createContext, useContext } from 'react';
import type { MotionValue } from 'framer-motion';
import type { BookMode, Corner, TocEntry } from './bookModel';

export interface BookContextValue {
  toc: TocEntry[];
  /** Float view: the integer part is the number of fully turned leaves */
  position: MotionValue<number>;
  mode: BookMode;
  leafCount: number;
  /** Id of the face currently showing a corner peel (`f3` / `b2`), or '' */
  curlFace: MotionValue<string>;
  curlCorner: MotionValue<Corner>;
  /** Current peel size in px (spring-smoothed) */
  curlSize: MotionValue<number>;
  goTo: (view: number) => void;
  scrollToReservation: () => void;
}

export const BookContext = createContext<BookContextValue | null>(null);

export const useBook = (): BookContextValue => {
  const value = useContext(BookContext);
  if (!value) throw new Error('useBook must be used within <FlipBook>');
  return value;
};

import type { MenuItem, MenuItemCategory } from '@/types/menu';

/** Logical (unscaled) page size in CSS px. The whole book is scaled to fit the screen. */
export const PAGE_W = 440;
export const PAGE_H = 640;
/** How far a hard cover extends past the page block (top, bottom, outer edge). */
export const OVERHANG = 10;
/** Containers narrower than this show one page at a time. */
export const SPREAD_MIN_WIDTH = 760;
/** Room above the page block for leaves that lift toward the camera mid-turn. */
export const BOOK_TOP = 40;
/** Room below for the table shadow. */
export const STAGE_BOTTOM = 56;
export const STAGE_H = BOOK_TOP + PAGE_H + OVERHANG + STAGE_BOTTOM;

export const stageWidth = (mode: BookMode): number =>
  mode === 'spread' ? 2 * (PAGE_W + OVERHANG) : PAGE_W + OVERHANG;

export type BookMode = 'spread' | 'single';
export type Corner = 'tr' | 'br' | 'tl' | 'bl';

export type PageContent =
  | { kind: 'cover' }
  | { kind: 'intro' }
  | { kind: 'dish'; item: MenuItem; number: number }
  | { kind: 'note'; variant: 'chef' | 'ornament' }
  | { kind: 'backInner' }
  | { kind: 'backCover' }
  | { kind: 'paperBack' };

export interface LeafModel {
  front: PageContent;
  back: PageContent;
  /** Hard board (front/back cover) that overhangs the page block */
  hardcover: boolean;
}

export interface Thumb {
  key: string;
  kind: PageContent['kind'];
  /** The view (number of turned leaves) at which this page is visible */
  view: number;
  /** 1-based page number as shown in the counter */
  pageNumber: number;
  item?: MenuItem;
  label: string;
}

export interface TocEntry {
  category: MenuItemCategory;
  count: number;
  view: number;
  pageNumber: number;
}

export interface BookModel {
  mode: BookMode;
  leaves: LeafModel[];
  /** The last view; the final leaf is the back cover and never turns */
  maxView: number;
  totalPages: number;
  thumbs: Thumb[];
  toc: TocEntry[];
}

export const CATEGORY_ORDER: MenuItemCategory[] = [
  'starters',
  'mains',
  'steaks',
  'desserts',
  'drinks',
];

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const PAPER_BACK: PageContent = { kind: 'paperBack' };

const pageLabel = (content: PageContent): string => {
  switch (content.kind) {
    case 'dish':
      return content.item.name_en;
    case 'cover':
      return 'Cover';
    case 'intro':
      return 'Contents';
    case 'note':
      return content.variant === 'chef' ? "Chef's note" : 'Notes';
    default:
      return '';
  }
};

/** Menu items ordered by chapter, then price. */
export const sortMenuItems = (items: MenuItem[]): MenuItem[] =>
  [...items].sort((a, b) => {
    const byCategory =
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    return byCategory !== 0 ? byCategory : Number(a.price) - Number(b.price);
  });

/**
 * Lays the menu out as physical leaves.
 *
 * spread: each leaf has two printed sides. Leaf 0 is the front cover (its back is the
 *   contents page) and the last leaf is the back cover board, which never turns.
 * single: each leaf has one printed side (back is blank paper); pages turn off to the left.
 */
export const buildBook = (items: MenuItem[], mode: BookMode): BookModel => {
  const dishes: PageContent[] = sortMenuItems(items).map((item, index) => ({
    kind: 'dish',
    item,
    number: index + 1,
  }));
  const closing: PageContent = { kind: 'note', variant: 'chef' };

  const leaves: LeafModel[] = [];

  if (mode === 'spread') {
    leaves.push({
      front: { kind: 'cover' },
      back: { kind: 'intro' },
      hardcover: true,
    });

    const inner: PageContent[] = [...dishes, closing];
    if (inner.length % 2 !== 0) {
      inner.splice(inner.length - 1, 0, { kind: 'note', variant: 'ornament' });
    }
    for (let i = 0; i < inner.length; i += 2) {
      leaves.push({ front: inner[i], back: inner[i + 1], hardcover: false });
    }

    leaves.push({
      front: { kind: 'backInner' },
      back: { kind: 'backCover' },
      hardcover: true,
    });
  } else {
    const pages: PageContent[] = [
      { kind: 'cover' },
      { kind: 'intro' },
      ...dishes,
      closing,
      { kind: 'backInner' },
    ];
    pages.forEach((page, index) => {
      leaves.push({
        front: page,
        back: PAPER_BACK,
        hardcover: index === 0,
      });
    });
    leaves.push({
      front: { kind: 'backCover' },
      back: PAPER_BACK,
      hardcover: true,
    });
  }

  const thumbs: Thumb[] = [];
  const toc: TocEntry[] = [];
  const seenCategories = new Set<MenuItemCategory>();

  const register = (
    content: PageContent,
    view: number,
    pageNumber: number,
    key: string,
  ) => {
    if (
      content.kind !== 'cover' &&
      content.kind !== 'intro' &&
      content.kind !== 'dish' &&
      content.kind !== 'note'
    ) {
      return;
    }

    thumbs.push({
      key,
      kind: content.kind,
      view,
      pageNumber,
      item: content.kind === 'dish' ? content.item : undefined,
      label: pageLabel(content),
    });

    if (content.kind === 'dish') {
      const category = content.item.category;
      if (!seenCategories.has(category)) {
        seenCategories.add(category);
        toc.push({ category, count: 0, view, pageNumber });
      }
      const entry = toc.find((candidate) => candidate.category === category);
      if (entry) entry.count += 1;
    }
  };

  leaves.forEach((leaf, index) => {
    if (mode === 'spread') {
      // Front of leaf n is visible once n leaves are turned; its back once n + 1 are.
      register(leaf.front, index, index * 2 + 1, `f${index}`);
      register(leaf.back, index + 1, index * 2 + 2, `b${index}`);
    } else {
      register(leaf.front, index, index + 1, `f${index}`);
    }
  });

  // Back faces are registered after the next front; keep thumbnails in reading order.
  thumbs.sort((a, b) => a.pageNumber - b.pageNumber);

  return {
    mode,
    leaves,
    maxView: leaves.length - 1,
    // The outer face of the back cover is never shown in spread mode.
    totalPages: mode === 'spread' ? leaves.length * 2 - 1 : leaves.length,
    thumbs,
    toc,
  };
};

/** The page numbers visible for a given view, for the "Page x of y" counter. */
export const visiblePages = (
  mode: BookMode,
  view: number,
): { left: number | null; right: number } => {
  if (mode === 'single') return { left: null, right: view + 1 };
  return { left: view === 0 ? null : view * 2, right: view * 2 + 1 };
};

/** View index -> approximate equivalent view in the other layout (for resize/rotate). */
export const convertView = (
  view: number,
  from: BookMode,
  to: BookMode,
  maxView: number,
): number => {
  if (from === to) return clamp(view, 0, maxView);
  return clamp(from === 'spread' ? view * 2 : Math.floor(view / 2), 0, maxView);
};

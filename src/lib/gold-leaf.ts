const STORAGE_KEY = 'aurora.goldLeaf.v1';

const readMap = (): Record<string, true> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, true>;
  } catch {
    return {};
  }
};

export const isGoldLeafLifted = (sealId: string): boolean =>
  Boolean(readMap()[sealId]);

export const rememberGoldLeafLifted = (sealId: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const next = { ...readMap(), [sealId]: true as const };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
};

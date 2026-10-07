'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Avoid re-jumping to the same hash (Strict Mode, remounts, HMR). */
let lastHandledKey = '';

const HashScroll: React.FC = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/') {
      lastHandledKey = '';
      return;
    }

    let attempts = 0;
    let retry: number | undefined;

    const scrollToHash = (behavior: ScrollBehavior) => {
      const hash = window.location.hash;
      if (!hash || hash === '#' || hash === '#hero') return;
      const key = `${pathname}${hash}`;
      if (lastHandledKey === key) return;
      const el = document.querySelector(hash);
      if (el instanceof HTMLElement) {
        lastHandledKey = key;
        el.scrollIntoView({ behavior });
        return;
      }
      if (attempts < 40) {
        attempts += 1;
        retry = window.setTimeout(() => scrollToHash(behavior), 50);
      }
    };

    const frame = window.requestAnimationFrame(() => scrollToHash('auto'));
    const onHashChange = () => {
      lastHandledKey = '';
      attempts = 0;
      scrollToHash('smooth');
    };
    window.addEventListener('hashchange', onHashChange);

    return () => {
      window.cancelAnimationFrame(frame);
      if (retry) window.clearTimeout(retry);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [pathname]);

  return null;
};

export default HashScroll;

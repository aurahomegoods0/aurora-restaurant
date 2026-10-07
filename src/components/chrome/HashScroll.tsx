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

    const scrollToHash = (behavior: ScrollBehavior) => {
      const hash = window.location.hash;
      if (!hash || hash === '#' || hash === '#hero') return;
      const key = `${pathname}${hash}`;
      if (lastHandledKey === key) return;
      lastHandledKey = key;
      const el = document.querySelector(hash);
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior });
      }
    };

    const frame = window.requestAnimationFrame(() => scrollToHash('auto'));
    const onHashChange = () => {
      lastHandledKey = '';
      scrollToHash('smooth');
    };
    window.addEventListener('hashchange', onHashChange);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [pathname]);

  return null;
};

export default HashScroll;

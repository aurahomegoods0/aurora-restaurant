'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const SHOW_AFTER_PX = 480;
const SLOW_SCROLL_MS = 140;

const BackToTop: React.FC = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const lastY = useRef(0);
  const lastT = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    lastT.current = performance.now();

    const onScroll = () => {
      const y = window.scrollY;
      const now = performance.now();
      const dy = Math.abs(y - lastY.current);
      const dt = Math.max(now - lastT.current, 1);
      const speed = dy / dt;
      lastY.current = y;
      lastT.current = now;

      const deep = y > SHOW_AFTER_PX;
      const slow = speed < 1.2;
      setVisible(deep && (slow || y > SHOW_AFTER_PX * 2));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: SLOW_SCROLL_MS / 1000 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-4 z-[55] inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#0A0A0A]/90 text-[#E8C96A] shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md transition-colors hover:border-[#D4AF37] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] sm:bottom-8 sm:right-6"
          aria-label={t('ux.backToTop')}
        >
          <ArrowUp className="h-5 w-5" aria-hidden />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;

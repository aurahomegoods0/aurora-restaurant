'use client';

import React from 'react';
import { motion, useScroll } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const ScrollProgress: React.FC = () => {
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent"
      role="progressbar"
      aria-label={t('ux.scrollProgress')}
    >
      <motion.div
        className="h-full origin-left bg-gradient-to-r from-[#8C6D1F] via-[#D4AF37] to-[#F3E4A8]"
        style={{ scaleX: scrollYProgress }}
      />
    </div>
  );
};

export default ScrollProgress;

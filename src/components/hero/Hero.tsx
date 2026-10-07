'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Navbar from './Navbar';

const Hero: React.FC = () => {
  const { t } = useLanguage();

  const handleScrollTo = (target: string) => {
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative w-full h-screen overflow-hidden bg-[#0A0A0A] flex flex-col"
    >
      {/* Background YouTube Video */}
      <iframe
        src="https://www.youtube.com/embed/UbeEGWmud-4?autoplay=1&mute=1&controls=0&loop=1&playlist=UbeEGWmud-4&showinfo=0&rel=0&enablejsapi=1&iv_load_policy=3&disablekb=1"
        title="Background Video"
        className="pointer-events-none absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 object-cover z-0 opacity-40"
        allow="autoplay; encrypted-media"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Dark Vignette Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#0A0A0A]" />

      {/* Navbar */}
      <div className="relative z-20">
        <Navbar />
      </div>

      {/* Central Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center sm:px-6">
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6 text-sm font-light uppercase tracking-[0.4em] text-[#D4AF37] sm:text-base"
        >
          {t('hero.tagline')}
        </motion.p>

        {/* Grand Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="max-w-4xl text-4xl font-bold leading-tight tracking-[0.15em] text-white sm:text-6xl lg:text-7xl"
        >
          {t('hero.title')}
          <span className="block bg-gradient-to-r from-[#D4AF37] via-[#E8C96A] to-[#D4AF37] bg-clip-text text-transparent">
            {t('hero.titleAccent')}
          </span>
        </motion.h1>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-8 h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
        />

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6"
        >
          <button
            type="button"
            onClick={() => handleScrollTo('#reservation')}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E8C96A] to-[#D4AF37] px-8 py-4 text-sm font-semibold uppercase tracking-widest text-[#0A0A0A] shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
          >
            {t('hero.reserveTable')}
          </button>
          <button
            type="button"
            onClick={() => handleScrollTo('#menu')}
            className="inline-flex items-center justify-center rounded-full border-2 border-[#D4AF37] px-8 py-4 text-sm font-semibold uppercase tracking-widest text-[#D4AF37] transition-all duration-300 hover:scale-105 hover:bg-[#D4AF37] hover:text-[#0A0A0A]"
          >
            {t('hero.exploreMenu')}
          </button>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.button
        type="button"
        onClick={() => handleScrollTo('#menu')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/60 transition-colors duration-300 hover:text-[#D4AF37]"
        aria-label="Scroll down"
      >
        <span className="text-[10px] font-light uppercase tracking-[0.3em]">
          {t('hero.scrollDown')}
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.button>
    </section>
  );
};

export default Hero;
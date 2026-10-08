'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import {
  COOKIE_CONSENT_EVENT,
  getCookieConsent,
  setCookieConsent,
  type CookieConsent,
} from '@/lib/cookie-consent';

const CookieBanner: React.FC = () => {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(getCookieConsent() === null);

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsent | null>).detail;
      setOpen(detail == null);
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onChange);
  }, []);

  const choose = (value: CookieConsent) => {
    setCookieConsent(value);
    setOpen(false);
  };

  if (pathname.startsWith('/admin')) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-sm border border-[#D4AF37]/25 bg-[#121212]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:p-5"
          role="dialog"
          aria-labelledby="cookie-banner-title"
        >
          <p
            id="cookie-banner-title"
            className="text-xs font-medium uppercase tracking-[0.25em] text-[#D4AF37]"
          >
            {t('cookies.bannerTitle')}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            {t('cookies.bannerBody')}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => choose('all')}
              className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-[2px] bg-[#D4AF37] px-5 text-sm font-medium uppercase tracking-wider text-[#070707]"
            >
              {t('cookies.acceptAll')}
            </button>
            <button
              type="button"
              onClick={() => choose('necessary')}
              className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-[2px] border border-[#D4AF37]/55 px-5 text-sm uppercase tracking-wider text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              {t('cookies.necessary')}
            </button>
            <Link
              href="/cookies"
              className="inline-flex min-h-11 items-center justify-center px-2 text-sm text-[#E8C96A] underline-offset-4 hover:underline"
            >
              {t('cookies.more')}
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;

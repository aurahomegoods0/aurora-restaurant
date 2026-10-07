'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Globe, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { restaurantConfig } from '../../../restaurant.config';
import { useLanguage, type Language } from '../../context/LanguageContext';

const NAV_LINKS = [
  { labelKey: 'nav.menu', href: '#menu' },
  { labelKey: 'nav.book', href: '#flipbook' },
  { labelKey: 'nav.about', href: '#about' },
  { labelKey: 'nav.reservation', href: '#reservation' },
  { labelKey: 'nav.contact', href: '#contact' },
] as const;

const LANGUAGES: Language[] = ['uz', 'en', 'ru'];

const cn = (...inputs: Parameters<typeof clsx>) => twMerge(clsx(inputs));

const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let io: IntersectionObserver | undefined;
    let retry: number | undefined;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      const nodes = NAV_LINKS.map((link) =>
        document.querySelector(link.href),
      ).filter((el): el is HTMLElement => el instanceof HTMLElement);

      if (nodes.length < NAV_LINKS.length) {
        retry = window.setTimeout(connect, 400);
      }
      if (nodes.length === 0) return;

      io?.disconnect();
      io = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (!(visible?.target instanceof HTMLElement) || !visible.target.id) {
            return;
          }
          const next = `#${visible.target.id}`;
          setActiveSection((prev) => (prev === next ? prev : next));
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5] },
      );
      nodes.forEach((node) => io?.observe(node));
    };

    connect();
    return () => {
      cancelled = true;
      if (retry) window.clearTimeout(retry);
      io?.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const goToHash = (href: string) => {
    setIsMobileMenuOpen(false);

    if (pathname !== '/') {
      router.push(`/${href === '#' || href === '#hero' ? '' : href}`);
      return;
    }

    if (href === '#' || href === '#hero') {
      window.history.replaceState(null, '', '#hero');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.history.replaceState(null, '', href);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    goToHash(href);
  };

  const handleBookClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    goToHash('#reservation');
  };

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b border-[#D4AF37]/20 backdrop-blur-md transition-all duration-300',
          isScrolled
            ? 'bg-[#0A0A0A]/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-[#0A0A0A]/40',
        )}
      >
        <nav
          aria-label="Asosiy navigatsiya"
          className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          {/* Brand Logo */}
          <a
            href="/#hero"
            onClick={(e) => handleNavClick(e, '#hero')}
            className="group flex min-h-11 items-center gap-2"
          >
            <span className="text-2xl font-bold tracking-[0.3em] text-[#D4AF37] transition-transform duration-300 group-hover:scale-105 sm:text-3xl">
              {restaurantConfig.name}
            </span>
            <span className="hidden h-px w-8 bg-gradient-to-r from-[#D4AF37] to-transparent sm:block" />
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  'relative inline-flex min-h-11 items-center text-sm font-medium uppercase tracking-widest transition-colors duration-300',
                  activeSection === link.href
                    ? 'text-[#D4AF37]'
                    : 'text-white/70 hover:text-white',
                )}
              >
                {t(link.labelKey)}
                <span
                  className={cn(
                    'absolute -bottom-1.5 left-0 h-px bg-[#D4AF37] transition-all duration-300',
                    activeSection === link.href ? 'w-full' : 'w-0',
                  )}
                />
              </a>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen((prev) => !prev)}
                aria-label="Til"
                aria-haspopup="listbox"
                aria-expanded={isLangOpen}
                className="flex min-h-11 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium uppercase tracking-wider text-white/80 transition-all duration-300 hover:border-[#D4AF37]/40 hover:text-white"
              >
                <Globe className="h-3.5 w-3.5 text-[#D4AF37]" />
                {language.toUpperCase()}
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform duration-300',
                    isLangOpen && 'rotate-180',
                  )}
                />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-32 overflow-hidden rounded-xl border border-white/10 bg-[#121212]/95 shadow-2xl backdrop-blur-md"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          setLanguage(lang);
                          setIsLangOpen(false);
                        }}
                        className={cn(
                          'flex min-h-11 w-full items-center px-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200',
                          language === lang
                            ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                            : 'text-white/70 hover:bg-white/5 hover:text-white',
                        )}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Book a Table CTA */}
            <a
              href="#reservation"
              onClick={handleBookClick}
              className="hidden min-h-11 items-center rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E8C96A] to-[#D4AF37] px-5 text-sm font-semibold uppercase tracking-wider text-[#0A0A0A] shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] sm:inline-flex"
            >
              {t('nav.bookTable')}
            </a>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors duration-300 hover:border-[#D4AF37]/40 lg:hidden"
              aria-label="Menyu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Full-Screen Slide-Over Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl lg:hidden"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.4, ease: 'easeInOut' }}
              className="flex h-full flex-col justify-between overflow-y-auto px-8 pb-10 pt-28"
            >
              <div className="flex flex-col gap-2">
                {NAV_LINKS.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.08 }}
                    className={cn(
                      'border-b border-white/5 py-4 text-2xl font-light uppercase tracking-[0.2em] transition-colors duration-300',
                      activeSection === link.href
                        ? 'text-[#D4AF37]'
                        : 'text-white/80 hover:text-[#D4AF37]',
                    )}
                  >
                    {t(link.labelKey)}
                  </motion.a>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-6"
              >
                <a
                  href="#reservation"
                  onClick={handleBookClick}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E8C96A] to-[#D4AF37] px-8 py-4 text-base font-semibold uppercase tracking-wider text-[#0A0A0A] shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-transform duration-300 hover:scale-105"
                >
                  {t('nav.bookTable')}
                </a>

                <div className="flex items-center justify-center gap-3">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      className={cn(
                        'min-h-11 min-w-11 rounded-full border px-4 text-xs font-medium uppercase tracking-wider transition-all duration-300',
                        language === lang
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                          : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white',
                      )}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
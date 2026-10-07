'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import dynamic from 'next/dynamic';
import { restaurantConfig } from '../../../restaurant.config';
import { useLanguage } from '@/context/LanguageContext';
import { clearCookieConsent } from '@/lib/cookie-consent';

const ContactMap = dynamic(() => import('./ContactMap'), {
  ssr: false,
  loading: () => <div className="h-full min-h-[240px] bg-[#121212]" />,
});

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="relative overflow-x-clip border-t border-white/10 bg-[#080808] px-4 pt-16 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-[0.3em] text-[#D4AF37]">
            {restaurantConfig.name}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/50">
            {t('footer.tagline')}
          </p>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                {t('footer.contact')}
              </p>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li>
                  <a
                    href={`tel:${restaurantConfig.contact.phone.replace(/\s/g, '')}`}
                    className="inline-flex min-h-11 items-center gap-2 hover:text-white"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                    {restaurantConfig.contact.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${restaurantConfig.contact.email}`}
                    className="inline-flex min-h-11 items-center gap-2 break-all hover:text-white"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                    {restaurantConfig.contact.email}
                  </a>
                </li>
                <li className="flex min-h-11 items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
                  <span>{restaurantConfig.contact.address}</span>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                {t('footer.hours')}
              </p>
              <p className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-white/70">
                <Clock className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                {restaurantConfig.contact.workingHours}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/40">
                {t('footer.hoursNote')}
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-[240px] overflow-hidden rounded-sm border border-white/10">
          <ContactMap />
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/50">
          <span className="w-full text-xs uppercase tracking-[0.2em] text-white/30 sm:w-auto">
            {t('footer.legal')}
          </span>
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center hover:text-[#E8C96A]"
          >
            {t('footer.privacy')}
          </Link>
          <Link
            href="/cookies"
            className="inline-flex min-h-11 items-center hover:text-[#E8C96A]"
          >
            {t('footer.cookies')}
          </Link>
          <button
            type="button"
            onClick={() => clearCookieConsent()}
            className="inline-flex min-h-11 items-center hover:text-[#E8C96A]"
          >
            {t('footer.cookieSettings')}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
          <a
            href={restaurantConfig.socials.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center hover:text-white"
          >
            Instagram
          </a>
          <a
            href={restaurantConfig.socials.telegram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center hover:text-white"
          >
            Telegram
          </a>
          <a
            href={restaurantConfig.socials.facebook}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center hover:text-white"
          >
            Facebook
          </a>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-7xl text-center text-xs text-white/35 sm:text-left">
        © {year} {restaurantConfig.name}. {t('footer.rights')}
      </p>
    </footer>
  );
};

export default Footer;

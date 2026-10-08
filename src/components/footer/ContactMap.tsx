'use client';

import React, { useEffect, useState } from 'react';
import { restaurantConfig } from '../../../restaurant.config';
import { useLanguage } from '@/context/LanguageContext';
import {
  COOKIE_CONSENT_EVENT,
  getCookieConsent,
  setCookieConsent,
  type CookieConsent,
} from '@/lib/cookie-consent';

const ContactMap: React.FC = () => {
  const { t } = useLanguage();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const apply = (value: CookieConsent | null) => {
      setAllowed(value === 'all');
    };
    apply(getCookieConsent());

    const onChange = (event: Event) => {
      apply((event as CustomEvent<CookieConsent | null>).detail ?? getCookieConsent());
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onChange);
  }, []);

  if (allowed) {
    return (
      <iframe
        title={t('footer.mapTitle')}
        src={restaurantConfig.contact.mapEmbedUrl}
        className="h-full min-h-[240px] w-full border-0 grayscale invert-[0.9] contrast-[1.1]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    );
  }

  return (
    <div className="flex h-full min-h-[240px] flex-col items-start justify-end bg-[radial-gradient(ellipse_at_30%_20%,rgba(212,175,55,0.18),transparent_55%),#121212] p-5">
      <p className="max-w-sm text-sm leading-relaxed text-white/65">
        {t('footer.mapConsent')}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setCookieConsent('all');
            setAllowed(true);
          }}
          className="inline-flex min-h-11 items-center rounded-[2px] bg-[#D4AF37] px-4 text-sm font-medium uppercase tracking-wider text-[#070707]"
        >
          {t('footer.loadMap')}
        </button>
        <a
          href={restaurantConfig.contact.mapDirectionsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center rounded-[2px] border border-[#D4AF37]/55 px-4 text-sm uppercase tracking-wider text-[#D4AF37]"
        >
          {t('footer.openMap')}
        </a>
      </div>
    </div>
  );
};

export default ContactMap;

'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import {
  COOKIE_CONSENT_EVENT,
  getCookieConsent,
  type CookieConsent,
} from '@/lib/cookie-consent';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const Observability: React.FC = () => {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    setConsent(getCookieConsent());
    const onChange = (event: Event) => {
      setConsent((event as CustomEvent<CookieConsent | null>).detail ?? null);
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onChange);
  }, []);

  const allowAnalytics = consent === 'all';

  return (
    <>
      <Analytics />
      <SpeedInsights />
      {allowAnalytics && GA_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { anonymize_ip: true });`}
          </Script>
        </>
      ) : null}
    </>
  );
};

export default Observability;

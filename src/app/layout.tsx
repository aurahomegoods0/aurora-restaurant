import './globals.css';
import type { Metadata, Viewport } from 'next';
import {
  Cormorant_Garamond,
  Instrument_Sans,
  Playfair_Display,
} from 'next/font/google';
import React from 'react';
import { cookies } from 'next/headers';
import { restaurantConfig } from '../../restaurant.config';
import { LanguageProvider } from '../context/LanguageContext';
import { defaultLanguage, LANG_COOKIE, parseLanguage } from '@/lib/language';
import Navbar from '../components/hero/Navbar';
import Footer from '../components/footer';
import ScrollProgress from '../components/ui/ScrollProgress';
import BackToTop from '../components/ui/BackToTop';
import CookieBanner from '../components/legal/CookieBanner';
import HashScroll from '../components/chrome/HashScroll';
import RestaurantJsonLd from '../components/seo/RestaurantJsonLd';
import Observability from '../components/analytics/Observability';

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-playfair',
  display: 'swap',
});

const instrument = Instrument_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-instrument',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(restaurantConfig.siteUrl),
  title: {
    default: 'AURORA | Fine Dining Restaurant in Tashkent',
    template: '%s | AURORA',
  },
  description: restaurantConfig.description,
  alternates: {
    canonical: restaurantConfig.siteUrl,
  },
  category: 'restaurant',
  keywords: [
    'AURORA',
    'restaurant',
    'fine dining',
    'Tashkent',
    'luxury restaurant',
    'reservation',
    'halal',
    'steakhouse',
  ],
  authors: [
    { name: 'AURORA Restaurant', url: restaurantConfig.socials.instagram },
  ],
  creator: 'AURORA Restaurant',
  publisher: 'AURORA Restaurant',
  openGraph: {
    title: 'AURORA | Unparalleled Fine-Dining Experience',
    description: restaurantConfig.description,
    type: 'website',
    locale: 'uz_UZ',
    url: restaurantConfig.siteUrl,
    siteName: 'AURORA',
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'AURORA - Unparalleled Fine-Dining Experience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AURORA | Unparalleled Fine-Dining Experience',
    description: restaurantConfig.description,
    images: ['/og'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const language =
    parseLanguage((await cookies()).get(LANG_COOKIE)?.value) ??
    defaultLanguage();

  return (
    <html
      lang={language}
      className={`${playfair.variable} ${instrument.variable} ${cormorant.variable} overflow-x-hidden`}
    >
      <body className="min-h-screen overflow-x-hidden bg-[#070707] font-sans text-[#F4EDE0] antialiased">
        <RestaurantJsonLd />
        <LanguageProvider initialLanguage={language}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-sm focus:bg-[#D4AF37] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#0A0A0A]"
          >
            Skip to content
          </a>
          <HashScroll />
          <ScrollProgress />
          <Navbar />
          {children}
          <Footer />
          <BackToTop />
          <CookieBanner />
          <Observability />
        </LanguageProvider>
      </body>
    </html>
  );
}
import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import { restaurantConfig } from '../../restaurant.config';
import { LanguageProvider } from '../context/LanguageContext';

export const metadata: Metadata = {
  metadataBase: new URL(restaurantConfig.siteUrl),
  title: 'AURORA | Unparalleled Fine-Dining Experience',
  description: restaurantConfig.description,
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

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang={restaurantConfig.defaultLanguage}>
      <body className="bg-[#0A0A0A] text-white min-h-screen antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
};

export default RootLayout;
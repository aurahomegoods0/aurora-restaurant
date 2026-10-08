'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const SECTIONS = ['s1', 's2', 's3', 's4', 's5'] as const;

interface LegalDocumentProps {
  kind: 'privacy' | 'cookies' | 'terms';
}

const LegalDocument: React.FC<LegalDocumentProps> = ({ kind }) => {
  const { t } = useLanguage();

  return (
    <article className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
        AURORA
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[0.06em] text-white sm:text-4xl">
        {t(`${kind}.pageTitle`)}
      </h1>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/40">
        {t(`${kind}.updated`)}
      </p>
      <p className="mt-8 text-base leading-relaxed text-white/70">
        {t(`${kind}.intro`)}
      </p>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section}>
            <h2 className="text-lg font-medium text-[#E8C96A]">
              {t(`${kind}.${section}Title`)}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              {t(`${kind}.${section}Body`)}
            </p>
          </section>
        ))}
      </div>

      <Link
        href="/"
        className="mt-12 inline-flex min-h-11 items-center text-sm uppercase tracking-[0.2em] text-[#D4AF37] hover:text-[#F3E4A8]"
      >
        ← AURORA
      </Link>
    </article>
  );
};

export default LegalDocument;

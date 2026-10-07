'use client';

import { useLanguage } from '@/context/LanguageContext';
import { AuroraEmblem, GOLD_INK, GoldDivider, INK, INK_SOFT, PageFrame } from './decor';

export function ChefNotePage() {
  const { t } = useLanguage();

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center text-center font-serif"
      style={{ padding: '48px 50px', color: INK }}
    >
      <PageFrame />
      <AuroraEmblem size={78} variant="ink" />
      <h3
        className="relative mt-5 text-[30px] font-semibold uppercase tracking-[0.2em] [text-indent:0.2em]"
        style={{ color: GOLD_INK }}
      >
        {t('flipbook.chef.title')}
      </h3>
      <GoldDivider className="my-4" />
      <p className="relative text-[16px] italic leading-[1.75]" style={{ color: INK_SOFT }}>
        &ldquo;{t('flipbook.chef.body')}&rdquo;
      </p>
      <p
        className="relative mt-7 text-[15px] font-semibold uppercase tracking-[0.26em]"
        style={{ color: GOLD_INK }}
      >
        {t('flipbook.chef.sign')}
      </p>
    </div>
  );
}

/** Pure ornament: balances an odd number of dishes so every leaf has two printed sides. */
export function OrnamentPage() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ color: INK }}>
      <PageFrame />
      <div className="relative opacity-80">
        <AuroraEmblem size={150} variant="ink" />
      </div>
    </div>
  );
}

export function PaperBackPage() {
  return <PageFrame inset={18} />;
}

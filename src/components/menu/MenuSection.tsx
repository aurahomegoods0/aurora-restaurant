'use client';

import './menu.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase/client';
import type { MenuItem } from '@/types/menu';
import FeaturedDish from './FeaturedDish';
import MenuCard from './MenuCard';
import MenuModal from './MenuModal';
import {
  DIETARY_TAGS,
  type DietaryTag,
  type MenuCategoryFilter,
  menuItemMatchesSearch,
} from './menuUtils';

const CATEGORY_KEYS: MenuCategoryFilter[] = [
  'all',
  'starters',
  'mains',
  'steaks',
  'desserts',
  'drinks',
];

const MenuSection: React.FC = () => {
  const { t, language } = useLanguage();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<MenuCategoryFilter>('all');
  const [search, setSearch] = useState('');
  const [dietaryFilters, setDietaryFilters] = useState<DietaryTag[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('menu_items')
        .select('*')
        .order('category')
        .order('price', { ascending: true });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setItems([]);
      } else {
        const uniqueItems = (data as MenuItem[]).filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (i) =>
                i.name_uz === item.name_uz &&
                i.name_en === item.name_en &&
                i.name_ru === item.name_ru &&
                i.price === item.price,
            ),
        );
        setItems(uniqueItems);
      }
      setLoading(false);
    }

    void loadMenu();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleDietary = useCallback((tag: DietaryTag) => {
    setDietaryFilters((prev) =>
      prev.includes(tag) ? prev.filter((entry) => entry !== tag) : [...prev, tag],
    );
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!menuItemMatchesSearch(item, search, language)) return false;

      if (dietaryFilters.length > 0) {
        const itemTags = item.tags ?? [];
        const hasAll = dietaryFilters.every((tag) => itemTags.includes(tag));
        if (!hasAll) return false;
      }

      return true;
    });
  }, [items, category, search, language, dietaryFilters]);

  const featured = useMemo(() => {
    if (category !== 'all' || search.trim() || dietaryFilters.length > 0) {
      return null;
    }
    const brokenPhoto = /1600891960488|1592417817098/;
    const usable = items.filter((item) => !brokenPhoto.test(item.image_url));
    const filet = usable.find((item) =>
      /filet mignon|file mignon/i.test(item.name_en),
    );
    if (filet) return filet;
    const steaks = usable.filter((item) => item.category === 'steaks');
    const pool = steaks.length > 0 ? steaks : usable;
    return (
      [...pool].sort((a, b) => Number(b.price) - Number(a.price))[0] ?? null
    );
  }, [items, category, search, dietaryFilters]);

  const listItems = useMemo(() => {
    if (!featured) return filteredItems;
    return filteredItems.filter((item) => item.id !== featured.id);
  }, [filteredItems, featured]);

  const counts = useMemo(() => {
    const next: Partial<Record<MenuCategoryFilter, number>> = {
      all: items.length,
    };
    for (const item of items) {
      next[item.category] = (next[item.category] ?? 0) + 1;
    }
    return next;
  }, [items]);

  useEffect(() => {
    if (
      selectedItem &&
      !filteredItems.some((entry) => entry.id === selectedItem.id)
    ) {
      setSelectedItem(null);
    }
  }, [filteredItems, selectedItem]);

  return (
    <section
      id="menu"
      className="relative overflow-hidden bg-[#070707] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12),transparent_68%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(16,120,96,0.08),transparent_70%)]"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

      <p
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-16 hidden -translate-x-1/2 select-none font-serif text-[clamp(4rem,14vw,11rem)] font-semibold leading-none tracking-[0.18em] text-transparent opacity-[0.07] [-webkit-text-stroke:1px_rgba(212,175,55,0.35)] lg:block"
      >
        MENU
      </p>

      <MenuModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-12 text-center sm:mb-16">
          <p className="mb-4 text-[11px] font-light uppercase tracking-[0.42em] text-[#D4AF37]">
            {t('menu.eyebrow')}
          </p>
          <h2 className="font-serif text-4xl font-semibold tracking-[0.08em] text-white sm:text-5xl lg:text-6xl">
            {t('menu.title')}
          </h2>
          <span
            className="mx-auto mt-6 block h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
            aria-hidden
          />
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
            {t('menu.subtitle')}
          </p>
          {!loading && items.length > 0 ? (
            <p className="mt-4 font-serif text-sm tracking-[0.2em] text-[#E8C96A]/80">
              {t('menu.courseCount').replace('{count}', String(items.length))}
            </p>
          ) : null}
        </header>

        <div className="mb-10 rounded-sm border border-white/[0.06] bg-black/30 px-4 py-5 backdrop-blur-[2px] sm:px-6">
          <div className="relative mb-5">
            <Search
              className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D4AF37]/70"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('menu.searchPlaceholder')}
              className="w-full border-0 border-b border-white/15 bg-transparent py-3 pl-8 pr-2 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#D4AF37]/50"
              aria-label={t('menu.searchPlaceholder')}
            />
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div
              className="flex gap-1 overflow-x-auto pb-1 no-scrollbar"
              role="tablist"
              aria-label={t('menu.categoriesLabel')}
            >
              {CATEGORY_KEYS.map((key) => {
                const active = category === key;
                const count = counts[key] ?? 0;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(key)}
                    className={`relative inline-flex min-h-11 shrink-0 flex-col items-start justify-center px-3.5 text-left transition-colors duration-300 ${
                      active ? 'text-[#F3E4A8]' : 'text-white/50 hover:text-white/85'
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-[0.2em]">
                      {t(`menu.categories.${key}`)}
                    </span>
                    <span className="menu-index mt-0.5 text-[10px] text-[#D4AF37]/70">
                      {String(count).padStart(2, '0')}
                    </span>
                    <span
                      className={`absolute inset-x-3 bottom-0 h-px origin-left bg-[#D4AF37] transition-transform duration-300 ${
                        active ? 'scale-x-100' : 'scale-x-0'
                      }`}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                {t('menu.dietary')}
              </span>
              {DIETARY_TAGS.map((tag) => {
                const active = dietaryFilters.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleDietary(tag)}
                    className={`inline-flex min-h-11 items-center rounded-full border px-3.5 text-[10px] font-medium uppercase tracking-[0.14em] transition-all duration-300 ${
                      active
                        ? 'border-[#D4AF37]/60 bg-[#D4AF37]/15 text-[#E8D48B]'
                        : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white/80'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2" aria-busy="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[7.5rem] animate-pulse rounded-sm border border-white/[0.05] bg-white/[0.03]"
              />
            ))}
          </div>
        ) : error ? (
          <p className="py-16 text-center text-sm text-red-400/90">{error}</p>
        ) : filteredItems.length === 0 ? (
          <p className="py-16 text-center text-sm text-white/45">{t('menu.empty')}</p>
        ) : (
          <>
            {featured ? (
              <FeaturedDish item={featured} onSelect={setSelectedItem} />
            ) : null}

            <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-white/35">
              {t('menu.indexHint')}
            </p>

            <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
              {listItems.map((item, index) => (
                <li key={item.id} className="list-none">
                  <MenuCard
                    item={item}
                    index={index}
                    onSelect={setSelectedItem}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
};

export default MenuSection;

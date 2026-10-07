'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase/client';
import type { MenuItem } from '@/types/menu';
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

const gridMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
};

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
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
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
      className="relative bg-[#0A0A0A] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

      <MenuModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center sm:mb-14">
          <p className="mb-3 text-xs font-light uppercase tracking-[0.35em] text-[#D4AF37]">
            {t('menu.eyebrow')}
          </p>
          <h2 className="text-3xl font-bold tracking-[0.12em] text-white sm:text-4xl lg:text-5xl">
            {t('menu.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/50 sm:text-base">
            {t('menu.subtitle')}
          </p>
        </header>

        <div className="mb-8 flex flex-col gap-6 lg:mb-10">
          <div className="relative max-w-md">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('menu.searchPlaceholder')}
              className="w-full rounded-sm border border-white/10 bg-[#121212] py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#D4AF37]/40 focus:ring-1 focus:ring-[#D4AF37]/20"
              aria-label={t('menu.searchPlaceholder')}
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label={t('menu.categoriesLabel')}
            >
              {CATEGORY_KEYS.map((key) => {
                const active = category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(key)}
                    className={`rounded-sm border px-4 py-2 text-xs uppercase tracking-[0.15em] transition-all duration-300 ${
                      active
                        ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#E8C96A] shadow-[0_0_20px_rgba(212,175,55,0.12)]'
                        : 'border-white/10 bg-transparent text-white/60 hover:border-white/20 hover:text-white/90'
                    }`}
                  >
                    {t(`menu.categories.${key}`)}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
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
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] transition-all duration-300 ${
                      active
                        ? 'border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#E8D48B]'
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
          <p className="py-16 text-center text-sm tracking-widest text-white/40 uppercase">
            {t('menu.loading')}
          </p>
        ) : error ? (
          <p className="py-16 text-center text-sm text-red-400/90">{error}</p>
        ) : filteredItems.length === 0 ? (
          <p className="py-16 text-center text-sm text-white/45">
            {t('menu.empty')}
          </p>
        ) : (
          <LayoutGroup>
            <motion.ul
              layout
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    {...gridMotion}
                    className="list-none"
                  >
                    <MenuCard item={item} onSelect={setSelectedItem} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </LayoutGroup>
        )}
      </div>
    </section>
  );
};

export default MenuSection;

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { MenuItem } from '@/types/menu';

interface MenuItemsState {
  items: MenuItem[];
  loading: boolean;
  error: string | null;
}

const isDuplicate = (item: MenuItem, index: number, all: MenuItem[]): boolean =>
  index !==
  all.findIndex(
    (other) =>
      other.name_uz === item.name_uz &&
      other.name_en === item.name_en &&
      other.name_ru === item.name_ru &&
      other.price === item.price,
  );

/** Loads the menu once and drops accidental duplicate rows. */
export const useMenuItems = (): MenuItemsState => {
  const [state, setState] = useState<MenuItemsState>({
    items: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category')
        .order('price', { ascending: true });

      if (cancelled) return;

      if (error) {
        setState({ items: [], loading: false, error: error.message });
        return;
      }

      const items = (data as MenuItem[]).filter(
        (item, index, all) => !isDuplicate(item, index, all),
      );
      setState({ items, loading: false, error: null });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};

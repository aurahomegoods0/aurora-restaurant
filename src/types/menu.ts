/** Matches `public.menu_items` in Supabase */
export type MenuItemCategory =
  | 'starters'
  | 'mains'
  | 'steaks'
  | 'desserts'
  | 'drinks';

export interface MenuItem {
  id: string;
  name_uz: string;
  name_en: string;
  name_ru: string;
  description_uz: string | null;
  description_en: string | null;
  description_ru: string | null;
  price: number;
  category: MenuItemCategory;
  image_url: string;
  tags: string[] | null;
  ingredients_uz: string[] | null;
  ingredients_en: string[] | null;
  ingredients_ru: string[] | null;
  created_at: string;
}

/** Row shape for inserts (omit server-generated fields) */
export type MenuItemInsert = Omit<MenuItem, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

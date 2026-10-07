-- AURORA restaurant: menu_items table, RLS (public read)

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name_uz text not null,
  name_en text not null,
  name_ru text not null,
  description_uz text,
  description_en text,
  description_ru text,
  price numeric(10, 2) not null check (price >= 0),
  category text not null check (
    category in ('starters', 'mains', 'steaks', 'desserts', 'drinks')
  ),
  image_url text not null,
  tags text[] default '{}',
  ingredients_uz text[] default '{}',
  ingredients_en text[] default '{}',
  ingredients_ru text[] default '{}',
  created_at timestamptz not null default now()
);

create index if not exists menu_items_category_idx on public.menu_items (category);

comment on table public.menu_items is 'AURORA fine-dining menu (multilingual)';

alter table public.menu_items enable row level security;

create policy "menu_items_public_read"
  on public.menu_items
  for select
  to anon, authenticated
  using (true);

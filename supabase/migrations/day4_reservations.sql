-- AURORA restaurant, Day 4: table reservations
-- tables + reservations, double-booking protection, RLS, Realtime, seed data.
-- Safe to re-run (idempotent).

-- ---------------------------------------------------------------------------
-- 1. tables: physical restaurant tables
-- ---------------------------------------------------------------------------
create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  table_number integer not null unique check (table_number > 0),
  capacity integer not null check (capacity between 1 and 20),
  zone text not null check (zone in ('window', 'vip', 'hall')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.tables is 'AURORA dining room tables (floor map)';
comment on column public.tables.zone is 'window = by the window, vip = VIP room, hall = main hall';

create index if not exists tables_zone_idx on public.tables (zone);

-- ---------------------------------------------------------------------------
-- 2. reservations
-- ---------------------------------------------------------------------------
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.tables (id) on delete cascade,
  guest_name text not null check (char_length(btrim(guest_name)) between 2 and 100),
  guest_email text not null check (
    char_length(guest_email) <= 254
    and guest_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  guest_phone text not null check (char_length(btrim(guest_phone)) between 7 and 20),
  party_size integer not null check (party_size between 1 and 12),
  reservation_date date not null,
  reservation_time time not null check (
    reservation_time between time '10:00' and time '22:00'
  ),
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'cancelled', 'completed')
  ),
  created_at timestamptz not null default now()
);

comment on table public.reservations is 'AURORA guest table reservations';

-- Double-booking guard. A violation raises SQLSTATE 23505 (unique_violation),
-- which the server action turns into a friendly message. Cancelled bookings
-- are excluded so a cancelled slot can be booked again.
create unique index if not exists reservations_table_slot_unique
  on public.reservations (table_id, reservation_date, reservation_time)
  where status <> 'cancelled';

create index if not exists reservations_date_idx
  on public.reservations (reservation_date);

-- ---------------------------------------------------------------------------
-- 3. Privileges + Row Level Security
-- ---------------------------------------------------------------------------
alter table public.tables enable row level security;
alter table public.reservations enable row level security;

-- tables: public read-only, active tables only
grant select on public.tables to anon, authenticated;

drop policy if exists "tables_public_read" on public.tables;
create policy "tables_public_read"
  on public.tables
  for select
  to anon, authenticated
  using (is_active);

-- reservations: guests can create a booking and see *which slots are taken*,
-- but never other guests' personal data. Column-level privileges hide name,
-- email and phone from the public API (and from Realtime payloads).
revoke all on public.reservations from anon, authenticated;

grant insert on public.reservations to anon, authenticated;
grant select (id, table_id, reservation_date, reservation_time, status)
  on public.reservations to anon, authenticated;

-- Needed for the floor map: Realtime must see every status change (including
-- a move to 'cancelled') for the row to be delivered, so the policy is open;
-- the column grants above are what protect personal data.
drop policy if exists "reservations_public_read_slots" on public.reservations;
create policy "reservations_public_read_slots"
  on public.reservations
  for select
  to anon, authenticated
  using (true);

-- The anon key is public, so the database re-checks what the app validates:
-- new bookings start as 'pending', are not in the past (Tashkent time) and
-- target an active table that can seat the party.
drop policy if exists "reservations_public_insert" on public.reservations;
create policy "reservations_public_insert"
  on public.reservations
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and reservation_date >= (now() at time zone 'Asia/Tashkent')::date
    and exists (
      select 1
      from public.tables t
      where t.id = table_id
        and t.is_active
        and t.capacity >= party_size
    )
  );

-- No update/delete policies: only the service role / dashboard can change or
-- cancel bookings.

-- ---------------------------------------------------------------------------
-- 4. Realtime
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reservations'
  ) then
    alter publication supabase_realtime add table public.reservations;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 5. Seed data: 8 tables (3 window, 2 VIP, 3 main hall)
-- ---------------------------------------------------------------------------
insert into public.tables (table_number, capacity, zone) values
  (1, 2, 'window'),
  (2, 2, 'window'),
  (3, 4, 'window'),
  (4, 6, 'vip'),
  (5, 8, 'vip'),
  (6, 4, 'hall'),
  (7, 4, 'hall'),
  (8, 6, 'hall')
on conflict (table_number) do nothing;

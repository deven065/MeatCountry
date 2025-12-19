-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null
);

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text not null default '',
  images jsonb not null default '[]',
  price_inr integer not null check (price_inr >= 0),
  unit text not null default '500g',
  inventory integer not null default 0,
  is_featured boolean not null default false,
  rating real not null default 4.5,
  category_id uuid references public.categories(id) on delete set null
);

-- Addresses table for delivery locations
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  pincode text not null,
  landmark text,
  address_type text not null default 'home' check (address_type in ('home', 'work', 'other')),
  is_default boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.addresses enable row level security;

-- Policies: allow read for anon
drop policy if exists "Allow read categories" on public.categories;
create policy "Allow read categories" on public.categories for select using (true);

drop policy if exists "Allow read products" on public.products;
create policy "Allow read products" on public.products for select using (true);

-- Address policies: users can only manage their own addresses
drop policy if exists "Users can view own addresses" on public.addresses;
create policy "Users can view own addresses" on public.addresses for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own addresses" on public.addresses;
create policy "Users can insert own addresses" on public.addresses for insert with check (true);

drop policy if exists "Users can update own addresses" on public.addresses;
create policy "Users can update own addresses" on public.addresses for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own addresses" on public.addresses;
create policy "Users can delete own addresses" on public.addresses for delete using (auth.uid() = user_id);

-- Helpful indexes
create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_featured_idx on public.products(is_featured);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists addresses_user_idx on public.addresses(user_id);
create index if not exists addresses_default_idx on public.addresses(is_default);

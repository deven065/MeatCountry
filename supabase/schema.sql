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

-- Enable RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;

-- Policies: allow read for anon
create policy if not exists "Allow read categories" on public.categories for select using (true);
create policy if not exists "Allow read products" on public.products for select using (true);

-- Helpful indexes
create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_featured_idx on public.products(is_featured);
create index if not exists products_category_idx on public.products(category_id);

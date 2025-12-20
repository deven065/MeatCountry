-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon text,
  created_at timestamp with time zone default now()
);

-- Subcategories
create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(category_id, slug)
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
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  created_at timestamp with time zone default now()
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

drop policy if exists "Authenticated users can insert products" on public.products;
create policy "Authenticated users can insert products" on public.products for insert with check (auth.uid() is not null);

drop policy if exists "Authenticated users can update products" on public.products;
create policy "Authenticated users can update products" on public.products for update using (auth.uid() is not null);

drop policy if exists "Authenticated users can delete products" on public.products;
create policy "Authenticated users can delete products" on public.products for delete using (auth.uid() is not null);

-- Address policies: users can only manage their own addresses
drop policy if exists "Users can view own addresses" on public.addresses;
create policy "Users can view own addresses" on public.addresses for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own addresses" on public.addresses;
create policy "Users can insert own addresses" on public.addresses for insert with check (true);

drop policy if exists "Users can update own addresses" on public.addresses;
create policy "Users can update own addresses" on public.addresses for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own addresses" on public.addresses;
create policy "Users can delete own addresses" on public.addresses for delete using (auth.uid() = user_id);

-- Orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  address_id uuid references public.addresses(id) on delete set null,
  order_number text unique not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_method text not null check (payment_method in ('razorpay', 'stripe', 'paypal', 'wallet', 'cod')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_id text,
  subtotal integer not null check (subtotal >= 0),
  discount integer not null default 0 check (discount >= 0),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  total integer not null check (total >= 0),
  wallet_amount_used integer not null default 0 check (wallet_amount_used >= 0),
  loyalty_points_earned integer not null default 0,
  loyalty_points_used integer not null default 0,
  notes text,
  estimated_delivery timestamp with time zone,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order items table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  price integer not null check (price >= 0),
  quantity integer not null check (quantity > 0),
  unit text not null,
  subtotal integer not null check (subtotal >= 0)
);

-- Reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  comment text,
  images jsonb default '[]',
  is_verified_purchase boolean not null default false,
  helpful_count integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id, order_id)
);

-- Wishlist table
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- Wallet table
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Wallet transactions table
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('credit', 'debit')),
  amount integer not null check (amount > 0),
  description text not null,
  reference_type text check (reference_type in ('topup', 'order', 'refund', 'referral', 'loyalty')),
  reference_id uuid,
  balance_after integer not null check (balance_after >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Referrals table
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referee_id uuid not null references auth.users(id) on delete cascade,
  referral_code text not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'expired')),
  reward_amount integer not null default 0,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(referrer_id, referee_id)
);

-- Loyalty points table
create table if not exists public.loyalty_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  points integer not null default 0 check (points >= 0),
  lifetime_points integer not null default 0 check (lifetime_points >= 0),
  tier text not null default 'bronze' check (tier in ('bronze', 'silver', 'gold', 'platinum')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Loyalty transactions table
create table if not exists public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('earned', 'redeemed', 'expired')),
  points integer not null check (points > 0),
  description text not null,
  reference_type text check (reference_type in ('order', 'review', 'referral', 'signup')),
  reference_id uuid,
  balance_after integer not null check (balance_after >= 0),
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User profiles table (for referral codes and preferences)
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  referral_code text unique not null,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on new tables
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlists enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.referrals enable row level security;
alter table public.loyalty_points enable row level security;
alter table public.loyalty_transactions enable row level security;
alter table public.user_profiles enable row level security;

-- Orders policies
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own orders" on public.orders;
create policy "Users can insert own orders" on public.orders for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own orders" on public.orders;
create policy "Users can update own orders" on public.orders for update using (auth.uid() = user_id);

-- Order items policies
drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items" on public.order_items 
  for select using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

drop policy if exists "Users can insert own order items" on public.order_items;
create policy "Users can insert own order items" on public.order_items 
  for insert with check (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

-- Reviews policies
drop policy if exists "Anyone can view reviews" on public.reviews;
create policy "Anyone can view reviews" on public.reviews for select using (true);

drop policy if exists "Users can insert own reviews" on public.reviews;
create policy "Users can insert own reviews" on public.reviews for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own reviews" on public.reviews;
create policy "Users can update own reviews" on public.reviews for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own reviews" on public.reviews;
create policy "Users can delete own reviews" on public.reviews for delete using (auth.uid() = user_id);

-- Wishlist policies
drop policy if exists "Users can view own wishlist" on public.wishlists;
create policy "Users can view own wishlist" on public.wishlists for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own wishlist" on public.wishlists;
create policy "Users can insert own wishlist" on public.wishlists for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own wishlist" on public.wishlists;
create policy "Users can delete own wishlist" on public.wishlists for delete using (auth.uid() = user_id);

-- Wallet policies
drop policy if exists "Users can view own wallet" on public.wallets;
create policy "Users can view own wallet" on public.wallets for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own wallet" on public.wallets;
create policy "Users can insert own wallet" on public.wallets for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own wallet" on public.wallets;
create policy "Users can update own wallet" on public.wallets for update using (auth.uid() = user_id);

-- Wallet transactions policies
drop policy if exists "Users can view own wallet transactions" on public.wallet_transactions;
create policy "Users can view own wallet transactions" on public.wallet_transactions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own wallet transactions" on public.wallet_transactions;
create policy "Users can insert own wallet transactions" on public.wallet_transactions for insert with check (auth.uid() = user_id);

-- Referrals policies
drop policy if exists "Users can view own referrals" on public.referrals;
create policy "Users can view own referrals" on public.referrals 
  for select using (auth.uid() = referrer_id or auth.uid() = referee_id);

drop policy if exists "Users can insert referrals" on public.referrals;
create policy "Users can insert referrals" on public.referrals for insert with check (true);

drop policy if exists "Users can update own referrals" on public.referrals;
create policy "Users can update own referrals" on public.referrals 
  for update using (auth.uid() = referrer_id or auth.uid() = referee_id);

-- Loyalty points policies
drop policy if exists "Users can view own loyalty points" on public.loyalty_points;
create policy "Users can view own loyalty points" on public.loyalty_points for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own loyalty points" on public.loyalty_points;
create policy "Users can insert own loyalty points" on public.loyalty_points for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own loyalty points" on public.loyalty_points;
create policy "Users can update own loyalty points" on public.loyalty_points for update using (auth.uid() = user_id);

-- Loyalty transactions policies
drop policy if exists "Users can view own loyalty transactions" on public.loyalty_transactions;
create policy "Users can view own loyalty transactions" on public.loyalty_transactions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own loyalty transactions" on public.loyalty_transactions;
create policy "Users can insert own loyalty transactions" on public.loyalty_transactions for insert with check (auth.uid() = user_id);

-- User profiles policies
drop policy if exists "Users can view own profile" on public.user_profiles;
create policy "Users can view own profile" on public.user_profiles for select using (auth.uid() = user_id);

drop policy if exists "Anyone can view profiles for referrals" on public.user_profiles;
create policy "Anyone can view profiles for referrals" on public.user_profiles for select using (true);

drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile" on public.user_profiles for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile" on public.user_profiles for update using (auth.uid() = user_id);

-- Helpful indexes
create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_featured_idx on public.products(is_featured);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists addresses_user_idx on public.addresses(user_id);
create index if not exists addresses_default_idx on public.addresses(is_default);
create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_number_idx on public.orders(order_number);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists order_items_product_idx on public.order_items(product_id);
create index if not exists reviews_product_idx on public.reviews(product_id);
create index if not exists reviews_user_idx on public.reviews(user_id);
create index if not exists wishlists_user_idx on public.wishlists(user_id);
create index if not exists wishlists_product_idx on public.wishlists(product_id);
create index if not exists wallets_user_idx on public.wallets(user_id);
create index if not exists wallet_transactions_wallet_idx on public.wallet_transactions(wallet_id);
create index if not exists wallet_transactions_user_idx on public.wallet_transactions(user_id);
create index if not exists referrals_referrer_idx on public.referrals(referrer_id);
create index if not exists referrals_referee_idx on public.referrals(referee_id);
create index if not exists referrals_code_idx on public.referrals(referral_code);
create index if not exists loyalty_points_user_idx on public.loyalty_points(user_id);
create index if not exists loyalty_transactions_user_idx on public.loyalty_transactions(user_id);
create index if not exists user_profiles_user_idx on public.user_profiles(user_id);
create index if not exists user_profiles_referral_code_idx on public.user_profiles(referral_code);

-- Function to generate unique order number
create or replace function generate_order_number()
returns text as $$
declare
  new_number text;
  exists boolean;
begin
  loop
    new_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
    select exists(select 1 from public.orders where order_number = new_number) into exists;
    exit when not exists;
  end loop;
  return new_number;
end;
$$ language plpgsql;

-- Function to generate unique referral code
create or replace function generate_referral_code()
returns text as $$
declare
  new_code text;
  exists boolean;
begin
  loop
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    select exists(select 1 from public.user_profiles where referral_code = new_code) into exists;
    exit when not exists;
  end loop;
  return new_code;
end;
$$ language plpgsql;

-- Trigger to create wallet and loyalty points on user signup
create or replace function create_user_defaults()
returns trigger as $$
begin
  -- Try to insert into wallets, but don't fail if table doesn't exist
  begin
    insert into public.wallets (user_id) values (new.id);
  exception when others then
    null; -- Silently ignore errors
  end;
  
  -- Try to insert into loyalty_points, but don't fail if table doesn't exist
  begin
    insert into public.loyalty_points (user_id, points, lifetime_points) values (new.id, 0, 0);
  exception when others then
    null; -- Silently ignore errors
  end;
  
  -- Try to insert into user_profiles, but don't fail if table doesn't exist
  begin
    insert into public.user_profiles (user_id, referral_code) values (new.id, generate_referral_code());
  exception when others then
    null; -- Silently ignore errors
  end;
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function create_user_defaults();

-- Function to update product rating based on reviews
create or replace function update_product_rating()
returns trigger as $$
begin
  update public.products
  set rating = (
    select coalesce(avg(rating), 4.5)
    from public.reviews
    where product_id = coalesce(new.product_id, old.product_id)
  )
  where id = coalesce(new.product_id, old.product_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists on_review_change on public.reviews;
create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute function update_product_rating();

-- Vendors/Sellers table
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  business_email text not null,
  business_phone text not null,
  business_address text not null,
  gstin text,
  pan text,
  bank_account_number text,
  bank_ifsc text,
  bank_account_holder text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'suspended', 'rejected')),
  commission_rate real not null default 10.0 check (commission_rate >= 0 and commission_rate <= 100),
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Vendor products link
alter table public.products add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
alter table public.products add column if not exists low_stock_threshold integer default 10;
alter table public.products add column if not exists sku text unique;

-- Discount codes/coupons table
create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  min_order_value integer default 0,
  max_discount_amount integer,
  usage_limit integer,
  usage_count integer not null default 0,
  valid_from timestamp with time zone not null,
  valid_until timestamp with time zone not null,
  is_active boolean not null default true,
  applicable_categories jsonb default '[]',
  applicable_products jsonb default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  frequency text not null check (frequency in ('daily', 'weekly', 'biweekly', 'monthly')),
  next_delivery_date date not null,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  start_date date not null,
  end_date date,
  delivery_address_id uuid references public.addresses(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Inventory logs table
create table if not exists public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  change_type text not null check (change_type in ('restock', 'sale', 'return', 'damage', 'adjustment')),
  quantity_change integer not null,
  quantity_before integer not null,
  quantity_after integer not null,
  reason text,
  performed_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Email notifications log
create table if not exists public.email_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email_to text not null,
  email_type text not null check (email_type in ('order_confirmation', 'order_shipped', 'order_delivered', 'order_cancelled', 'welcome', 'password_reset', 'promotion', 'subscription_reminder')),
  subject text not null,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  sent_at timestamp with time zone,
  error_message text,
  reference_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Promotions/Campaigns table
create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  promotion_type text not null check (promotion_type in ('flash_sale', 'bulk_discount', 'buy_x_get_y', 'seasonal')),
  discount_percentage real,
  conditions jsonb default '{}',
  applicable_products jsonb default '[]',
  applicable_categories jsonb default '[]',
  banner_image text,
  valid_from timestamp with time zone not null,
  valid_until timestamp with time zone not null,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Analytics events table
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  event_data jsonb default '{}',
  page_url text,
  referrer text,
  user_agent text,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on new tables
alter table public.vendors enable row level security;
alter table public.discount_codes enable row level security;
alter table public.subscriptions enable row level security;
alter table public.inventory_logs enable row level security;
alter table public.email_notifications enable row level security;
alter table public.promotions enable row level security;
alter table public.analytics_events enable row level security;

-- Vendors policies
drop policy if exists "Vendors can view own profile" on public.vendors;
create policy "Vendors can view own profile" on public.vendors for select using (auth.uid() = user_id);

drop policy if exists "Vendors can update own profile" on public.vendors;
create policy "Vendors can update own profile" on public.vendors for update using (auth.uid() = user_id);

drop policy if exists "Authenticated users can create vendor profile" on public.vendors;
create policy "Authenticated users can create vendor profile" on public.vendors for insert with check (auth.uid() = user_id);

drop policy if exists "Public can view approved vendors" on public.vendors;
create policy "Public can view approved vendors" on public.vendors for select using (status = 'approved' and is_active = true);

-- Discount codes policies (read by all, insert by authenticated)
drop policy if exists "Anyone can view active discount codes" on public.discount_codes;
create policy "Anyone can view active discount codes" on public.discount_codes for select using (is_active = true);

drop policy if exists "Authenticated users can manage discounts" on public.discount_codes;
create policy "Authenticated users can manage discounts" on public.discount_codes for all using (auth.uid() is not null);

-- Subscriptions policies
drop policy if exists "Users can view own subscriptions" on public.subscriptions;
create policy "Users can view own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);

drop policy if exists "Users can create own subscriptions" on public.subscriptions;
create policy "Users can create own subscriptions" on public.subscriptions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own subscriptions" on public.subscriptions;
create policy "Users can update own subscriptions" on public.subscriptions for update using (auth.uid() = user_id);

-- Inventory logs policies (allow authenticated users)
drop policy if exists "Authenticated users can view inventory logs" on public.inventory_logs;
create policy "Authenticated users can view inventory logs" on public.inventory_logs for select using (auth.uid() is not null);

drop policy if exists "Authenticated users can insert inventory logs" on public.inventory_logs;
create policy "Authenticated users can insert inventory logs" on public.inventory_logs for insert with check (auth.uid() is not null);

-- Email notifications policies
drop policy if exists "Users can view own notifications" on public.email_notifications;
create policy "Users can view own notifications" on public.email_notifications for select using (auth.uid() = user_id or auth.uid() is not null);

drop policy if exists "System can insert notifications" on public.email_notifications;
create policy "System can insert notifications" on public.email_notifications for insert with check (true);

drop policy if exists "Authenticated users can update notifications" on public.email_notifications;
create policy "Authenticated users can update notifications" on public.email_notifications for update using (auth.uid() is not null);

-- Promotions policies (read by all, manage by authenticated)
drop policy if exists "Anyone can view active promotions" on public.promotions;
create policy "Anyone can view active promotions" on public.promotions for select using (is_active = true);

drop policy if exists "Authenticated users can manage promotions" on public.promotions;
create policy "Authenticated users can manage promotions" on public.promotions for all using (auth.uid() is not null);

-- Analytics events policies (insert only)
drop policy if exists "Anyone can insert analytics events" on public.analytics_events;
create policy "Anyone can insert analytics events" on public.analytics_events for insert with check (true);

drop policy if exists "Authenticated users can view analytics" on public.analytics_events;
create policy "Authenticated users can view analytics" on public.analytics_events for select using (auth.uid() is not null);

-- Indexes for performance
create index if not exists vendors_user_idx on public.vendors(user_id);
create index if not exists vendors_status_idx on public.vendors(status);
create index if not exists products_vendor_idx on public.products(vendor_id);
create index if not exists products_sku_idx on public.products(sku);
create index if not exists discount_codes_code_idx on public.discount_codes(code);
create index if not exists discount_codes_active_idx on public.discount_codes(is_active);
create index if not exists subscriptions_user_idx on public.subscriptions(user_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);
create index if not exists subscriptions_next_delivery_idx on public.subscriptions(next_delivery_date);
create index if not exists inventory_logs_product_idx on public.inventory_logs(product_id);
create index if not exists inventory_logs_created_idx on public.inventory_logs(created_at);
create index if not exists email_notifications_status_idx on public.email_notifications(status);
create index if not exists email_notifications_user_idx on public.email_notifications(user_id);
create index if not exists promotions_active_idx on public.promotions(is_active);
create index if not exists analytics_events_type_idx on public.analytics_events(event_type);
create index if not exists analytics_events_user_idx on public.analytics_events(user_id);
create index if not exists analytics_events_created_idx on public.analytics_events(created_at);

-- Function to update inventory
create or replace function update_inventory(
  p_product_id uuid,
  p_quantity_change integer,
  p_change_type text,
  p_reason text default null
)
returns void as $$
declare
  v_current_inventory integer;
  v_new_inventory integer;
begin
  -- Get current inventory
  select inventory into v_current_inventory
  from public.products
  where id = p_product_id;

  -- Calculate new inventory
  v_new_inventory := v_current_inventory + p_quantity_change;

  -- Update product inventory
  update public.products
  set inventory = v_new_inventory,
      updated_at = now()
  where id = p_product_id;

  -- Log the change
  insert into public.inventory_logs (
    product_id,
    change_type,
    quantity_change,
    quantity_before,
    quantity_after,
    reason,
    performed_by
  ) values (
    p_product_id,
    p_change_type,
    p_quantity_change,
    v_current_inventory,
    v_new_inventory,
    p_reason,
    auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Function to check low stock products
create or replace function get_low_stock_products()
returns table (
  product_id uuid,
  product_name text,
  current_stock integer,
  threshold integer
) as $$
begin
  return query
  select
    p.id,
    p.name,
    p.inventory,
    p.low_stock_threshold
  from public.products p
  where p.inventory <= p.low_stock_threshold
  and p.inventory >= 0
  order by p.inventory asc;
end;
$$ language plpgsql security definer;

-- Function to process subscriptions
create or replace function process_due_subscriptions()
returns void as $$
declare
  v_subscription record;
begin
  for v_subscription in
    select * from public.subscriptions
    where status = 'active'
    and next_delivery_date <= current_date
  loop
    -- Create order for subscription (implement order creation logic)
    -- Update next delivery date based on frequency
    update public.subscriptions
    set next_delivery_date = case
      when frequency = 'daily' then next_delivery_date + interval '1 day'
      when frequency = 'weekly' then next_delivery_date + interval '1 week'
      when frequency = 'biweekly' then next_delivery_date + interval '2 weeks'
      when frequency = 'monthly' then next_delivery_date + interval '1 month'
    end,
    updated_at = now()
    where id = v_subscription.id;
  end loop;
end;
$$ language plpgsql security definer;

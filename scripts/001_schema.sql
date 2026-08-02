-- ============================================================
-- Dar Al-Hayaa — Schema Supabase
-- Remplace db.json (lowdb) + server.cjs (Express)
-- ============================================================

-- ── PROFILES (etend auth.users) ──────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  first_name    text,
  last_name     text,
  email         text unique,
  phone         text,
  role          text not null default 'client'
                check (role in ('client', 'manager', 'admin')),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  last_login_at timestamptz
);

-- ── CATEGORIES ───────────────────────────────────────────────
create table if not exists public.categories (
  id            text primary key,
  name          text not null,
  name_ar       text,
  icon          text,
  description   text,
  count         integer not null default 0,
  color         text,
  image         text,
  subcategories jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now()
);

-- ── PRODUCTS ─────────────────────────────────────────────────
create table if not exists public.products (
  id             text primary key,
  name           text not null,
  category       text references public.categories(id) on delete set null,
  subcategory    text,
  price          numeric(12,2) not null default 0,
  original_price numeric(12,2),
  discount       integer not null default 0,
  rating         numeric(3,2) not null default 0,
  reviews_count  integer not null default 0,
  stock          integer not null default 0,
  is_new         boolean not null default false,
  is_bestseller  boolean not null default false,
  featured       boolean not null default false,
  colors         jsonb not null default '[]'::jsonb,
  sizes          jsonb not null default '[]'::jsonb,
  images         jsonb not null default '[]'::jsonb,
  tags           jsonb not null default '[]'::jsonb,
  description    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists products_category_idx  on public.products(category);
create index if not exists products_featured_idx  on public.products(featured);

-- ── COUPONS ──────────────────────────────────────────────────
create table if not exists public.coupons (
  code         text primary key,
  discount     integer not null default 0,
  min_purchase numeric(12,2) not null default 0,
  max_uses     integer,
  uses_count   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ── ORDERS ───────────────────────────────────────────────────
create table if not exists public.orders (
  id               text primary key,
  user_id          uuid references public.profiles(id) on delete set null,
  status           text not null default 'pending',
  subtotal         numeric(12,2) not null default 0,
  shipping         numeric(12,2) not null default 0,
  discount         numeric(12,2) not null default 0,
  total            numeric(12,2) not null default 0,
  coupon_code      text,
  payment_method   text,
  shipping_address jsonb,
  phone            text,
  email            text,
  tracking_number  text unique,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists orders_user_idx     on public.orders(user_id);
create index if not exists orders_tracking_idx on public.orders(tracking_number);

-- ── ORDER ITEMS ──────────────────────────────────────────────
create table if not exists public.order_items (
  id         text primary key,
  order_id   text not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  quantity   integer not null default 1,
  price      numeric(12,2) not null default 0,
  color      text,
  size       text,
  created_at timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ── ORDER TRACKING ───────────────────────────────────────────
create table if not exists public.order_tracking (
  id         text primary key,
  order_id   text not null references public.orders(id) on delete cascade,
  step_label text not null,
  is_done    boolean not null default false,
  step_date  timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists order_tracking_order_idx on public.order_tracking(order_id);

-- ── PAYMENTS ─────────────────────────────────────────────────
create table if not exists public.payments (
  id             text primary key,
  order_id       text references public.orders(id) on delete cascade,
  method         text,
  amount         numeric(12,2) not null default 0,
  status         text not null default 'pending',
  transaction_id text,
  phone          text,
  created_at     timestamptz not null default now()
);
create index if not exists payments_order_idx on public.payments(order_id);

-- ── FAVORITES ────────────────────────────────────────────────
create table if not exists public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index if not exists favorites_user_idx on public.favorites(user_id);

-- ── REVIEWS ──────────────────────────────────────────────────
create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete set null,
  product_id text not null references public.products(id) on delete cascade,
  rating     integer not null check (rating between 1 and 5),
  comment    text,
  verified   boolean not null default false,
  status     text not null default 'pending'
             check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create index if not exists reviews_product_idx on public.reviews(product_id);
create index if not exists reviews_user_idx    on public.reviews(user_id);

-- ── ADDRESSES ────────────────────────────────────────────────
create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null default 'delivery',
  first_name  text,
  last_name   text,
  address     text,
  postal_code text,
  city        text,
  country     text default 'Côte d''Ivoire',
  phone       text,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists addresses_user_idx on public.addresses(user_id);

-- ── NOTIFICATIONS ────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text,
  title      text,
  message    text,
  link       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id);

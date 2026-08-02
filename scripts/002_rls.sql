-- ============================================================
-- Dar Al-Hayaa — Securite : trigger de profil + RLS
-- ============================================================

-- ── Helper : role de l'utilisateur courant ───────────────────
-- SECURITY DEFINER pour eviter la recursion infinie des policies
-- lorsqu'une policy sur "profiles" doit lire "profiles".
create or replace function public.current_role_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'anon');
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_name() in ('admin', 'manager');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_name() = 'admin';
$$;

-- ── Creation automatique du profil a l'inscription ───────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Activation de RLS ────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.coupons        enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.order_tracking enable row level security;
alter table public.payments       enable row level security;
alter table public.favorites      enable row level security;
alter table public.reviews        enable row level security;
alter table public.addresses      enable row level security;
alter table public.notifications  enable row level security;

-- ── PROFILES ─────────────────────────────────────────────────
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid() or public.is_staff());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (id = auth.uid());

-- L'admin peut modifier / supprimer n'importe quel profil
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_admin_delete on public.profiles
  for delete using (public.is_admin());

-- ── CATALOGUE (lecture publique, ecriture staff) ─────────────
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select using (true);

drop policy if exists categories_staff_write on public.categories;
create policy categories_staff_write on public.categories
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select using (true);

drop policy if exists products_staff_write on public.products;
create policy products_staff_write on public.products
  for all using (public.is_staff()) with check (public.is_staff());

-- ── COUPONS ──────────────────────────────────────────────────
-- Lecture des coupons actifs uniquement (pour validation au panier)
drop policy if exists coupons_read_active on public.coupons;
create policy coupons_read_active on public.coupons
  for select using (is_active or public.is_staff());

drop policy if exists coupons_staff_write on public.coupons;
create policy coupons_staff_write on public.coupons
  for all using (public.is_staff()) with check (public.is_staff());

-- ── ORDERS ───────────────────────────────────────────────────
drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
  for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists orders_insert_own on public.orders;
create policy orders_insert_own on public.orders
  for insert with check (user_id = auth.uid() or public.is_staff());

drop policy if exists orders_staff_update on public.orders;
create policy orders_staff_update on public.orders
  for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists orders_staff_delete on public.orders;
create policy orders_staff_delete on public.orders
  for delete using (public.is_staff());

-- ── ORDER ITEMS ──────────────────────────────────────────────
drop policy if exists order_items_select on public.order_items;
create policy order_items_select on public.order_items
  for select using (
    public.is_staff() or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists order_items_insert on public.order_items;
create policy order_items_insert on public.order_items
  for insert with check (
    public.is_staff() or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- ── ORDER TRACKING ───────────────────────────────────────────
drop policy if exists order_tracking_select on public.order_tracking;
create policy order_tracking_select on public.order_tracking
  for select using (
    public.is_staff() or exists (
      select 1 from public.orders o
      where o.id = order_tracking.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists order_tracking_insert on public.order_tracking;
create policy order_tracking_insert on public.order_tracking
  for insert with check (
    public.is_staff() or exists (
      select 1 from public.orders o
      where o.id = order_tracking.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists order_tracking_staff_update on public.order_tracking;
create policy order_tracking_staff_update on public.order_tracking
  for update using (public.is_staff()) with check (public.is_staff());

-- ── PAYMENTS ─────────────────────────────────────────────────
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments
  for select using (
    public.is_staff() or exists (
      select 1 from public.orders o
      where o.id = payments.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists payments_insert on public.payments;
create policy payments_insert on public.payments
  for insert with check (
    public.is_staff() or exists (
      select 1 from public.orders o
      where o.id = payments.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists payments_staff_update on public.payments;
create policy payments_staff_update on public.payments
  for update using (public.is_staff()) with check (public.is_staff());

-- ── FAVORITES (strictement personnel) ────────────────────────
drop policy if exists favorites_own on public.favorites;
create policy favorites_own on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── REVIEWS ──────────────────────────────────────────────────
-- Tout le monde voit les avis approuves ; l'auteur voit les siens.
drop policy if exists reviews_read on public.reviews;
create policy reviews_read on public.reviews
  for select using (
    status = 'approved' or user_id = auth.uid() or public.is_staff()
  );

drop policy if exists reviews_insert_own on public.reviews;
create policy reviews_insert_own on public.reviews
  for insert with check (user_id = auth.uid());

drop policy if exists reviews_update_own on public.reviews;
create policy reviews_update_own on public.reviews
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists reviews_staff_moderate on public.reviews;
create policy reviews_staff_moderate on public.reviews
  for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists reviews_delete on public.reviews;
create policy reviews_delete on public.reviews
  for delete using (user_id = auth.uid() or public.is_staff());

-- ── ADDRESSES (strictement personnel) ────────────────────────
drop policy if exists addresses_own on public.addresses;
create policy addresses_own on public.addresses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── NOTIFICATIONS ────────────────────────────────────────────
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
  for insert with check (user_id = auth.uid() or public.is_staff());

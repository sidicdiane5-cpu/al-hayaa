-- ============================================================
-- Dar Al-Hayaa — Temps reel (Supabase Realtime)
-- Ajoute les tables du dashboard admin a la publication logique.
-- ============================================================

-- La publication `supabase_realtime` existe par defaut sur tout projet
-- Supabase. `add table if not exists` n'existe pas en SQL : on passe par
-- un bloc conditionnel pour rendre le script idempotent.
do $$
declare
  t text;
  tables text[] := array[
    'products',
    'orders',
    'order_items',
    'payments',
    'reviews',
    'profiles'
  ];
begin
  foreach t in array tables loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end
$$;

-- REPLICA IDENTITY FULL : sans cela, les evenements UPDATE/DELETE
-- n'exposent que la cle primaire dans `payload.old`.
alter table public.products  replica identity full;
alter table public.orders    replica identity full;
alter table public.payments  replica identity full;

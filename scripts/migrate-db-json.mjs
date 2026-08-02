// Migre l'integralite de db.json (lowdb) vers Supabase.
// Usage:
//   node --env-file-if-exists=/vercel/share/.env.project scripts/migrate-db-json.mjs
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

if (!url || !serviceKey) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants.')
  process.exit(1)
}

// Le service role contourne RLS : indispensable pour un import.
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const db = JSON.parse(readFileSync('db.json', 'utf8'))
const report = []

const isUuid = (v) =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)

async function upsert(table, rows, conflict = 'id') {
  if (!rows.length) {
    report.push(`${table}: 0 (rien a migrer)`)
    return
  }

  // db.json contient des doublons (ex: produits a007/a008/a009). Postgres
  // refuse un ON CONFLICT qui touche deux fois la meme ligne : on deduplique
  // sur la cle de conflit en gardant la derniere occurrence.
  const keys = conflict.split(',').map((k) => k.trim())
  const hasKeys = keys.every((k) => k in rows[0])
  if (hasKeys) {
    const seen = new Map()
    for (const row of rows) seen.set(keys.map((k) => row[k]).join('|'), row)
    const deduped = [...seen.values()]
    if (deduped.length !== rows.length) {
      report.push(`${table}: ${rows.length - deduped.length} doublon(s) fusionne(s)`)
    }
    rows = deduped
  }

  const { error } = await admin.from(table).upsert(rows, { onConflict: conflict })
  if (error) {
    report.push(`${table}: ECHEC — ${error.message}`)
    throw new Error(`${table}: ${error.message}`)
  }
  report.push(`${table}: ${rows.length} ligne(s)`)
}

// ── 1. Comptes utilisateurs -> Supabase Auth ─────────────────
// Les mots de passe bcrypt de lowdb ne sont pas transferables vers
// Supabase Auth : on cree les comptes avec un mot de passe temporaire.
const TEMP_PASSWORD = process.env.MIGRATION_TEMP_PASSWORD || 'DarAlHayaa#2026'
const userIdMap = new Map()

for (const u of db.users ?? []) {
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: TEMP_PASSWORD,
    email_confirm: true,
    user_metadata: {
      first_name: u.firstName ?? '',
      last_name: u.lastName ?? '',
      phone: u.phone ?? '',
      role: u.role ?? 'client',
    },
  })

  let authId = data?.user?.id

  if (error) {
    // Deja cree lors d'un run precedent : on le retrouve par email.
    const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 })
    authId = list?.users?.find((x) => x.email === u.email)?.id
    if (!authId) {
      report.push(`user ${u.email}: ECHEC — ${error.message}`)
      continue
    }
  }

  userIdMap.set(u.id, authId)

  // Le trigger handle_new_user a cree le profil : on force le role et l'etat.
  const { error: pErr } = await admin
    .from('profiles')
    .update({
      first_name: u.firstName ?? '',
      last_name: u.lastName ?? '',
      phone: u.phone ?? '',
      role: u.role ?? 'client',
      is_active: u.isActive ?? true,
      last_login_at: u.lastLoginAt ?? null,
    })
    .eq('id', authId)

  if (pErr) report.push(`profil ${u.email}: ECHEC — ${pErr.message}`)
  else report.push(`user ${u.email} (${u.role}) -> ${authId}`)
}

// Resout un ancien user_id vers un uuid auth, sinon null.
const mapUser = (oldId) => {
  if (!oldId) return null
  if (userIdMap.has(oldId)) return userIdMap.get(oldId)
  if (isUuid(oldId)) return oldId
  return null // ex: "test-user", "USER-1785..." -> pas de compte reel
}

// ── 2. Categories ────────────────────────────────────────────
await upsert(
  'categories',
  (db.categories ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    name_ar: c.name_ar ?? null,
    icon: c.icon ?? null,
    description: c.description ?? null,
    count: c.count ?? 0,
    color: c.color ?? null,
    image: c.image ?? null,
    subcategories: c.subcategories ?? [],
  }))
)

// ── 3. Produits ──────────────────────────────────────────────
const categoryIds = new Set((db.categories ?? []).map((c) => c.id))
await upsert(
  'products',
  (db.products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    category: categoryIds.has(p.category) ? p.category : null,
    subcategory: p.subcategory ?? null,
    price: p.price ?? 0,
    original_price: p.originalPrice ?? null,
    discount: p.discount ?? 0,
    rating: p.rating ?? 0,
    reviews_count: typeof p.reviews === 'number' ? p.reviews : 0,
    stock: p.stock ?? 0,
    is_new: !!p.isNew,
    is_bestseller: !!p.isBestseller,
    featured: !!p.featured,
    colors: p.colors ?? [],
    sizes: p.sizes ?? [],
    images: p.images ?? [],
    tags: p.tags ?? [],
    description: p.description ?? null,
  }))
)

// ── 4. Coupons ───────────────────────────────────────────────
await upsert(
  'coupons',
  (db.coupons ?? []).map((c) => ({
    code: c.code,
    discount: c.discount ?? 0,
    min_purchase: c.min_purchase ?? 0,
    max_uses: c.max_uses ?? null,
    uses_count: c.uses_count ?? 0,
    is_active: c.is_active ?? true,
  })),
  'code'
)

// ── 5. Commandes ─────────────────────────────────────────────
await upsert(
  'orders',
  (db.orders ?? []).map((o) => ({
    id: o.id,
    user_id: mapUser(o.user_id),
    status: o.status ?? 'pending',
    subtotal: o.subtotal ?? 0,
    shipping: o.shipping ?? 0,
    discount: o.discount ?? 0,
    total: o.total ?? 0,
    coupon_code: o.coupon_code ?? null,
    payment_method: o.payment_method ?? null,
    shipping_address: o.shipping_address ?? null,
    phone: o.phone ?? null,
    email: o.email ?? null,
    tracking_number: o.tracking_number ?? null,
    created_at: o.created_at ?? new Date().toISOString(),
    updated_at: o.updated_at ?? new Date().toISOString(),
  }))
)

const productIds = new Set((db.products ?? []).map((p) => p.id))
const orderIds = new Set((db.orders ?? []).map((o) => o.id))

await upsert(
  'order_items',
  (db.order_items ?? [])
    .filter((i) => orderIds.has(i.order_id))
    .map((i) => ({
      id: i.id,
      order_id: i.order_id,
      product_id: productIds.has(i.product_id) ? i.product_id : null,
      quantity: i.quantity ?? 1,
      price: i.price ?? 0,
      color: i.color ?? null,
      size: i.size ?? null,
      created_at: i.created_at ?? new Date().toISOString(),
    }))
)

await upsert(
  'order_tracking',
  (db.order_tracking ?? [])
    .filter((t) => orderIds.has(t.order_id))
    .map((t) => ({
      id: t.id,
      order_id: t.order_id,
      step_label: t.step_label,
      is_done: !!t.is_done,
      step_date: t.step_date ?? null,
      created_at: t.created_at ?? new Date().toISOString(),
    }))
)

await upsert(
  'payments',
  (db.payments ?? [])
    .filter((p) => orderIds.has(p.order_id))
    .map((p) => ({
      id: p.id,
      order_id: p.order_id,
      method: p.method ?? null,
      amount: p.amount ?? 0,
      status: p.status ?? 'pending',
      transaction_id: p.transaction_id ?? null,
      phone: p.phone ?? null,
      created_at: p.created_at ?? new Date().toISOString(),
    }))
)

// ── 6. Avis (user_id nullable -> on garde meme sans compte) ───
await upsert(
  'reviews',
  (db.reviews ?? [])
    .filter((r) => productIds.has(r.product_id))
    .map((r) => ({
      user_id: mapUser(r.user_id),
      product_id: r.product_id,
      rating: r.rating ?? 5,
      comment: r.comment ?? null,
      verified: !!r.verified,
      // Les avis existants etaient affiches : on les considere approuves.
      status: 'approved',
      created_at: r.created_at ?? new Date().toISOString(),
    }))
)

// ── 7. Favoris / notifications / adresses ────────────────────
// user_id est NOT NULL : impossible de migrer les lignes rattachees a un
// utilisateur factice (ex "test-user") qui n'existe pas dans auth.users.
const favs = (db.favorites ?? []).filter(
  (f) => mapUser(f.user_id) && productIds.has(f.product_id)
)
const skippedFavs = (db.favorites ?? []).length - favs.length
await upsert(
  'favorites',
  favs.map((f) => ({
    user_id: mapUser(f.user_id),
    product_id: f.product_id,
    created_at: f.created_at ?? new Date().toISOString(),
  })),
  'user_id,product_id'
)
if (skippedFavs) report.push(`favorites: ${skippedFavs} ignore(s) (utilisateur inexistant)`)

const notifs = (db.notifications ?? []).filter((n) => mapUser(n.user_id))
const skippedNotifs = (db.notifications ?? []).length - notifs.length
await upsert(
  'notifications',
  notifs.map((n) => ({
    user_id: mapUser(n.user_id),
    type: n.type ?? null,
    title: n.title ?? null,
    message: n.message ?? null,
    link: n.link ?? null,
    read: !!n.read,
    created_at: n.created_at ?? new Date().toISOString(),
  })),
  'id'
)
if (skippedNotifs) report.push(`notifications: ${skippedNotifs} ignore(s) (utilisateur inexistant)`)

const addrs = (db.addresses ?? []).filter((a) => mapUser(a.user_id))
await upsert(
  'addresses',
  addrs.map((a) => ({
    user_id: mapUser(a.user_id),
    type: a.type ?? 'delivery',
    first_name: a.firstName ?? null,
    last_name: a.lastName ?? null,
    address: a.address ?? null,
    postal_code: a.postalCode ?? null,
    city: a.city ?? null,
    country: a.country ?? "Côte d'Ivoire",
    phone: a.phone ?? null,
    is_default: !!a.isDefault,
  })),
  'id'
)

console.log('\n===== RAPPORT DE MIGRATION =====')
for (const line of report) console.log(' -', line)
console.log('\nMot de passe temporaire des comptes migres :', TEMP_PASSWORD)
console.log('Changez-le apres la premiere connexion.\n')

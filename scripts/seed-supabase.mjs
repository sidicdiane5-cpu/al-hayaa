/**
 * Importe les donnees de db.json vers Supabase.
 * Usage:
 *   node --env-file-if-exists=/vercel/share/.env.project scripts/seed-supabase.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = JSON.parse(readFileSync(join(__dirname, '..', 'db.json'), 'utf8'))

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

function log(step, res) {
  if (res.error) {
    console.error(`  X ${step}:`, res.error.message)
    return false
  }
  console.log(`  OK ${step}`)
  return true
}

async function main() {
  console.log('\n=== CATEGORIES ===')
  const categories = db.categories.map((c, i) => ({
    id: c.id,
    name: c.name,
    name_ar: c.name_ar ?? null,
    icon: c.icon ?? null,
    description: c.description ?? null,
    color: c.color ?? null,
    image: c.image ?? null,
    subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
    sort_order: i,
    active: true,
  }))
  log(`${categories.length} categories`, await supabase.from('categories').upsert(categories, { onConflict: 'id' }))

  console.log('\n=== PRODUITS ===')
  // db.json contient des ids en doublon -> on garde la derniere occurrence
  const seen = new Map()
  for (const p of db.products) seen.set(p.id, p)
  const uniqueProducts = [...seen.values()]
  const dupes = db.products.length - uniqueProducts.length
  if (dupes > 0) console.log(`  (${dupes} doublons d'id ignores)`)

  const products = uniqueProducts.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category ?? null,
    subcategory: p.subcategory ?? null,
    price: Math.round(Number(p.price) || 0),
    original_price: p.originalPrice ? Math.round(Number(p.originalPrice)) : null,
    discount: Math.round(Number(p.discount) || 0),
    rating: Number(p.rating) || 0,
    reviews_count: Math.round(Number(p.reviews) || 0),
    stock: Math.round(Number(p.stock) || 0),
    is_new: Boolean(p.isNew),
    is_bestseller: Boolean(p.isBestseller),
    featured: Boolean(p.featured),
    colors: Array.isArray(p.colors) ? p.colors : [],
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    images: Array.isArray(p.images) ? p.images : [],
    description: p.description ?? null,
    tags: Array.isArray(p.tags) ? p.tags : [],
    active: true,
  }))

  // par lots de 50
  for (let i = 0; i < products.length; i += 50) {
    const batch = products.slice(i, i + 50)
    log(
      `produits ${i + 1}-${i + batch.length}`,
      await supabase.from('products').upsert(batch, { onConflict: 'id' })
    )
  }

  console.log('\n=== COUPONS ===')
  if (Array.isArray(db.coupons) && db.coupons.length) {
    const coupons = db.coupons.map((c) => ({
      code: c.code,
      type: c.type === 'fixed' ? 'fixed' : 'percentage',
      value: Math.round(Number(c.value ?? c.discount) || 0),
      min_amount: Math.round(Number(c.min_amount ?? c.minAmount) || 0),
      max_uses: c.max_uses ?? c.maxUses ?? null,
      used_count: Math.round(Number(c.used_count ?? c.usedCount) || 0),
      active: c.active !== false,
      expires_at: c.expires_at ?? c.expiresAt ?? null,
    }))
    log(`${coupons.length} coupons`, await supabase.from('coupons').upsert(coupons, { onConflict: 'code' }))
  }

  console.log('\n=== PARAMETRES SITE ===')
  log(
    'settings',
    await supabase.from('site_settings').upsert(
      [
        { key: 'delivery', value: { fee: 2000, free_from: 50000 } },
        { key: 'store', value: { name: 'Dar Al Hayaa', currency: 'FCFA', phone: '' } },
        { key: 'wave', value: { enabled: true, merchant_name: 'Dar Al Hayaa' } },
      ],
      { onConflict: 'key' }
    )
  )

  console.log('\n=== VERIFICATION ===')
  for (const t of ['categories', 'products', 'coupons', 'site_settings']) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true })
    console.log(`  ${t}: ${error ? 'ERREUR ' + error.message : count + ' lignes'}`)
  }
  console.log('\nTermine.\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

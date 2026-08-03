/** Libelles lisibles des statuts de commande. */
export const STATUS_LABELS = {
  pending: 'En attente de paiement',
  confirmed: 'Commande confirmee',
  processing: 'En preparation',
  shipped: 'Expediee',
  delivered: 'Livree',
  cancelled: 'Annulee',
}

/** Genere un numero de commande lisible : DAH-20260803-4821 */
export function generateOrderNumber() {
  const now = new Date()
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `DAH-${date}-${random}`
}

/**
 * Recalcule le total cote serveur a partir des VRAIS prix en base.
 * Ne jamais faire confiance aux montants envoyes par le client.
 */
export async function computeOrderTotals(supabase, items, couponCode) {
  if (!Array.isArray(items) || items.length === 0) {
    throw Object.assign(new Error('Le panier est vide'), { statusCode: 400 })
  }
  if (items.length > 100) {
    throw Object.assign(new Error('Trop d articles dans le panier'), { statusCode: 400 })
  }

  const ids = [...new Set(items.map((i) => String(i.productId ?? i.id)))]

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, price, stock, images, active')
    .in('id', ids)

  if (error) throw Object.assign(new Error(error.message), { statusCode: 500 })

  const byId = new Map((products || []).map((p) => [p.id, p]))

  // Agrege les quantites par produit/taille/couleur
  const aggregated = new Map()
  for (const item of items) {
    const productId = String(item.productId ?? item.id)
    const quantity = Number(item.quantity)

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw Object.assign(new Error('Quantite invalide'), { statusCode: 400 })
    }

    const key = `${productId}|${item.size || ''}|${item.color || ''}`
    const existing = aggregated.get(key)
    if (existing) {
      existing.quantity += quantity
    } else {
      aggregated.set(key, {
        productId,
        quantity,
        size: item.size || null,
        color: item.color || null,
      })
    }
  }

  // Verifie le stock global par produit
  const totalPerProduct = new Map()
  for (const line of aggregated.values()) {
    totalPerProduct.set(
      line.productId,
      (totalPerProduct.get(line.productId) || 0) + line.quantity
    )
  }

  const orderItems = []
  let subtotal = 0

  for (const line of aggregated.values()) {
    const product = byId.get(line.productId)
    if (!product || product.active === false) {
      throw Object.assign(new Error(`Produit indisponible : ${line.productId}`), {
        statusCode: 400,
      })
    }

    const requested = totalPerProduct.get(line.productId)
    if (product.stock < requested) {
      throw Object.assign(
        new Error(`Stock insuffisant pour ${product.name} (reste ${product.stock})`),
        { statusCode: 400 }
      )
    }

    const price = Number(product.price) || 0
    subtotal += price * line.quantity

    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      product_image: Array.isArray(product.images) ? product.images[0] || null : null,
      price,
      quantity: line.quantity,
      size: line.size,
      color: line.color,
    })
  }

  // Frais de livraison depuis les parametres du site
  let deliveryFee = 2000
  let freeFrom = 50000
  const { data: setting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'delivery')
    .maybeSingle()

  if (setting?.value) {
    deliveryFee = Number(setting.value.fee ?? deliveryFee)
    freeFrom = Number(setting.value.free_from ?? freeFrom)
  }
  if (subtotal >= freeFrom) deliveryFee = 0

  // Coupon valide cote serveur
  let discount = 0
  let appliedCoupon = null

  if (couponCode) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', String(couponCode).toUpperCase().trim())
      .maybeSingle()

    const usable =
      coupon &&
      coupon.active &&
      subtotal >= Number(coupon.min_amount || 0) &&
      (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) &&
      (coupon.max_uses == null || Number(coupon.used_count) < Number(coupon.max_uses))

    if (usable) {
      discount =
        coupon.type === 'fixed'
          ? Number(coupon.value)
          : Math.round((subtotal * Number(coupon.value)) / 100)
      discount = Math.min(discount, subtotal)
      appliedCoupon = coupon.code
    }
  }

  const total = Math.max(0, subtotal + deliveryFee - discount)

  return { orderItems, subtotal, deliveryFee, discount, total, appliedCoupon }
}

/** Decremente le stock des produits d'une commande. */
export async function decrementStock(supabase, orderItems) {
  for (const item of orderItems) {
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.product_id)
      .maybeSingle()

    if (product) {
      await supabase
        .from('products')
        .update({ stock: Math.max(0, Number(product.stock) - item.quantity) })
        .eq('id', item.product_id)
    }
  }
}

// Couche d'acces aux donnees Supabase.
// Remplace toutes les requetes vers http://localhost:3001/api.
import { supabase } from './supabase';

// ── Mappers : colonnes snake_case (SQL) <-> camelCase (composants) ──
export function mapProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    price: Number(row.price ?? 0),
    originalPrice: row.original_price != null ? Number(row.original_price) : null,
    discount: row.discount ?? 0,
    rating: Number(row.rating ?? 0),
    reviews: row.reviews_count ?? 0,
    stock: row.stock ?? 0,
    isNew: !!row.is_new,
    isBestseller: !!row.is_bestseller,
    featured: !!row.featured,
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    images: row.images ?? [],
    tags: row.tags ?? [],
    description: row.description ?? '',
  };
}

export function mapCategory(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    name_ar: row.name_ar,
    icon: row.icon,
    description: row.description,
    count: row.count ?? 0,
    color: row.color,
    image: row.image,
    subcategories: row.subcategories ?? [],
  };
}

export function mapCustomer(row) {
  if (!row) return null;
  const firstName = row.first_name ?? '';
  const lastName = row.last_name ?? '';
  return {
    id: row.id,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim() || row.email,
    email: row.email,
    phone: row.phone ?? '',
    role: row.role,
    isActive: row.is_active,
    status: row.is_active ? 'active' : 'inactive',
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

export function mapOrder(row) {
  if (!row) return null;
  const items = (row.order_items ?? []).map((i) => ({
    id: i.id,
    productId: i.product_id,
    name: i.products?.name ?? i.product_id,
    image: i.products?.images?.[0] ?? null,
    quantity: i.quantity,
    price: Number(i.price ?? 0),
    color: i.color,
    size: i.size,
  }));

  const address = row.shipping_address ?? {};
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    subtotal: Number(row.subtotal ?? 0),
    shipping: Number(row.shipping ?? 0),
    discount: Number(row.discount ?? 0),
    total: Number(row.total ?? 0),
    couponCode: row.coupon_code,
    paymentMethod: row.payment_method,
    shippingAddress: address,
    customerName: `${address.firstName ?? ''} ${address.lastName ?? ''}`.trim(),
    phone: row.phone,
    email: row.email,
    trackingNumber: row.tracking_number,
    createdAt: row.created_at,
    date: row.created_at,
    updatedAt: row.updated_at,
    items,
    itemsCount: items.reduce((s, i) => s + i.quantity, 0),
  };
}

export function mapReview(row) {
  if (!row) return null;
  const p = row.profiles;
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    productName: row.products?.name ?? row.product_id,
    userName: p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() : 'Client',
    userEmail: p?.email ?? '',
    author: p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() : 'Client',
    rating: row.rating,
    comment: row.comment ?? '',
    verified: row.verified,
    status: row.status,
    createdAt: row.created_at,
    date: row.created_at,
  };
}

export function mapCoupon(row) {
  if (!row) return null;
  return {
    id: row.code,
    code: row.code,
    discount: row.discount,
    minPurchase: Number(row.min_purchase ?? 0),
    maxUses: row.max_uses,
    usesCount: row.uses_count ?? 0,
    isActive: row.is_active,
    status: row.is_active ? 'active' : 'inactive',
    createdAt: row.created_at,
  };
}

// ── PRODUITS ─────────────────────────────────────────────────
export async function getProducts() {
  const { data, error } = await supabase.from('products').select('*').order('id');
  if (error) throw new Error(error.message);
  return data.map(mapProduct);
}

export async function getProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return mapProduct(data);
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateProductStock(id, stock) {
  const { error } = await supabase
    .from('products')
    .update({ stock, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ── CATEGORIES ───────────────────────────────────────────────
export async function getCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('id');
  if (error) throw new Error(error.message);
  return data.map(mapCategory);
}

// ── FAVORIS ──────────────────────────────────────────────────
export async function getFavorites() {
  const { data, error } = await supabase
    .from('favorites')
    .select('id, product_id, created_at, products(*)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data
    .filter((f) => f.products)
    .map((f) => ({ ...mapProduct(f.products), favoriteId: f.id }));
}

export async function addFavorite(userId, productId) {
  const { data, error } = await supabase
    .from('favorites')
    .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function removeFavorite(userId, productId) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw new Error(error.message);
}

// ── COUPONS ──────────────────────────────────────────────────
export async function validateCoupon(code, subtotal = 0) {
  const normalized = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', normalized)
    .eq('is_active', true)
    .maybeSingle();

  if (error) return { success: false, message: 'Erreur de validation du code promo' };
  if (!data) return { success: false, message: 'Code promo invalide' };

  if (data.max_uses != null && data.uses_count >= data.max_uses) {
    return { success: false, message: 'Ce code promo a atteint sa limite d’utilisation' };
  }
  if (subtotal < Number(data.min_purchase ?? 0)) {
    return {
      success: false,
      message: `Achat minimum de ${Number(data.min_purchase).toFixed(2)} requis`,
    };
  }

  return {
    success: true,
    discount: data.discount,
    message: `Code promo appliqué : -${data.discount}%`,
  };
}

export async function getCoupons() {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(mapCoupon);
}

export async function setCouponActive(code, isActive) {
  const { error } = await supabase
    .from('coupons')
    .update({ is_active: isActive })
    .eq('code', code);
  if (error) throw new Error(error.message);
}

export async function deleteCoupon(code) {
  const { error } = await supabase.from('coupons').delete().eq('code', code);
  if (error) throw new Error(error.message);
}

// ── COMMANDES ────────────────────────────────────────────────
const ORDER_SELECT =
  '*, order_items(*, products(name, images)), order_tracking(*), payments(*)';

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(mapOrder);
}

export async function getMyOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(mapOrder);
}

export async function getOrderByTracking(trackingNumber) {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('tracking_number', trackingNumber.trim())
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const order = mapOrder(data);
  order.tracking = (data.order_tracking ?? [])
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((t) => ({ label: t.step_label, done: t.is_done, date: t.step_date }));
  return order;
}

export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw new Error(error.message);
}

// Cree la commande, ses lignes, son suivi et son paiement.
export async function createOrder({
  userId,
  items,
  subtotal,
  shipping,
  discount,
  total,
  couponCode,
  paymentMethod,
  shippingAddress,
  phone,
  email,
}) {
  const orderId = `ORD-${Date.now()}`;
  const trackingNumber = `TRK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      user_id: userId ?? null,
      status: 'pending',
      subtotal,
      shipping,
      discount,
      total,
      coupon_code: couponCode || null,
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
      phone,
      email,
      tracking_number: trackingNumber,
    })
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);

  const orderItems = items.map((item, index) => ({
    id: `ITEM-${Date.now()}-${index}`,
    order_id: orderId,
    product_id: item.id,
    quantity: item.quantity,
    price: item.price,
    color: item.selectedColor ?? null,
    size: item.selectedSize ?? null,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw new Error(itemsError.message);

  // Etapes de suivi initiales
  const steps = [
    { label: 'Commande validée', done: true },
    { label: 'Paiement confirmé', done: false },
    { label: 'En préparation', done: false },
    { label: 'Expédiée', done: false },
    { label: 'Livrée', done: false },
  ];
  const { error: trackError } = await supabase.from('order_tracking').insert(
    steps.map((s, i) => ({
      id: `TRACK-${Date.now()}-${i}`,
      order_id: orderId,
      step_label: s.label,
      is_done: s.done,
      step_date: s.done ? new Date().toISOString() : null,
    }))
  );
  if (trackError) throw new Error(trackError.message);

  return mapOrder(order);
}

// ── PAIEMENTS ────────────────────────────────────────────────
export async function createPayment({ orderId, method, amount, phone, status = 'pending' }) {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      id: `PAY-${Date.now()}`,
      order_id: orderId,
      method,
      amount,
      status,
      transaction_id: `TXN-${Date.now()}`,
      phone,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePaymentStatus(paymentId, status) {
  const { error } = await supabase.from('payments').update({ status }).eq('id', paymentId);
  if (error) throw new Error(error.message);
}

// ── AVIS ─────────────────────────────────────────────────────
export async function getProductReviews(productId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(first_name, last_name, email)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(mapReview);
}

export async function getAllReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(first_name, last_name, email), products(name)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(mapReview);
}

export async function createReview({ userId, productId, rating, comment }) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({ user_id: userId, product_id: productId, rating, comment })
    .select('*, profiles(first_name, last_name, email)')
    .single();
  if (error) throw new Error(error.message);
  return mapReview(data);
}

export async function setReviewStatus(reviewId, status) {
  const { error } = await supabase.from('reviews').update({ status }).eq('id', reviewId);
  if (error) throw new Error(error.message);
}

export async function deleteReview(reviewId) {
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  if (error) throw new Error(error.message);
}

// ── CLIENTS (admin) ──────────────────────────────────────────
export async function getCustomers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(mapCustomer);
}

export async function setCustomerRole(userId, role) {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
  if (error) throw new Error(error.message);
}

export async function setCustomerActive(userId, isActive) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId);
  if (error) throw new Error(error.message);
}

export async function deleteCustomer(userId) {
  const { error } = await supabase.from('profiles').delete().eq('id', userId);
  if (error) throw new Error(error.message);
}

// ── NOTIFICATIONS ────────────────────────────────────────────
export async function getNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function markNotificationRead(id) {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) throw new Error(error.message);
}

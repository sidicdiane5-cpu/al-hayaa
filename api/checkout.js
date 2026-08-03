import { adminClient, getUserFromRequest } from './_lib/supabase.js'
import {
  computeOrderTotals,
  decrementStock,
  generateOrderNumber,
} from './_lib/orders.js'
import { createCheckoutSession, isWaveConfigured } from './_lib/wave.js'

/**
 * POST /api/checkout
 * Cree la commande (montants recalculES cotE serveur) puis, si Wave est
 * configurE, ouvre une session de paiement Wave et renvoie son URL.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Methode non autorisee' })
  }

  try {
    const supabase = adminClient()
    const body = req.body || {}

    const { items, customer = {}, couponCode } = body

    // --- Validation des informations client ---
    const customerName = String(customer.name || '').trim()
    const customerPhone = String(customer.phone || '').trim()

    if (customerName.length < 2) {
      return res.status(400).json({ error: 'Le nom est obligatoire' })
    }
    if (!/^[+\d\s-]{8,20}$/.test(customerPhone)) {
      return res.status(400).json({ error: 'Numero de telephone invalide' })
    }

    // --- Utilisateur connecte (optionnel : commande invitE autorisEe) ---
    const auth = await getUserFromRequest(req)
    const userId = auth?.user?.id || null

    // --- Recalcul des montants a partir des prix reels en base ---
    const totals = await computeOrderTotals(supabase, items, couponCode)

    // --- Creation de la commande ---
    const orderNumber = generateOrderNumber()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId,
        customer_name: customerName,
        customer_email: customer.email ? String(customer.email).trim() : null,
        customer_phone: customerPhone,
        delivery_address: customer.address ? String(customer.address).trim() : null,
        delivery_city: customer.city ? String(customer.city).trim() : null,
        delivery_notes: customer.notes ? String(customer.notes).slice(0, 500) : null,
        subtotal: totals.subtotal,
        delivery_fee: totals.deliveryFee,
        discount: totals.discount,
        total: totals.total,
        coupon_code: totals.appliedCoupon,
        status: 'pending',
        payment_method: 'wave',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (orderError) {
      return res.status(500).json({ error: orderError.message })
    }

    // --- Lignes de commande ---
    const { error: itemsError } = await supabase.from('order_items').insert(
      totals.orderItems.map((item) => ({ ...item, order_id: order.id }))
    )

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id)
      return res.status(500).json({ error: itemsError.message })
    }

    // --- Premiere etape de suivi ---
    await supabase.from('order_tracking').insert({
      order_id: order.id,
      status: 'pending',
      label: 'Commande enregistree',
      note: 'En attente du paiement Wave',
    })

    // --- Notification pour l'administrateur ---
    await supabase.from('notifications').insert({
      audience: 'admin',
      title: 'Nouvelle commande',
      message: `${orderNumber} - ${customerName} - ${totals.total.toLocaleString('fr-FR')} FCFA`,
      type: 'order',
      link: `/admin/orders`,
    })

    const origin =
      process.env.PUBLIC_SITE_URL ||
      req.headers.origin ||
      `https://${req.headers.host}`

    // --- Session de paiement Wave ---
    let checkoutUrl = null
    let waveError = null
    let sessionId = null

    if (isWaveConfigured()) {
      try {
        const session = await createCheckoutSession({
          amount: totals.total,
          currency: 'XOF',
          successUrl: `${origin}/order-confirmation/${order.id}?status=success`,
          errorUrl: `${origin}/order-confirmation/${order.id}?status=error`,
          clientReference: order.order_number,
        })

        sessionId = session.id || session.session_id || null
        checkoutUrl =
          session.wave_launch_url ||
          session.launch_url ||
          session.checkout_url ||
          null

        await supabase.from('payments').insert({
          order_id: order.id,
          provider: 'wave',
          amount: totals.total,
          currency: 'XOF',
          status: 'processing',
          wave_session_id: sessionId,
          wave_checkout_url: checkoutUrl,
          payer_phone: customerPhone,
          raw: session,
        })
      } catch (error) {
        waveError = error.message
        await supabase.from('payments').insert({
          order_id: order.id,
          provider: 'wave',
          amount: totals.total,
          currency: 'XOF',
          status: 'failed',
          payer_phone: customerPhone,
          error_message: error.message,
        })
      }
    } else {
      // Wave pas encore configure : la commande reste en attente et
      // l'administrateur confirmera le paiement manuellement.
      await supabase.from('payments').insert({
        order_id: order.id,
        provider: 'wave',
        amount: totals.total,
        currency: 'XOF',
        status: 'pending',
        payer_phone: customerPhone,
        error_message: 'WAVE_API_KEY absente : confirmation manuelle requise',
      })
    }

    // Le stock est reserve des la creation de la commande
    await decrementStock(supabase, totals.orderItems)

    return res.status(201).json({
      order: {
        id: order.id,
        orderNumber: order.order_number,
        total: order.total,
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        discount: order.discount,
        status: order.status,
        paymentStatus: order.payment_status,
      },
      payment: {
        provider: 'wave',
        configured: isWaveConfigured(),
        checkoutUrl,
        sessionId,
        error: waveError,
      },
    })
  } catch (error) {
    const status = error.statusCode || 500
    return res.status(status).json({ error: error.message })
  }
}

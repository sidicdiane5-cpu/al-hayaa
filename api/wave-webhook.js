import { adminClient } from './_lib/supabase.js'
import { verifyWebhookSignature } from './_lib/wave.js'

export const config = { api: { bodyParser: false } }

/** Lit le corps brut de la requete (necessaire pour verifier la signature). */
async function readRawBody(req) {
  if (typeof req.body === 'string') return req.body
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8')
  if (req.rawBody) return String(req.rawBody)

  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

/**
 * POST /api/wave-webhook
 * Wave notifie ici le resultat du paiement. On met a jour la commande.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Methode non autorisee' })
  }

  try {
    const rawBody = await readRawBody(req)
    const signature =
      req.headers['wave-signature'] || req.headers['Wave-Signature']

    const check = verifyWebhookSignature(rawBody, signature)
    if (!check.valid) {
      console.log('[v0] webhook Wave rejete :', check.reason)
      return res.status(401).json({ error: 'Signature invalide' })
    }

    let event
    try {
      event = JSON.parse(rawBody)
    } catch {
      return res.status(400).json({ error: 'Corps JSON invalide' })
    }

    const type = event.type || event.event_type || ''
    const data = event.data || event

    const sessionId = data.id || data.session_id || null
    const clientReference = data.client_reference || null

    const supabase = adminClient()

    // Retrouve la commande via la session Wave ou la reference client
    let orderId = null

    if (sessionId) {
      const { data: payment } = await supabase
        .from('payments')
        .select('order_id')
        .eq('wave_session_id', sessionId)
        .maybeSingle()
      orderId = payment?.order_id || null
    }

    if (!orderId && clientReference) {
      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', clientReference)
        .maybeSingle()
      orderId = order?.id || null
    }

    if (!orderId) {
      // On repond 200 pour eviter que Wave ne reessaie indefiniment
      return res.status(200).json({ received: true, matched: false })
    }

    const succeeded =
      type.includes('completed') ||
      type.includes('succeeded') ||
      data.payment_status === 'succeeded' ||
      data.status === 'complete'

    const failed =
      type.includes('failed') ||
      type.includes('cancelled') ||
      data.payment_status === 'failed'

    if (succeeded) {
      await supabase
        .from('orders')
        .update({ payment_status: 'paid', status: 'confirmed' })
        .eq('id', orderId)

      await supabase
        .from('payments')
        .update({
          status: 'succeeded',
          wave_transaction_id: data.transaction_id || data.id || null,
          raw: event,
        })
        .eq('order_id', orderId)

      await supabase.from('order_tracking').insert({
        order_id: orderId,
        status: 'confirmed',
        label: 'Paiement Wave recu',
        note: 'Commande confirmee automatiquement',
      })

      await supabase.from('notifications').insert({
        audience: 'admin',
        title: 'Paiement Wave recu',
        message: `Commande payee : ${clientReference || orderId}`,
        type: 'payment',
        link: '/admin/orders',
      })
    } else if (failed) {
      await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', orderId)

      await supabase
        .from('payments')
        .update({
          status: 'failed',
          error_message: data.error_message || type,
          raw: event,
        })
        .eq('order_id', orderId)
    }

    return res.status(200).json({ received: true, matched: true })
  } catch (error) {
    console.log('[v0] erreur webhook Wave :', error.message)
    return res.status(500).json({ error: error.message })
  }
}

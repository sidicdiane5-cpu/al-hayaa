import crypto from 'node:crypto'

const WAVE_BASE_URL = process.env.WAVE_API_BASE_URL || 'https://api.wave.com'

export const WAVE_API_KEY = process.env.WAVE_API_KEY || ''
export const WAVE_SIGNING_SECRET = process.env.WAVE_SIGNING_SECRET || ''
export const WAVE_WEBHOOK_SECRET =
  process.env.WAVE_WEBHOOK_SECRET || WAVE_SIGNING_SECRET

/** Wave est-il reellement configure ? Sinon on tourne en mode "en attente". */
export function isWaveConfigured() {
  return Boolean(WAVE_API_KEY)
}

/**
 * Appel authentifie a l'API Wave.
 * Gere la signature de requete (Wave-Signature) si un secret est defini.
 */
async function waveFetch(path, { method = 'GET', body } = {}) {
  const raw = body ? JSON.stringify(body) : ''

  const headers = {
    Authorization: `Bearer ${WAVE_API_KEY}`,
  }
  if (body) headers['Content-Type'] = 'application/json'

  if (WAVE_SIGNING_SECRET) {
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = crypto
      .createHmac('sha256', WAVE_SIGNING_SECRET)
      .update(`${timestamp}${raw}`)
      .digest('hex')
    headers['Wave-Signature'] = `t=${timestamp},v1=${signature}`
  }

  const response = await fetch(`${WAVE_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? raw : undefined,
  })

  const text = await response.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { raw: text }
  }

  if (!response.ok) {
    const message =
      data?.message || data?.error?.message || `Wave a repondu ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.code = data?.code || data?.error?.code
    error.data = data
    throw error
  }

  return data
}

/**
 * Cree une session de paiement Wave.
 * Le XOF n'a pas de decimales : le montant est un entier envoye en chaine.
 */
export function createCheckoutSession({
  amount,
  currency = 'XOF',
  successUrl,
  errorUrl,
  clientReference,
}) {
  return waveFetch('/v1/checkout/sessions', {
    method: 'POST',
    body: {
      amount: String(Math.round(Number(amount))),
      currency,
      success_url: successUrl,
      error_url: errorUrl,
      ...(clientReference ? { client_reference: clientReference } : {}),
    },
  })
}

/** Recupere une session de paiement par son id. */
export function getCheckoutSession(sessionId) {
  return waveFetch(`/v1/checkout/sessions/${encodeURIComponent(sessionId)}`)
}

/** Solde du portefeuille Wave Business. */
export function getBalance() {
  return waveFetch('/v1/balance')
}

/**
 * Envoi d'argent (retrait vers un numero Wave).
 * Permet a l'administrateur de prelever depuis le portefeuille marchand.
 */
export function createPayout({ amount, currency = 'XOF', mobile, name, clientReference }) {
  return waveFetch('/v1/payout', {
    method: 'POST',
    body: {
      currency,
      receive_amount: String(Math.round(Number(amount))),
      mobile,
      ...(name ? { name } : {}),
      ...(clientReference ? { client_reference: clientReference } : {}),
    },
  })
}

/**
 * Verifie la signature d'un webhook Wave.
 * En-tete attendu : Wave-Signature: t={timestamp},v1={signature}
 */
export function verifyWebhookSignature(rawBody, signatureHeader) {
  if (!WAVE_WEBHOOK_SECRET) return { valid: true, skipped: true }
  if (!signatureHeader) return { valid: false, reason: 'signature manquante' }

  const parts = String(signatureHeader)
    .split(',')
    .reduce((acc, part) => {
      const [k, v] = part.split('=')
      if (k && v) acc[k.trim()] = v.trim()
      return acc
    }, {})

  const timestamp = parts.t
  const provided = parts.v1
  if (!timestamp || !provided) {
    return { valid: false, reason: 'format de signature invalide' }
  }

  // Anti-rejeu : on refuse au-dela de 5 minutes
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp))
  if (!Number.isFinite(age) || age > 300) {
    return { valid: false, reason: 'signature expiree' }
  }

  const expected = crypto
    .createHmac('sha256', WAVE_WEBHOOK_SECRET)
    .update(`${timestamp}${rawBody}`)
    .digest('hex')

  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(provided, 'utf8')
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b)

  return { valid, reason: valid ? undefined : 'signature invalide' }
}

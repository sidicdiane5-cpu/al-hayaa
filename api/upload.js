import { put } from '@vercel/blob'
import { requireAdmin } from './_lib/supabase.js'

export const config = { api: { bodyParser: false } }

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
const MAX_BYTES = 8 * 1024 * 1024 // 8 Mo

async function readBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

/**
 * POST /api/upload?filename=photo.jpg
 * Reserve aux administrateurs. Envoie l'image sur Vercel Blob et renvoie l'URL
 * publique a enregistrer dans le produit.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Methode non autorisee' })
  }

  const auth = await requireAdmin(req, res)
  if (!auth) return

  try {
    const contentType = req.headers['content-type'] || 'application/octet-stream'

    if (!ALLOWED.includes(contentType)) {
      return res.status(400).json({
        error: 'Format non supporte. Utilisez JPG, PNG, WEBP, AVIF ou GIF.',
      })
    }

    const buffer = await readBody(req)

    if (!buffer.length) {
      return res.status(400).json({ error: 'Fichier vide' })
    }
    if (buffer.length > MAX_BYTES) {
      return res.status(400).json({ error: 'Image trop lourde (max 8 Mo)' })
    }

    const url = new URL(req.url, `https://${req.headers.host}`)
    const requested = url.searchParams.get('filename') || 'image'
    const folder = url.searchParams.get('folder') || 'produits'

    // Nettoie le nom de fichier
    const safeName = requested
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, '-')
      .replace(/-+/g, '-')
      .slice(-80)

    const blob = await put(`${folder}/${Date.now()}-${safeName}`, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: true,
    })

    return res.status(201).json({ url: blob.url, pathname: blob.pathname })
  } catch (error) {
    console.log('[v0] erreur upload :', error.message)
    return res.status(500).json({ error: error.message })
  }
}

import { createClient } from '@supabase/supabase-js'

const url =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL

const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY

/** Client admin (service role) : ignore RLS. A n'utiliser QUE cote serveur. */
export function adminClient() {
  if (!url || !serviceKey) {
    throw new Error('Configuration Supabase serveur manquante')
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * Verifie le token Bearer de l'utilisateur et renvoie son profil.
 * @returns {Promise<{user: object, profile: object} | null>}
 */
export async function getUserFromRequest(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null

  const supabase = adminClient()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle()

  return { user: data.user, profile: profile || null }
}

/** Renvoie true si la requete provient d'un administrateur. */
export async function requireAdmin(req, res) {
  const auth = await getUserFromRequest(req)
  if (!auth) {
    res.status(401).json({ error: 'Authentification requise' })
    return null
  }
  if (auth.profile?.role !== 'admin') {
    res.status(403).json({ error: 'Acces administrateur requis' })
    return null
  }
  return auth
}

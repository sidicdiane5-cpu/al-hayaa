// Handler d'upload d'images produits vers Vercel Blob.
//
// Il est partage entre deux environnements :
//  - en production, `api/upload.js` l'expose comme fonction serverless Vercel ;
//  - en developpement, un plugin Vite (vite.config.js) le monte sur /api/upload.
//
// Le token BLOB_READ_WRITE_TOKEN ne quitte jamais le serveur : le navigateur
// envoie le fichier brut, le serveur le met dans le Blob et renvoie l'URL.
import { put } from '@vercel/blob';
import { createClient } from '@supabase/supabase-js';

const MAX_BYTES = 5 * 1024 * 1024; // 5 Mo
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      // On coupe la connexion des le depassement, sans tout charger en memoire.
      if (size > MAX_BYTES) {
        reject(new Error('TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

// Seul un admin ou un manager peut televerser une image : on verifie le
// jeton Supabase envoye par le client au lieu de faire confiance a l'appelant.
async function requireStaff(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return { ok: false, status: 401, message: 'Authentification requise' };

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) {
    return { ok: false, status: 500, message: 'Configuration Supabase manquante' };
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) {
    return { ok: false, status: 401, message: 'Session invalide' };
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return { ok: false, status: 403, message: 'Accès réservé au personnel' };
  }

  return { ok: true, userId: data.user.id };
}

export default async function uploadHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Méthode non autorisée' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return json(res, 500, { error: 'BLOB_READ_WRITE_TOKEN manquant sur le serveur' });
  }

  const auth = await requireStaff(req);
  if (!auth.ok) return json(res, auth.status, { error: auth.message });

  const contentType = (req.headers['content-type'] || '').split(';')[0].trim();
  if (!ALLOWED.includes(contentType)) {
    return json(res, 415, {
      error: `Format non supporté. Utilisez JPEG, PNG, WebP ou AVIF.`,
    });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    if (err.message === 'TOO_LARGE') {
      return json(res, 413, { error: 'Image trop lourde (5 Mo maximum)' });
    }
    return json(res, 400, { error: 'Lecture du fichier impossible' });
  }

  if (!body?.length) return json(res, 400, { error: 'Fichier vide' });

  // On ne fait jamais confiance au nom de fichier fourni : on l'assainit et
  // `addRandomSuffix` garantit l'unicite.
  const url = new URL(req.url, 'http://localhost');
  const rawName = url.searchParams.get('filename') || 'image';
  const safeName = rawName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .slice(-80);

  try {
    const blob = await put(`products/${safeName}`, body, {
      access: 'public',
      contentType,
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return json(res, 200, { url: blob.url, pathname: blob.pathname });
  } catch (err) {
    console.error('[v0] blob put failed:', err.message);
    return json(res, 500, { error: "L'envoi de l'image a échoué" });
  }
}

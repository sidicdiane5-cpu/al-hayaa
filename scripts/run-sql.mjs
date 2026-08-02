// Execute un fichier .sql sur la base Supabase.
// Usage: node --env-file-if-exists=/vercel/share/.env.project scripts/run-sql.mjs scripts/001_schema.sql
import { readFileSync } from 'node:fs'
import pg from 'pg'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/run-sql.mjs <fichier.sql>')
  process.exit(1)
}

const rawUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL

if (!rawUrl) {
  console.error('POSTGRES_URL_NON_POOLING manquant.')
  process.exit(1)
}

// On retire sslmode de l'URL : sinon il ecrase l'option ssl ci-dessous et
// le certificat auto-signe de Supabase fait echouer la connexion.
const parsed = new URL(rawUrl)
parsed.searchParams.delete('sslmode')
const connectionString = parsed.toString()

const sql = readFileSync(file, 'utf8')
const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  await client.query(sql)
  console.log(`OK  ${file}`)
} catch (err) {
  console.error(`ECHEC ${file}\n`, err.message)
  process.exitCode = 1
} finally {
  await client.end()
}

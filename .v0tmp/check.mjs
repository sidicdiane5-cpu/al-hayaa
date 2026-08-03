import pg from 'pg'
const parsed = new URL(process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL)
parsed.searchParams.delete('sslmode')
const c = new pg.Client({ connectionString: parsed.toString(), ssl: { rejectUnauthorized: false } })
await c.connect()
const t = await c.query("select tablename from pg_tables where schemaname='public' order by 1")
console.log('TABLES:', t.rows.map(r=>r.tablename).join(', ') || '(none)')
for (const tb of t.rows.map(r=>r.tablename)) {
  const n = await c.query(`select count(*)::int n from public."${tb}"`)
  const rls = await c.query(`select relrowsecurity from pg_class where oid = 'public.${tb}'::regclass`)
  const pol = await c.query(`select count(*)::int n from pg_policies where schemaname='public' and tablename=$1`,[tb])
  console.log(`${tb}: rows=${n.rows[0].n} rls=${rls.rows[0].relrowsecurity} policies=${pol.rows[0].n}`)
}
await c.end()

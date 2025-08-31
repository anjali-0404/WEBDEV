import pkg from 'pg';
const { Pool } = pkg;

export let pg;

export async function initPg() {
  const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
  });
  await pool.query('SELECT 1');
  pg = pool;
  console.log('Connected to Postgres');
}

export async function query(text, params) {
  return pg.query(text, params);
}

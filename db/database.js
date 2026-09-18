const { neon } = require('@neondatabase/serverless');

// As of 2026, "Vercel Postgres" is provisioned through the Neon Postgres
// Native Integration on the Vercel Marketplace, which sets a DATABASE_URL
// (or POSTGRES_URL) env var on your project automatically once you connect
// a database - you don't set this by hand.
// { fullResults: true } makes results look like node-postgres: { rows, rowCount }.
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = neon(connectionString, { fullResults: true });

let ready = false;

async function ensureTables() {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_id TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      items TEXT NOT NULL,
      total DOUBLE PRECISION NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `;
  ready = true;
}

module.exports = { sql, ensureTables };

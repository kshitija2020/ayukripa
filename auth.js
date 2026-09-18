const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, ensureTables } = require('../db/database');
const { SECRET } = require('../middleware/auth');

const router = express.Router();

// ---- Customer signup ----
router.post('/signup', async (req, res) => {
  try {
    await ensureTables();
    const { username, name, email, phone, address, password } = req.body;
    if (!username || !name || !email || !phone || !address || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const cleanUsername = String(username).trim().toLowerCase();
    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await sql`SELECT id FROM customers WHERE username = ${cleanUsername}`;
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'That username is already taken' });
    }

    const hash = await bcrypt.hash(password, 10);
    await sql`
      INSERT INTO customers (username, name, email, phone, address, password_hash, created_at)
      VALUES (${cleanUsername}, ${name}, ${email}, ${phone}, ${address}, ${hash}, ${new Date().toISOString()})
    `;

    const token = jwt.sign({ username: cleanUsername, role: 'customer', name }, SECRET, { expiresIn: '7d' });
    res.json({ token, customer: { username: cleanUsername, name, email, phone, address } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ---- Customer login ----
router.post('/login', async (req, res) => {
  try {
    await ensureTables();
    const { username, password } = req.body;
    const cleanUsername = String(username || '').trim().toLowerCase();
    const result = await sql`SELECT * FROM customers WHERE username = ${cleanUsername}`;
    const row = result.rows[0];
    if (!row) return res.status(401).json({ error: 'Invalid username or password' });

    const match = await bcrypt.compare(password || '', row.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ username: row.username, role: 'customer', name: row.name }, SECRET, { expiresIn: '7d' });
    res.json({
      token,
      customer: { username: row.username, name: row.name, email: row.email, phone: row.phone, address: row.address }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ---- Admin login ----
// Credentials come from environment variables you set in the Vercel
// dashboard (Project Settings -> Environment Variables). Change them
// before deploying for real - do not ship the sample password.
router.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'ayukripa123';

  if (username === adminUser && password === adminPass) {
    const token = jwt.sign({ username, role: 'admin' }, SECRET, { expiresIn: '7d' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid admin credentials' });
});

module.exports = router;

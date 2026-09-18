const express = require('express');
const { sql, ensureTables } = require('../db/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// ---- Create an order (logged-in customer) ----
router.post('/', verifyToken, async (req, res) => {
  try {
    await ensureTables();
    if (req.user.role !== 'customer') return res.status(403).json({ error: 'Customer login required' });

    const { customerName, phone, address, items, total, paymentMethod } = req.body;
    if (!customerName || !phone || !address || !Array.isArray(items) || items.length === 0 || !total) {
      return res.status(400).json({ error: 'Missing order details' });
    }

    const orderId = 'ORD' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10);
    const status = paymentMethod === 'UPI (self-reported)' ? 'Payment Verification Pending' : 'Order Placed';

    await sql`
      INSERT INTO orders (order_id, username, customer_name, phone, address, items, total, payment_method, status, created_at)
      VALUES (${orderId}, ${req.user.username}, ${customerName}, ${phone}, ${address}, ${JSON.stringify(items)}, ${total}, ${paymentMethod}, ${status}, ${new Date().toISOString()})
    `;

    res.json({ orderId, status });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not place order. Please try again.' });
  }
});

// ---- My orders (logged-in customer) ----
router.get('/mine', verifyToken, async (req, res) => {
  try {
    await ensureTables();
    if (req.user.role !== 'customer') return res.status(403).json({ error: 'Customer login required' });
    const result = await sql`SELECT * FROM orders WHERE username = ${req.user.username} ORDER BY created_at DESC`;
    res.json(result.rows.map(r => ({ ...r, items: JSON.parse(r.items) })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not load orders.' });
  }
});

// ---- All orders (admin only) ----
router.get('/', verifyAdmin, async (req, res) => {
  try {
    await ensureTables();
    const result = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    res.json(result.rows.map(r => ({ ...r, items: JSON.parse(r.items) })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not load orders.' });
  }
});

// ---- Update order status (admin only) ----
router.patch('/:orderId/status', verifyAdmin, async (req, res) => {
  try {
    await ensureTables();
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    const result = await sql`UPDATE orders SET status = ${status} WHERE order_id = ${req.params.orderId}`;
    if (result.rowCount === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not update order.' });
  }
});

// ---- Export all customers (admin only) ----
router.get('/export/customers', verifyAdmin, async (req, res) => {
  try {
    await ensureTables();
    const result = await sql`SELECT username, name, email, phone, address, created_at FROM customers ORDER BY created_at DESC`;
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not export customers.' });
  }
});

module.exports = router;

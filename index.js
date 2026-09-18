const express = require('express');
const cors = require('cors');

const authRoutes = require('../routes/auth');
const orderRoutes = require('../routes/orders');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Public, non-secret config the frontend needs (UPI ID to build the QR code)
app.get('/api/config', (req, res) => {
  res.json({
    upiId: process.env.UPI_ID || 'yourshop@upi',
    upiName: process.env.UPI_NAME || 'Ayukripa Wellness Care'
  });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Vercel calls this exported app directly as the request handler for every
// request matched by the rewrite rule in vercel.json. There is no app.listen
// here - Vercel manages the server process itself.
module.exports = app;

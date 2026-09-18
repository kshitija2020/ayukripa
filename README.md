# Ayukripa Wellness Care — Store (Vercel Edition)

Same store as before — customer signup/login, cart, checkout, UPI "Scan & Pay"
QR code, Cash on Delivery, and an admin dashboard for tracking orders — but
rebuilt to run on **Vercel's serverless platform** with a **Neon Postgres**
database instead of the local SQLite file, since Vercel functions don't keep
a persistent disk between requests.

## 1. What's real here, and what isn't

- Customer/admin accounts, orders, and order status are fully real, stored in
  a real Postgres database, with hashed passwords and proper login tokens.
- The UPI QR code is a genuine UPI payment link — put your real UPI ID in the
  `UPI_ID` environment variable and customers scanning it pay real money to
  your account.
- **There is no automatic payment confirmation.** No payment gateway is wired
  in. The customer taps "I've completed payment," the order is marked
  "Payment Verification Pending," and you confirm it manually in the admin
  panel once you see the money land. Wiring up a real gateway (Razorpay,
  Cashfree, PayU, etc.) for automatic confirmation is a follow-up project —
  ask if you'd like help with that later.

## 2. Project structure

```
├── vercel.json          # routes all /api/* requests to api/index.js
├── package.json
├── .env.example         # which env vars to set, and where
├── api/
│   └── index.js         # the Express app Vercel runs as one function
├── db/
│   └── database.js      # Postgres connection + table setup (Neon driver)
├── middleware/
│   └── auth.js          # JWT verification for customer/admin routes
├── routes/
│   ├── auth.js           # signup, login, admin-login
│   └── orders.js         # create/list/update orders, export customers
├── index.html            # frontend shell (served as a static file)
├── app.js                # frontend logic (served as a static file)
└── images/
    ├── amrut-sanjivani.jpg
    └── soft-cozi.jpg
```

Anything outside `api/` is served by Vercel automatically as a static file at
the same path — that's why `index.html`, `app.js`, and `images/` sit at the
project root instead of inside a `public/` folder.

## 3. Deploy it

You'll need a free [Vercel](https://vercel.com) account and the project
pushed to a GitHub/GitLab/Bitbucket repo (or use the Vercel CLI to deploy
straight from your computer).

**Step 1 — Create the project on Vercel**
Go to https://vercel.com/new, import this repo (or run `vercel` from the CLI
inside this folder), and let the first deploy run. It will succeed even
before the database is connected — login/checkout just won't work yet.

**Step 2 — Add a Postgres database**
In your Vercel project dashboard: **Storage → Create Database → Neon
(Postgres)** → follow the prompts to create it and connect it to this
project. Vercel will automatically add a `DATABASE_URL` environment variable
to your project — you don't need to type this in yourself.

**Step 3 — Add the other environment variables**
In **Project Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `JWT_SECRET` | a long random string (generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `ADMIN_USERNAME` | your chosen admin login username |
| `ADMIN_PASSWORD` | a strong password — don't ship a default |
| `UPI_ID` | your real UPI ID (VPA), e.g. `yourshop@okhdfcbank` |
| `UPI_NAME` | the name shown in the customer's UPI app during payment |

**Step 4 — Redeploy**
Trigger a redeploy (Vercel does this automatically after you add env vars in
some cases, or click **Deployments → Redeploy**). Your store is now live at
your `*.vercel.app` URL (or a custom domain you attach in Settings →
Domains).

## 4. Run it locally before deploying (optional but recommended)

```bash
npm install -g vercel     # if you don't have it
vercel login
vercel link                # connect this folder to your Vercel project
vercel env pull .env.development.local   # pulls DATABASE_URL etc. for local use
vercel dev                 # runs the same serverless setup locally
```

Open the URL `vercel dev` prints (usually `http://localhost:3000`).

## 5. Going further

- **Automatic payment confirmation**: integrate Razorpay/Cashfree/PayU's
  Node SDK in `routes/orders.js` so payments are verified server-side via
  webhook instead of the customer self-reporting.
- **Email/SMS notifications**: hook into an email service (Resend,
  SendGrid) or SMS API (Twilio, MSG91) when an order is placed or its
  status changes.
- **More products**: add entries to the `PRODUCTS` array in `app.js` and
  drop new images into `images/`.
- **Custom domain**: attach one for free under Project Settings → Domains
  once you're happy with the live site.

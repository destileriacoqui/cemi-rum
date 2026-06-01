# Destilería Coquí — Official Website

Static HTML/CSS/JS site hosted on **Vercel**. The storefront now includes a persistent cart, optional Supabase customer accounts, saved order records, and server-side Stripe Checkout Session creation. Card details remain on Stripe-hosted checkout.

## Commerce environment variables

Configure the variables listed in `.env.example` in Vercel. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe for the browser because Supabase Row Level Security protects customer records. `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` must remain server-side only.

Add a Stripe webhook endpoint for:

`https://YOUR_DOMAIN/api/stripe-webhook`

Subscribe it to `checkout.session.completed`.

---

## Local Development

**Requirements:** Node.js 18+

```bash
npm install
npm run dev
```

Open [http://localhost:4242](http://localhost:4242).

```bash
npm run build   # prints "Static site — no build step required." — this is correct.
```

---

## Deploy to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2 — Import into Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**.
2. Select your GitHub repository.
3. Vercel auto-detects `vercel.json`. No extra configuration needed.
4. Click **Deploy**.

### What vercel.json does

| Feature | Setting |
|---|---|
| Clean URLs | `/ron` serves `ron.html` — no `.html` in the browser bar |
| Asset caching | `img/`, `.mp4`, `.webp` — 1-year immutable cache |
| Security headers | CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy |

---

## Stripe Integration

Product pages add bottles to a shared cart. Shipping starts with Stripe-hosted ID verification and then calls `/api/create-checkout-session`, which creates the order record and opens Stripe-hosted Checkout. Stripe handles card details and address collection. Shipping is a flat `$20` charge added once per shipped order, regardless of bottle quantity. Puerto Rico IVU is charged at `11.5%` on the taxable merchandise and shipping total.

Pickup orders do not receive a shipping charge. Customers can choose Express Pickup for pickup in 1 day, subject to product availability, at `$5` per selected bottle. The Express Pickup fee is displayed separately and is excluded from the IVU calculation. Customers can choose to pay in store or continue to Stripe-hosted Checkout immediately. They can complete Stripe-hosted ID verification online or show a valid photo ID when they arrive. Staff can filter Express Pickup orders and ID checks in `/admin/orders`.

The tours page lets visitors choose a date, time, paying adult count, and free child count. `/api/create-tour-checkout-session` saves the booking in Supabase and opens Stripe-hosted Checkout at `$45` per adult plus `11.5%` Puerto Rico IVU. Children under 18 are saved with the booking and are not charged. After payment, the customer sees `/tour-confirmation` and the `/api/stripe-webhook` endpoint confirms the booking.

The Stripe secret key and webhook secret are Vercel server environment variables. They are never sent to the browser.

Enable Stripe Identity in the Stripe Dashboard before launch. The site uses hosted document verification pages, so raw ID photos are not stored in this website or Supabase.

Order and tour confirmation emails use Resend. Bottle customers receive an order confirmation, pickup updates can be sent automatically from the admin dashboard status buttons, and tour customers receive a paid-booking confirmation. `orders@prsugar.com`, `destileriacoqui07@gmail.com`, and `maria@prsugar.com` receive new bottle-order details. Configure `RESEND_API_KEY`, `ADMIN_EMAIL_FROM=Destilería Coquí <orders@prsugar.com>`, and `ADMIN_EMAIL_REPLY_TO=orders@prsugar.com` in Vercel before enabling real email delivery. Supabase Auth account-confirmation emails use the custom SMTP settings in the Supabase dashboard.

## Customer account confirmation

Supabase Auth must be configured with the deployed website URL:

- **Site URL:** `https://cemi-rum.vercel.app`
- **Redirect URL:** `https://cemi-rum.vercel.app/auth/callback`
- Add the matching `/auth/callback` URL for the final custom domain when it is connected.

The signup page requests `/auth/callback`, which saves the confirmed Supabase session and opens `/account`.

### Product catalog (25 products)

| Category | Products |
|---|---|
| Ron Coquí | Blanco, Limón |
| Pitorro Original | Blanco, de Coco (35%), Coco (15%), Café, Tamarindo, Parcha, Piña, Fresa, Frutas |
| Pitorro Blends | Coco Piña, Coco Almendra, Fresa Piña, Jengibre Coco, Mango Piña, Coco Fresa y Piña |
| Carjaker's | Handcrafted Rum |
| Canecas | Ron Coquí Blanco, Ron Coquí Limón |
| Miniatures | Blanco, Coco, Parcha, Tamarindo, Café |

---

## What This Site Does NOT Do

- Does **not** collect card numbers, CVV, or payment info
- Does **not** have a custom checkout form
- Does **not** store customer passwords; Supabase Auth handles account credentials
- Stores only the customer details needed for accounts and order history in protected Supabase tables
- Does **not** handle card details directly — Stripe handles payment pages and ID verification pages
- Does **not** require any API keys on the frontend

---

## Project Structure

```
/
├── index.html          # Home page
├── ron.html            # Full rum catalog (25 products, 6 categories)
├── producto.html       # Product detail (dynamic via ?id=) + add-to-cart
├── cart.html           # Shared cart and fulfillment choices
├── login.html          # Supabase Auth login
├── signup.html         # Supabase Auth signup
├── auth/callback.html  # Finishes Supabase email confirmation
├── account.html        # Customer profile
├── account/orders.html # Saved order history
├── api/                # Vercel server functions for config and Stripe
├── js/                 # Shared cart, account, and storefront scripts
├── supabase/migrations # Database schema changes
├── historia.html       # Brand story
├── tours.html          # Distillery tours
├── plaza.html          # La Plaza event space
├── img/                # Product photos and site images
├── hero-bg.mp4         # Hero background video
├── .gitignore          # Excludes node_modules, .env, build files
├── package.json        # npm scripts — serve for local dev
├── vercel.json         # Vercel config: clean URLs, caching, security headers
└── README.md           # This file
```

# Destilería Coquí — Official Website

Static HTML/CSS/JS site hosted on **Vercel**. All e-commerce (checkout, payments, card info, orders, shipping, taxes, receipts) is handled by **Stripe Payment Links**. This site collects no payment info and has no custom checkout form.

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

All 25 **Buy Online** buttons redirect to Stripe-hosted checkout. Stripe handles everything after the click: payment form, card info, receipts, shipping, and taxes.

**No API keys are stored in this site.** Payment Links are just URLs.

### How it works

1. Customer visits a product page (`producto.html?id=ron-blanco`).
2. Clicks **Buy Online**.
3. Opens a Stripe checkout page in a new tab.
4. Stripe handles the entire transaction.
5. Customer gets a receipt from Stripe.

### Where the links live

Open **`producto.html`** and search for:

```
// ─── STRIPE PAYMENT LINKS ────────────────────────────────────────────────
```

The `STRIPE_URLS` object maps all 25 product IDs to live Stripe Payment Links:

```js
const STRIPE_URLS = {
  'ron-blanco':           'https://buy.stripe.com/...',
  'ron-limon':            'https://buy.stripe.com/...',
  // ... all 25 products
};
```

### To update a payment link

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Payment Links**.
2. Find the product → copy the new URL.
3. Paste it into the matching line in `STRIPE_URLS`.
4. Commit and push — Vercel redeploys automatically.

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
- Does **not** store customer passwords or personal data
- Does **not** process payments — Stripe handles everything
- Does **not** require any API keys on the frontend

---

## Project Structure

```
/
├── index.html          # Home page
├── ron.html            # Full rum catalog (25 products, 6 categories)
├── producto.html       # Product detail (dynamic via ?id=) + Stripe links
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

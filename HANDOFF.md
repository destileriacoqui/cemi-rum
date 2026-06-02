# Destilería Coquí Website Handoff

Updated: June 2, 2026

## Current Production State

- Repository: `https://github.com/destileriacoqui/cemi-rum`
- Branch: `main`
- Production site: `https://cemi-rum.vercel.app`
- Latest deployed code commit: `be0ebaf` (`Harden admin orders and auth callbacks`)
- Latest verified Vercel deployment: `dpl_BruYBzmjuxSZMpnbPec9i4TmAu34`
- Deployment state checked after push: `READY`
- Supabase project: `autkqbfgniopxldszdur`
- Vercel project: `prj_Tqp4zZdhSn0HllZnyZzwS85amrX3`
- Vercel team: `team_braoCHaqGgScHBLekPPxbcvT`

Do not add `.claude/`, `.supply-chain-risk-auditor/`, or `vercel-backup/` to commits. They are unrelated local folders and are excluded from manual Vercel deployments through `.vercelignore`.

## Latest Commits

```text
be0ebaf Harden admin orders and auth callbacks
0c0e752 Merge tour availability into checkout endpoint to fix Vercel 12-function limit
c2460f7 Add login/cart to mobile menu, redesign barrel section with white oak content
3b7cc77 Add Saturday tour times, group booking notifications, and post-checkout account creation
9628096 Fix order thumbnail paths — prepend leading slash for relative image URLs
75b5884 Enhance saved orders page with product photos, status badges, and item details
87ae47e Harden admin sessions, throttle logins, and replace hard deletes with soft deletes
1ecd26d Document tour staff email recipients
44d3c42 Add orders@prsugar.com to tour staff emails
6b8c524 Expand staff order notification details
b7949d4 Polish pickup choices and staff order notifications
c539174 Add pickup payment choices and unified order emails
66fdee4 Keep Identity flow within Vercel route limit
13a01d3 Add express pickup ID checks and account callback
38080b9 Add Puerto Rico IVU to taxable checkouts
d1e540a Add flat shipping and paid tour bookings
c6fd153 Refresh optimized storefront asset URLs
```

## Commerce Features Completed

### Cart And Products

- Persistent localStorage cart
- Add, remove, update quantity, subtotal, and cart count in navbar
- Guest checkout supported
- Logged-in customer ID attached to orders when available
- Product images fixed for production

### Shipping Orders

- Stripe-hosted Checkout
- Shipping address collection
- Required Stripe Identity verification before shipping checkout
- Flat shipping fee: `$20` once per shipped order, regardless of bottle quantity
- Puerto Rico IVU: `11.5%`
- Shipping fee is separate and excluded from IVU
- Shipping checkout and Stripe keys remain server-side

### Pickup Orders

- Pickup checkout page: `/pickup-checkout`
- Pickup confirmation page: `/pickup-confirmation`
- Express Pickup:
  - `$5` per bottle
  - pickup target in 1 day, subject to availability
  - fee is separate and non-taxable
- Payment choices:
  - `Pay in person at pickup`
  - `Pay online now`
- `Pay online now` opens Stripe Checkout and returns to the confirmation page
- `Pay in person at pickup` skips Stripe and creates the pickup request directly
- Confirmation page displays payment method
- Admin dashboard displays payment method and payment status
- ID choices:
  - `Show a valid ID in person`
  - `Verify securely online now`
- The `Verify ID Online` button is hidden unless online verification is selected

Verified production test using two `$25` bottles with Express Pickup:

```text
Products subtotal: $50.00
Express Pickup:    $10.00
IVU:                $5.75
Total:             $65.75
```

This confirms Express Pickup is excluded from IVU.

### Tours

- Tours page collects:
  - date
  - time
  - paying adults at `$45` each
  - free children under 18
- Stripe-hosted payment
- Tour booking saved in Supabase
- Customer confirmation page
- Staff and customer confirmation emails after payment
- Saturday-specific tour times
- Availability check merged into the checkout endpoint to remain within the Vercel 12-function limit

### Admin Orders

- Admin login: `/admin/login`
- Admin dashboard: `/admin/orders`
- Hidden from public navigation
- Protected server-side cookie session
- Order filters, search, statuses, ID verification state, Express Pickup state, payment state
- Staff action buttons:
  - Mark as Ready for Pickup
  - Mark as Picked Up
  - Cancel Order
  - Mark ID Checked
  - Open Secure Payment for an unpaid pickup request
  - Remove a bottle order or tour reservation from the dashboard while retaining recoverable history
- `Copy Customer Email` was removed
- Email template selector and `Send Email to Customer` button are grouped together
- Status changes send customer pickup-ready, picked-up, or cancellation emails when Resend is configured

## Email Sender

Use this verified business sender:

```text
orders@prsugar.com
```

Expected Vercel values:

```text
RESEND_API_KEY=...
ADMIN_EMAIL_FROM=Destilería Coquí <orders@prsugar.com>
ADMIN_EMAIL_REPLY_TO=orders@prsugar.com
```

Do not paste API keys into chat.

### Bottle Order Emails

When a new bottle order is created:

- customer receives an order confirmation
- staff recipients receive an order-detail email:
  - `orders@prsugar.com`
  - `destileriacoqui07@gmail.com`
  - `maria@prsugar.com`

The staff email includes:

- order number
- created date
- order status
- customer name
- email
- phone
- pickup or shipping method
- payment method
- payment status
- products and quantities
- Express Pickup state and fee
- pickup date and time
- customer notes
- ID verification method and status
- subtotal
- IVU
- shipping
- total

### Tour Emails

Tour emails currently use `ADMIN_EMAIL_FROM`. Customer receives a confirmation. Staff notification recipients in `api/_tour-email.js` are:

```text
orders@prsugar.com
destileriacoqui07@gmail.com
maria@prsugar.com
```

`orders@prsugar.com` was added to tour staff recipients on June 1, 2026 (commit `44d3c42`), matching the bottle-order staff recipient list.

### Account Confirmation Emails

Supabase Auth account-confirmation emails are configured inside Supabase separately from the Vercel API email sender.

Recommended sender:

```text
orders@prsugar.com
```

Resend SMTP and the deployed callback were tested successfully on June 2, 2026. Keep these values configured:

```text
Site URL: https://cemi-rum.vercel.app
Redirect URL: https://cemi-rum.vercel.app/auth/callback
```

When the final custom domain is connected, add:

```text
https://destileriacoqui.com/auth/callback
```

The auth callback page already exists:

```text
auth/callback.html
js/auth-callback.js
```

The signup page now shows `Resend Confirmation Email` after signup so customers can request a fresh single-use link.

### Auth Log Evidence

Checked Supabase Auth logs again on June 2, 2026:

- one SMTP setup attempt failed with `535 Authentication credentials invalid`
- after correction, a fresh deployed-site signup succeeded
- the email confirmation link completed successfully through `https://cemi-rum.vercel.app/auth/callback`
- Supabase `/user` returned `200`
- password login returned `200`
- old links remain one-time links; reusing one correctly returns `403: Email link is invalid or has expired`

Remaining Auth dashboard hardening:

1. Enable leaked-password protection.
2. When the final domain is ready, change the Site URL to `https://destileriacoqui.com` and add `https://destileriacoqui.com/auth/callback`.

## Database

Applied Supabase migrations:

```text
supabase/migrations/20260601111500_add_express_pickup_identity_and_security.sql
supabase/migrations/20260601124500_add_pickup_payment_choice_and_order_emails.sql
supabase/migrations/20260601201500_document_non_taxable_shipping.sql
```

Main tables:

```text
profiles
orders
order_items
pickup_requests
tour_bookings
```

Important pickup/order fields added:

```text
express_pickup
express_pickup_fee
identity_verification_method
identity_verification_status
stripe_identity_verification_session_id
payment_method
payment_status
stripe_session_id
confirmation_email_status
confirmation_email_sent_at
last_customer_email_template
last_customer_email_sent_at
```

RLS was tightened. Public browser writes were removed; commerce writes happen through server routes with the Supabase service role key.

## Environment Variables

Expected Vercel variables:

```text
NEXT_PUBLIC_SUPABASE_URL=https://autkqbfgniopxldszdur.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
ADMIN_USERNAME=jessica
ADMIN_PASSWORD=...
ADMIN_USERNAME_2=...
ADMIN_PASSWORD_2=...
ADMIN_SESSION_SECRET=...
RESEND_API_KEY=...
ADMIN_EMAIL_FROM=Destilería Coquí <orders@prsugar.com>
ADMIN_EMAIL_REPLY_TO=orders@prsugar.com
```

Never expose service role, Stripe secret, webhook secret, Resend key, or admin password in frontend code.

`ADMIN_USERNAME_2` and `ADMIN_PASSWORD_2` create a second full-access staff login. Both staff accounts use the same protected dashboard and permissions.

## Stripe

- Shipping Stripe Checkout route: `api/create-checkout-session.js`
- Pickup create/confirmation route: `api/create-pickup-request.js`
- Tours Stripe Checkout route: `api/create-tour-checkout-session.js`
- Webhook route: `api/stripe-webhook.js`
- Identity helper: `api/_identity.js`

Stripe Identity actions were folded into `api/create-checkout-session.js` to stay within the Vercel serverless route count. Do not add unnecessary public API route files; shared helpers should start with `_`.

The project currently has 12 public serverless API files, which is the working limit encountered during deployment.

## Design Work Completed

- Multipage Puerto Rican rum-house design direction
- Home barrel feature restored and updated with real barrel image:

```text
img/coqui-oak-barrel-v2.webp
```

- Barrel moves subtly with cursor position
- Plaza content and private-event details updated
- Story and product presentation revised
- Product images improved and production asset URLs fixed
- Node engine pinned to `24.x` to remove Vercel automatic-major-upgrade warning

## Useful Verification Commands

```bash
cd /Users/hector/cemi-rum
git status --short
git log --oneline -8
npm run build
git diff --check
```

Production pages:

```text
https://cemi-rum.vercel.app/
https://cemi-rum.vercel.app/pickup-checkout
https://cemi-rum.vercel.app/admin/login
https://cemi-rum.vercel.app/admin/orders
```

## Next Session Priorities

1. Confirm the actual Vercel email variables match the expected `orders@prsugar.com` values. Set each variable in its own Vercel field. The sender helper now safely falls back to `Destilería Coquí <orders@prsugar.com>` if `ADMIN_EMAIL_FROM` is malformed.
2. Send one real pickup order from the website and confirm:
   - customer receives order email
   - `orders@prsugar.com` receives full staff summary
   - admin dashboard shows payment method and Express Pickup details
3. Configure and test Supabase Auth custom SMTP for account confirmations. Logs confirm this is still missing.
4. Continue remaining visual edits and tour operational details after user guidance.

## June 1 Account And Product Update

- Product detail pages now show three related bottles under `You might also like`, with product image, price, Add to Cart, and View Product actions.
- Cart checkout offers an optional `Save my details and order history` account checkbox. Guest checkout remains available.
- Optional-account passwords are removed before customer contact data is saved for pickup.
- Added and applied Supabase migration:

```text
supabase/migrations/20260601181500_claim_guest_orders_after_account_confirmation.sql
```

- The `claim_my_guest_orders()` RPC is callable only by authenticated customers. After email confirmation or login, matching guest orders are attached to that customer's account using the email in their authenticated Supabase token.
- Email sending now uses:

```text
api/_email-config.js
```

  This helper prevents malformed Vercel values from being used as the sender name and keeps the Resend key server-side.
- Security verification:
  - dependency audit: 0 vulnerabilities
  - repository scan: no private keys found in tracked frontend code
  - anonymous role cannot execute `claim_my_guest_orders()`
  - Supabase recommends enabling leaked-password protection in Auth settings

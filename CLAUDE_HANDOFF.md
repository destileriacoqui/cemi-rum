# Destileria Coqui: Claude Continuation Handoff

Updated: June 2, 2026

## Read This First

Continue from the current synced repository in:

```text
/Users/hector/cemi-rum
```

Pull `main` before editing. The Claude changes and the follow-up security reconciliation are committed, pushed, and deployed.

Do not commit or deploy these unrelated local folders:

```text
.claude/
.supply-chain-risk-auditor/
vercel-backup/
```

They are now excluded by `.gitignore` and `.vercelignore`.

Repository:

```text
https://github.com/destileriacoqui/cemi-rum
```

Current public production site:

```text
https://cemi-rum.vercel.app
```

The intended final website address is:

```text
https://destileriacoqui.com
```

The user is intentionally waiting to finish the custom-domain Auth settings until the final domain is hosted.

## User Priorities

1. Continue testing the deployed commerce flows before launch.
2. Keep customer account confirmation emails and callback handling working when the custom domain changes.
3. Keep both admin logins working with the same full access.
4. Preserve recoverable order history when staff remove an order from the dashboard.
5. Do not expose secrets in frontend code, commits, logs, or chat.

## What Is Already Live

Commerce features currently deployed:

- persistent localStorage cart
- guest checkout
- optional Supabase customer accounts
- shipping Checkout through Stripe
- `$20` shipping once per shipped order
- shipping excluded from Puerto Rico IVU
- `11.5%` Puerto Rico IVU on taxable products and tours
- pickup requests
- Express Pickup at `$5` per bottle, non-taxable
- pickup payment choice:
  - pay online now
  - pay in person at pickup
- pickup ID choice:
  - show ID at pickup
  - verify online with Stripe Identity
- paid tours at `$45` per adult; children under 18 free
- customer and staff emails through Resend server routes
- protected `/admin/login` and `/admin/orders`
- a second full-access admin login configured server-side
- unpaid pickup orders can open Stripe-hosted payment from the admin dashboard
- product recommendations under product detail pages

Latest deployed code commit:

```text
be0ebaf Harden admin orders and auth callbacks
```

Latest verified Vercel deployment:

```text
dpl_BruYBzmjuxSZMpnbPec9i4TmAu34
```

## Live Database Cleanup Completed

On June 1, 2026, unpaid test records were removed directly from Supabase:

```text
17 unpaid product orders deleted
2 unpaid tour bookings deleted
```

Verified remaining live records:

```text
orders:          1 paid
pickup_requests: 1 paid
tour_bookings:   0
```

The one paid order and its paid pickup request were intentionally preserved.

## Security Audit Summary

The user supplied a completed audit. Important verified positives:

- Semgrep: `0` findings
- npm audit: `0` vulnerabilities
- no committed private secrets found
- Stripe webhook signature verification exists
- catalog pricing is server-side
- RLS is enabled and public browser writes were removed

The current dirty-tree edits address these audit items:

1. Remove fallback from admin cookie signing secret to admin passwords.
2. Replace permanent admin deletion with recoverable soft deletion.
3. Stop constructing Stripe redirect origins from request headers.
4. Validate Supabase customer UUID values before interpolating REST paths.
5. Add basic admin login throttling.
6. Guard missing Stripe webhook environment variables before constructing Stripe.

Still optional for later:

- move staff email recipients to an environment variable
- tighten CSP away from `'unsafe-inline'`
- decide whether malformed email sender configuration should fail loudly
- replace the `serve` dev dependency with `sirv-cli` if desired

## Synced Security-Hardening Files

These files are committed and deployed:

```text
.env.example
admin/admin-orders.js
api/_admin-login-rate-limit.js
api/_admin.js
api/_site-url.js
api/admin/login.js
api/admin/orders.js
api/config.js
api/create-checkout-session.js
api/create-pickup-request.js
api/create-tour-checkout-session.js
api/stripe-webhook.js
auth/callback.html
js/auth-callback.js
js/supabase-client.js
supabase/migrations/20260601224500_add_recoverable_admin_deletion.sql
```

### Admin Session Hardening

`api/_admin.js` now requires:

```text
ADMIN_SESSION_SECRET
```

It no longer falls back to either admin password. The value must be at least `64` characters.

### Admin Login Throttle

New helper:

```text
api/_admin-login-rate-limit.js
```

It limits each IP to `8` failed login attempts per `10` minutes. This is process-local serverless throttling. It is useful baseline protection, but a durable shared store such as Upstash Redis would be stronger at higher scale.

### Canonical Redirect Address

New helper:

```text
api/_site-url.js
```

Stripe and account callback redirects now use:

```text
SITE_URL
```

instead of trusting `Host` and `x-forwarded-proto`.

Production Vercel currently has:

```text
SITE_URL=https://cemi-rum.vercel.app
```

When the custom domain is ready, change this to:

```text
SITE_URL=https://destileriacoqui.com
```

### Recoverable Admin Removal

New migration:

```text
supabase/migrations/20260601224500_add_recoverable_admin_deletion.sql
```

The migration adds:

```text
orders.deleted_at
pickup_requests.deleted_at
tour_bookings.deleted_at
```

It has already been applied to the live Supabase project:

```text
autkqbfgniopxldszdur
```

The admin route now soft-deletes records by setting `deleted_at`. Dashboard queries omit soft-deleted records. The UI wording now says `Remove Order` and `Remove Tour`, and explains that retained history can be recovered.

### Customer UUID Validation

`js/supabase-client.js` now validates customer user IDs as UUIDs before inserting them into Supabase REST filters.

### Stripe Webhook Guard

`api/stripe-webhook.js` now checks both:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

before constructing Stripe or verifying an event.

## Account Confirmation: Live Verification

Customer account signup and confirmation now work on the deployed Vercel site.

Supabase Auth logs were inspected again on June 2, 2026. Evidence:

- one SMTP setup attempt failed with:

```text
535 Authentication credentials invalid
```

- after the SMTP correction, a fresh signup completed on the deployed site
- its email link completed through:

```text
https://cemi-rum.vercel.app/auth/callback
```

- Supabase `/verify` returned `303`
- Supabase `/user` returned `200`
- password login returned `200`
- old confirmation links remain one-time links; reusing one correctly returns:

```text
403: Email link is invalid or has expired
One-time token not found
```

The normal Supabase implicit confirmation flow is therefore verified. Use only the newest confirmation link once when testing.

### Local Callback Improvements Already Added

The dirty tree updates:

```text
auth/callback.html
js/auth-callback.js
js/supabase-client.js
```

Changes:

- signup and resend redirects use `SITE_URL` returned by `/api/config`
- callback still accepts the existing implicit hash token
- callback also accepts a `token_hash` verification format
- expired-link errors now guide users to request a fresh confirmation email
- the error page links back to signup so the user can resend

The deployed Supabase flow currently uses the implicit callback and is verified. The dirty tree also accepts a `token_hash` callback for compatibility. If the project is intentionally switched to PKCE `?code=...` later, add a supported code exchange flow at that time.

## Supabase Dashboard Configuration

The deployed signup and confirmation flow is working. Keep the current SMTP and callback values configured:

### Authentication SMTP

Use Resend SMTP:

```text
Host: smtp.resend.com
Username: resend
Password: paste the Resend API key directly in Supabase; do not paste it into chat
Sender email: orders@prsugar.com
Sender name: Destileria Coqui
```

### Authentication URL Configuration

For the current deployed testing domain:

```text
Site URL: https://cemi-rum.vercel.app
Redirect URL: https://cemi-rum.vercel.app/auth/callback
```

When the final custom domain is ready:

```text
Site URL: https://destileriacoqui.com
Redirect URL: https://destileriacoqui.com/auth/callback
```

Keep the Vercel callback allow-listed during transition if it is still used for testing.

### Authentication Security Still Required

Enable Supabase leaked-password protection:

```text
Authentication -> Security -> Leaked Password Protection
```

## Vercel Configuration State

Confirmed encrypted Vercel Production variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
ADMIN_USERNAME
ADMIN_PASSWORD
ADMIN_USERNAME_2
ADMIN_PASSWORD_2
ADMIN_SESSION_SECRET
RESEND_API_KEY
ADMIN_EMAIL_FROM
ADMIN_EMAIL_REPLY_TO
SITE_URL
```

Never print or commit their values.

`ADMIN_SESSION_SECRET` was replaced on June 1, 2026 with a newly generated server-only random secret. Existing admin sessions should be expected to log in again after deployment.

Preview environment note:

- `SITE_URL` was successfully added to Production.
- Adding `SITE_URL` to Preview was not completed because the Vercel CLI requested an explicit Git branch choice.
- Production is the immediate requirement.
- If previews are needed, add a Preview `SITE_URL` intentionally for the chosen branch or all preview branches.

## Admin Accounts

Both admin accounts are configured in Vercel through encrypted server-only environment variables:

```text
ADMIN_USERNAME / ADMIN_PASSWORD
ADMIN_USERNAME_2 / ADMIN_PASSWORD_2
```

Do not write their credential values into source files or documentation.

Both accounts should have the same full dashboard permissions:

- review orders and tours
- update statuses
- mark ID checked
- send customer emails
- open Stripe-hosted payment for unpaid pickup requests
- remove orders and tours from the dashboard while retaining history

## Supabase Security Advisor State

The latest security advisor scan reported:

1. `pickup_requests`: RLS enabled with no public policy.
2. `tour_bookings`: RLS enabled with no public policy.
3. `claim_my_guest_orders()`: authenticated users can execute a SECURITY DEFINER function.
4. leaked-password protection disabled.

Items 1 and 2 are intentional because writes happen through protected server routes using the service-role key.

Item 3 is intentional: the RPC links a signed-in customer's matching guest orders by the email contained in their authenticated JWT. Anonymous execution was revoked. Review again before scaling, but do not remove it without replacing the account-order linking behavior.

Item 4 still needs to be enabled manually in Supabase.

## June 2 Sync Verification

Verified after reconciling the Claude session:

- Claude pushed commits `87ae47e` through `0c0e752`
- the follow-up hardening reconciliation was rebased onto Claude's work and pushed as `be0ebaf`
- Vercel production deployment `dpl_BruYBzmjuxSZMpnbPec9i4TmAu34` is `Ready`
- syntax checks passed
- static build passed
- `npm audit --omit=dev --audit-level=high` returned `0 vulnerabilities`
- tracked secret scan returned no exposed secrets
- Vercel public API route count remains `12`
- both configured admin credential slots validate server-side
- recoverable deletion migration is applied live
- one paid order and its paid pickup request remain active
- one unpaid pickup test, its pickup request, and one unpaid tour test were soft-deleted after verification

GitHub and Vercel are synced again.

## Exact Resume Steps

1. Pull and inspect the working tree:

```bash
cd /Users/hector/cemi-rum
git pull --ff-only
git status --short --branch
git diff --check
```

2. Re-run syntax checks:

```bash
node --check api/_site-url.js
node --check api/_admin-login-rate-limit.js
node --check api/_admin.js
node --check api/admin/login.js
node --check api/admin/orders.js
node --check api/config.js
node --check api/create-checkout-session.js
node --check api/create-pickup-request.js
node --check api/create-tour-checkout-session.js
node --check api/stripe-webhook.js
node --check js/supabase-client.js
node --check js/auth-callback.js
node --check admin/admin-orders.js
npm run build
npm audit --omit=dev --audit-level=high
```

3. Consider whether to add PKCE `?code=` callback support before deploying.

4. Confirm no secrets are tracked:

```bash
git grep -nE 'sk_live_|whsec_|service_role|re_[A-Za-z0-9_-]{16,}|ADMIN_PASSWORD=.+' -- .
```

5. Commit only the intended files. Exclude unrelated folders:

```text
.claude/
.supply-chain-risk-auditor/
vercel-backup/
```

6. Push `main`, wait for the Vercel Production deployment to reach `Ready`, then verify:

```text
https://cemi-rum.vercel.app/admin/login
https://cemi-rum.vercel.app/admin/orders
https://cemi-rum.vercel.app/signup
https://cemi-rum.vercel.app/auth/callback
```

7. After the user configures Supabase Auth SMTP and URL settings, create a brand-new test customer email address. Use only the newest confirmation link once. Verify successful redirect to:

```text
https://cemi-rum.vercel.app/account
```

8. Test an unpaid pickup request:

- open it in `/admin/orders`
- click `Open Secure Payment`
- confirm Stripe Checkout opens
- do not complete a real payment unless the user approves

9. Test admin removal with a disposable unpaid request:

- remove from dashboard
- confirm it disappears
- confirm the row still exists in Supabase with a non-null `deleted_at`

## Existing Main Handoff

The older broad project handoff remains available:

```text
HANDOFF.md
```

Use this file first for the current continuation. Use `HANDOFF.md` for broader historical context.

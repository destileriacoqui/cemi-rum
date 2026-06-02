# Destileria Coqui: Claude Continuation Handoff

Updated: June 2, 2026, after an interrupted performance-optimization pass.

## Start Here

Repository:

```text
/Users/hector/cemi-rum
https://github.com/destileriacoqui/cemi-rum
```

Branch:

```text
main
```

Public Vercel site:

```text
https://cemi-rum.vercel.app
```

Final intended domain:

```text
https://destileriacoqui.com
```

Domain note verified on June 2, 2026:

```text
https://destileriacoqui.com
```

still routes through Wix infrastructure. Until the DNS connection is intentionally
changed, use:

```text
https://cemi-rum.vercel.app
```

for Vercel production QA. Do not treat the Wix-served custom domain as proof that
the Vercel deployment is stale.

Read `HANDOFF.md` as the full commerce, Supabase, Stripe, email, admin, and domain history. This file is the current continuation note and supersedes older status claims in prior handoffs.

IMPORTANT: Work from the existing local folder, not from a fresh GitHub clone. GitHub
and Vercel are synced to the deployed baseline, but the unfinished performance pass
below exists only in this local worktree.

## Mandatory Workspace Preflight Before Editing

There has already been one confirmed stale-checkout incident. A Claude session on
another computer edited:

```text
/Users/mariacristinamoralestapia/caudenoc
```

That checkout reported:

```text
0c0e752
```

as its current commit. It is an older ancestor of the active GitHub `main`, not the
newest source. It also lacked newer visual work such as the official SVG logo and
the footer `Find Us` location control.

Before changing any file, run:

```bash
cd /Users/hector/cemi-rum
git fetch origin main --prune
git rev-parse --short HEAD
git rev-parse --short origin/main
git log --oneline -12 origin/main
rg -n "Find Us" index.html plaza.html
rg -n "destileria-coqui-logo\.svg" index.html plaza.html admin/login.html
```

Expected before editing on Hector's Mac:

```text
HEAD:        de0aa35
origin/main: de0aa35
```

The log must include:

```text
de0aa35 Refresh customer sessions and align rum catalog
58e6f7e Use crisp official logo across site
e214860 Add location section to plaza, Find Us footer dropdown, and contact form emails
```

The `rg` checks must find both the official SVG references and the `Find Us`
controls. If any check differs, stop. Do not edit, commit, or deploy from that
checkout until it has been refreshed from GitHub or the correct local workspace
has been opened.

If working from another computer, do not assume its clean checkout is current.
Fetch first and fast-forward to `origin/main`. The unfinished performance work
documented below lives only in `/Users/hector/cemi-rum` until it is validated and
published.

Do not commit secrets. Do not expose values for:

```text
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
ADMIN_PASSWORD
ADMIN_PASSWORD_2
ADMIN_SESSION_SECRET
MAINTENANCE_OWNER_PASSWORD
```

## Deployed Production Baseline

Production and GitHub `main` are currently synced at:

```text
de0aa35 Refresh customer sessions and align rum catalog
```

The latest deployed Vercel production deployment was:

```text
dpl_9wcRCgNrcr7YBjCvt4zhXjYSvk3K
https://cemi-qbvojr980-destileria-coqui.vercel.app
```

Vercel inspector reported:

```text
target: production
status: Ready
alias: https://cemi-rum.vercel.app
alias: https://destileriacoqui.com
alias: https://www.destileriacoqui.com
```

### What `de0aa35` Fixed

1. Customer account pages no longer expose raw `JWT expired` errors during ordinary session expiry.
   - `js/supabase-client.js` now refreshes an expiring Supabase access token with the saved refresh token.
   - If refresh fails, the saved session is removed and the user receives a clean login-again message.
   - A simulated expired-JWT retry test passed locally.

2. Ron Coqui storefront bottle image was restored.
   - `ron.html` now uses `img/ron-blanco-store.webp`.

3. Pitorro de Coco 35% bottle was normalized and cache-busted.
   - New live asset: `img/pitorro-coco-35-store-v2.webp`
   - References updated in:
     - `ron.html`
     - `producto.html`
     - `js/catalog.js`

4. The `Pitorro® Original`, `Pitorro® Blends`, and `Pitorro® Miniatures` category headings keep the registered mark attached to the word instead of allowing flex spacing to separate it.

5. The official SVG logo is used throughout the site. Recent production commits immediately before `de0aa35` include:

```text
58e6f7e Use crisp official logo across site
d5a78d3 Replace admin text brand with logo image
29c9981 Replace logo with higher quality version
```

### Logo Cache Verification And Required Cache Bust

Verified on June 2, 2026:

```text
local img/destileria-coqui-logo.svg SHA-256:
bec96153c703cac7f5c00a410c06b4c9eb0704a7064f42598cedadd4c629d995

GitHub main img/destileria-coqui-logo.svg SHA-256:
bec96153c703cac7f5c00a410c06b4c9eb0704a7064f42598cedadd4c629d995
```

The official logo file is already present in local code and GitHub. However, all
pages still request the same URL:

```text
/img/destileria-coqui-logo.svg
```

`vercel.json` caches `/img/*` with:

```text
Cache-Control: public, max-age=31536000, immutable
```

That means a browser which previously loaded an older logo can keep displaying it
for up to one year even after the logo artwork changes. Cache busting remains a
required precaution before the next deployment.

However, cache is not a complete explanation for the prior stale Claude session:
that session was also missing the newer `Find Us` location control. If both the
old logo and missing location controls appear together, treat the checkout or
deployment as outdated and run the mandatory preflight above before editing.

Before the next production deployment:

1. Copy the existing official SVG without modifying its artwork:

```text
img/destileria-coqui-logo.svg
-> img/destileria-coqui-logo-v2.svg
```

2. Update every live HTML page and Wix embed reference to use:

```text
img/destileria-coqui-logo-v2.svg
```

or:

```text
/img/destileria-coqui-logo-v2.svg
```

3. Keep the existing official SVG source in GitHub.
4. Verify header, footer, maintenance page, customer account pages, and admin pages.

This is a URL cache-busting change, not a logo redesign.

Older PNG source files still exist in the repository:

```text
img/destileria-coqui-logo.png
img/destileria-coqui-wordmark.png
```

They are not referenced by the live pages. Do not treat their presence in GitHub as
evidence that the website is using the old logo, and do not switch pages back to
those PNG files. The live source of truth is the official SVG.

## User's Newly Reported Live Visual Bug

The user interrupted the performance pass with this exact message:

```text
look at what happens
```

They attached:

```text
/Users/hector/Library/Containers/com.apple.Notes/Data/tmp/TemporaryItems/NSIRD_Notes_beNdal/HardLinkURLTemp/1682BC2F-F721-49C2-A9F7-FF41CEC5891E/1780421415/a Puerto.jpeg
```

The image was taken from the live Vercel site on a Windows laptop:

```text
https://cemi-rum.vercel.app
```

Visible problem:

- At that laptop viewport, the large header logo and the hero eyebrow metadata occupy the same horizontal area.
- The eyebrow line beginning with `Destileria Coqui, Inc. · Mayaguez, Puerto Rico · Est. 2006` visually runs behind or into the logo.
- This must be fixed responsively before deploying the performance changes.
- Preserve the official logo and current hero design. Adjust responsive layout, nav sizing, hero content top/bottom spacing, or eyebrow width/placement as needed.
- Verify at laptop widths and shorter viewport heights, not only a tall desktop screenshot.

## Local Dirty Worktree: Performance Optimization In Progress

IMPORTANT: The changes below are local only. They have NOT been committed, pushed, or deployed.

Current dirty files:

```text
M  .vercelignore
M  index.html
M  package.json
M  plaza.html
M  vercel.json
M  wix-historia-embed.js
M  wix-home-embed.js
M  wix-plaza-embed.js
?? hero-bg-lite.mp4
?? img/coqui-plaza-bar.webp
?? img/event-fango-fest.webp
?? img/hero-poster.webp
?? scripts/build-static.mjs
```

Do not discard these changes. Review them, finish validation, fix the reported overlap, then commit and deploy intentionally.

### Why This Pass Was Started

The user reported that the site felt too heavy on weak Wi-Fi or less powerful devices and asked whether a Vercel plan upgrade was needed.

Measured visitor-facing bottlenecks:

```text
hero-bg.mp4                9107.0 KB
img/coqui-plaza-bar.png    2485.9 KB
img/event-fango-fest.png   2372.1 KB
```

The homepage autoplayed the 9.1 MB hero video immediately. This is a frontend payload issue first, not a Vercel plan issue.

### Generated Optimized Assets

These local assets were generated:

```text
hero-bg-lite.mp4                 1665.2 KB
img/hero-poster.webp               40.8 KB
img/coqui-plaza-bar.webp          139.0 KB
img/event-fango-fest.webp         320.4 KB
```

Measured savings:

```text
Normal hero path: 9107.0 KB -> 1706.0 KB  (81.3% smaller, including poster)
Slow hero path:   9107.0 KB ->   40.8 KB  (99.6% smaller)
Lower images:     4858.0 KB ->  459.4 KB  (90.5% smaller)
```

### Local `index.html` Changes

The homepage now:

1. Shows `img/hero-poster.webp` immediately.
2. Loads `hero-bg-lite.mp4` only for devices that are not:
   - using reduced-motion preferences
   - on a Data Saver or effective 2G connection
   - reporting 2 GB or less memory
   - reporting 2 CPU cores or fewer
3. Uses `content-visibility: auto` for lower homepage sections.
4. Disables the fixed noise overlay and collapses animations for reduced-motion users.
5. Throttles parallax scroll work through `requestAnimationFrame`.
6. Uses WebP versions of the Plaza and Fango Fest images.

### Other Local Reference Updates

Compressed WebP references were updated in:

```text
plaza.html
wix-home-embed.js
wix-historia-embed.js
wix-plaza-embed.js
```

### Visual Tests Already Completed

Local browser screenshots were rendered successfully:

```text
/Users/hector/Documents/Codex/2026-05-31/hey-can-you-access-my-pc/qa-performance/home-normal.png
/Users/hector/Documents/Codex/2026-05-31/hey-can-you-access-my-pc/qa-performance/home-slow-mobile.png
/Users/hector/Documents/Codex/2026-05-31/hey-can-you-access-my-pc/qa-performance/plaza.png
```

Observed behavior:

- Normal desktop requested `hero-bg-lite.mp4`.
- Simulated 2G mobile rendered the poster and did not request any video.
- Homepage design remained intact.
- Plaza design remained intact after WebP conversion.

### Static Publishing Cleanup Started But Not Fully Validated

The repo previously deployed the entire project root because `vercel.json` used:

```json
"outputDirectory": "."
```

That caused Vercel output to include archived backups and large raw PNG design sources that visitors do not need.

Local changes now add:

```text
scripts/build-static.mjs
```

and change:

```json
package.json: "build": "node scripts/build-static.mjs"
vercel.json:   "outputDirectory": "dist"
```

The script prepares a lean static `dist/` folder containing live pages, scripts, and optimized image formats while preserving source assets in GitHub.

Local verification completed:

```text
npm run build
Prepared static site in dist/
Dist size: 17M
Dist files: 96
PNG files in dist: 0
Old hero in dist: no
Lite hero in dist: yes
API source still present in repository: yes
```

IMPORTANT: The user interrupted before `npx vercel build --yes` was rerun after changing the output directory to `dist`. That is the next required packaging validation.

Before deploying:

1. Run `npm run build`.
2. Run `npx vercel build --yes`.
3. Confirm `.vercel/output` contains:
   - static website from `dist`
   - serverless `/api` routes
   - middleware
   - no `vercel-backup/`
   - no raw `img/*.png`
   - no original `hero-bg.mp4`
4. Confirm checkout, pickup, tour, account, and admin routes still package correctly.
5. Fix and visually verify the newly reported logo/eyebrow overlap.
6. Render homepage at:
   - wide desktop
   - shorter laptop viewport
   - mobile
   - simulated slow connection
7. Run `git diff --check`.
8. Commit, push `main`, deploy production, and inspect Vercel `Ready`.

9. After deployment, open the production URL in a normal browser and verify that the
   newly versioned logo URL loads. Shell `curl` requests to the public alias currently
   receive a Vercel Security Checkpoint `429`, so use a browser for final visual QA.

## Important Production Features To Preserve

The existing website already includes:

- persistent cart
- guest checkout
- optional Supabase customer accounts
- Stripe shipping checkout
- flat `$20` shipping fee once per shipped order
- Puerto Rico IVU at `11.5%` on products and tours, excluding shipping
- pickup requests
- Express Pickup at `$5` per bottle, non-taxable
- pickup payment choice: pay online now or pay in person
- pickup ID choice: show ID in person or verify through Stripe Identity
- tours at `$45` per paying adult, under 18 free
- Supabase storage for profiles, orders, order items, pickup requests, and tours
- protected `/admin/login` and `/admin/orders`
- recoverable soft deletion for admin order removal
- Resend customer and staff email notifications
- staff recipients:
  - `orders@prsugar.com`
  - `destileriacoqui07@gmail.com`
  - `maria@prsugar.com`
- auth callback at `/auth/callback`
- maintenance middleware and temporary owner bypass support

See `HANDOFF.md` for table fields, environment variable names, migrations, and detailed commerce notes.

## Remaining Configuration Notes

When the final domain is ready:

1. Set Vercel:

```text
SITE_URL=https://destileriacoqui.com
```

2. Update Supabase Auth:

```text
Site URL: https://destileriacoqui.com
Redirect URL: https://destileriacoqui.com/auth/callback
```

3. Keep the Vercel preview callback during transition if previews are still tested:

```text
https://cemi-rum.vercel.app/auth/callback
```

4. Enable Supabase leaked-password protection when ready.

5. Do not upgrade Vercel merely to compensate for frontend payload. Finish and measure the local optimization pass first.

## Useful Commands

```bash
cd /Users/hector/cemi-rum
git status --short
git diff --check
npm run build
npx vercel build --yes
npx vercel --prod --yes
```

## Local QA Server

A local `serve` process may still be running on:

```text
http://localhost:4242
```

Stop it when finished testing.

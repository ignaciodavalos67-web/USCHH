# Persistent shopping cart — Phase 3

## Scope
Client-side cart only. No checkout, order creation, payments, admin, emails, shipping integration, or inventory writes. Homepage scenes, GSAP and ScrollTrigger were not modified.

## Architecture and storage
Root CartProvider owns cart state across routes. Pure cart functions implement parsing, add/update/remove, reconciliation, per-flavor limits, unit counts, and integer-cent display totals. The versioned localStorage key is uschh.cart.v1. Stored items contain only id, slug, quantity; no customer information, price, stock, or totals. Corrupt entries are discarded, quantities sanitized, duplicate identifiers combined, and blocked storage is handled without breaking the session. Storage events synchronize tabs.

## Reconciliation
GET /api/cart/products uses the existing server-only Prisma storefront and sends Cache-Control: no-store. No browser Supabase connection exists. Refresh occurs for a nonempty restored cart, opening the drawer, each add attempt, storage updates, and window focus after 60 seconds. Concurrent reads are deduplicated. Price always comes from the refreshed response; reduced stock clamps valid quantities with notification. Unavailable, inactive, missing, or replaced-id lines remain removable, are labeled unavailable, and suppress valid cart totals. Failed reads hide previously loaded commerce data, disable quantity changes, and expose a safe retry. No persistent snapshot authorizes a purchase.

## Quantity and money
Effective quantity ceiling is min(5, stock), aggregated per flavor. Five units of each flavor is permitted. Zero is rejected by quantity controls; removal is explicit. Add rechecks current server products before accepting. Price strings are converted to integer cents only for display calculations. Subtotal >= 3000 cents displays ENVÍO GRATIS; below it displays ENVÍO PAGADO AL RECIBIR and explains that shipping is excluded. No unknown delivery fee is added. Checkout stays disabled until Phase 4.

## Interface
Existing detail pages have a quantity selector for purchasable products and a disabled AGOTADO/NO DISPONIBLE button otherwise. Successful add opens the drawer. Navbar adds a total-unit cart entry beside the existing hamburger. Drawer uses brand CSS variables, real product imagery, native modal dialog, explicit focus wrapping, Escape/close, restored focus and document/body scroll restoration. Drawer contents scroll below the fixed header. /carrito provides the same management controls, totals, and empty-state product link. Mobile fits the viewport without horizontal overflow.

## Files created
- src/lib/cart/cart.ts
- src/lib/cart/cart.test.ts
- src/components/cart/CartProvider.tsx
- src/components/cart/CartContents.tsx
- src/components/cart/CartDrawer.tsx
- src/components/cart/AddToCart.tsx
- src/components/cart/cart.module.css
- src/app/api/cart/products/route.ts
- src/app/carrito/page.tsx
- docs/commerce-phase-3.md

## Files modified in this phase
- src/app/layout.tsx: provider
- src/app/productos/[slug]/page.tsx: add control
- src/components/layout/Navbar.tsx: cart entry/count
- package.json: include cart tests

## Validation
All 15 automated tests pass, including eight cart tests covering add, second flavor, increase/decrease/removal, persistence validation, flavor/stock limits, exact totals, shipping threshold, badge, and stale price/availability. TypeScript, ESLint and production build pass. Production Chromium checks at 1440px and 390px verify empty state, real disabled sold-out add controls, drawer viewport/background, keyboard wrapping, Escape, focus/scroll restoration, hamburger compatibility, quantity controls and limits, reload persistence, shipping, stale price and zero stock, removal, and no page exceptions or cart-page horizontal overflow. Available-product browser tests use intercepted catalog fixtures only. Browser close/reopen with the same profile preserves the cart. A mocked 503 reconciler response suppresses stale price and quantity controls, preserves removal, and shows retry.

Live Supabase reads through DATABASE_URL and DIRECT_URL confirm both products still cost USD 15.00, are active, stock 0 and not purchasable. No stock was seeded or changed; orders, payments, inventory movements, admins and marketing contacts remain empty.

## Phase 4 boundary
No technical blocker identified. Phase 4 must implement checkout and re-read products, enforce per-flavor/stock rules, and recalculate all authoritative monetary/shipping totals on the server. Browser totals and stored ids/quantities are untrusted input; a preflight read never reserves inventory. Phase 4 has not started.

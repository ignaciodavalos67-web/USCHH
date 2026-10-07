# Storefront database integration — Phase 2

Phase 2 supersedes the Phase 1 rollout gate: COMMERCE_DATABASE_READY is no longer read. The storefront always reads PostgreSQL via the existing server-only Prisma access. Seed data is used only for database provisioning, never as a storefront fallback.

The listing reads getProducts() at request time and applies only the existing image/background mapping, in Limón then Mandarina order. Details use getProductBySlug(). Missing products produce 404; inactive products remain visible as NO DISPONIBLE. Active products with stock 0 show AGOTADO. Existing links are informational; there are no purchase or cart controls.

The product output contains database id, slug, name, flavor, currency, stock, active, purchasable, exact unitPrice decimal string, formatted price, and visual image/background. Prisma Decimal is formatted on the server. Future cart or checkout must re-read authoritative prices and availability, never trust a browser snapshot.

Database read failures return an explicit unavailable result. Both pages show a generic catalog unavailable message without product prices, purchase actions, raw errors, or credentials.

Validation completed against Supabase: both products are active, USD 15.00, stock 0, not purchasable. No database writes were made in Phase 2. TypeScript, ESLint, all seven commerce tests, and production build passed. Chromium checked the three routes at 1440px and 390px, verifying price, AGOTADO, order, absence of purchase actions, no horizontal overflow, and no browser exceptions. Unknown slug returned 404. A separate local production process with an intentionally unreachable database verified safe outage behavior on all three routes, without changing .env or Supabase data.

No Phase 3 functionality has been started. No technical blocker identified for Phase 3; inventory remains intentionally zero.

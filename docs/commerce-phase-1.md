# E-commerce foundation — Phase 1

> Phase 2 supersedes the rollout gate and provisional catalog described below. See [commerce-phase-2.md](commerce-phase-2.md); the storefront now always reads PostgreSQL.

## Scope and current rollout

Prisma ORM 7, PostgreSQL, `prisma7.config.ts`, the `prisma-client` generator,
`src/generated/prisma`, and the existing `pg`/PrismaPg pool remain in use.
No checkout, cart, payment/courier integration, email, customer accounts, admin UI,
or authentication flow has been implemented. Existing visual components remain unchanged.

Both Supabase connections have been authenticated and verified. Read-only inspection
confirmed that the public application schema contained no tables before deployment.
The initial commerce migration and the private-access migration have both been applied
successfully. Prisma reports the database schema up to date.

The seed has executed successfully. Limón and Mandarina were verified through both
DIRECT_URL and DATABASE_URL: price 15.00 USD, stock 0, active true, not purchasable.
No orders, payments, admins, inventory movements or marketing contacts were seeded.
Local COMMERCE_DATABASE_READY=true now routes the storefront to PostgreSQL.

The storefront preserves its existing presentation while `COMMERCE_DATABASE_READY`
is absent or `false`. Its initial price comes from the single seed catalog in
`prisma/catalog.ts`, not a duplicated UI price. Once migrated and seeded, set
`COMMERCE_DATABASE_READY=true` to read names, flavors, price, currency, stock, and
active state from PostgreSQL on every request. Database failures in enabled mode
are not silently replaced with seed prices. Visual assets stay in `src/lib/products.ts`.
The provisional catalog cannot authorize a purchase: strict purchase access always
queries PostgreSQL; provisional entries are marked non-purchasable.

## Supabase connection routing

Prisma 7 CLI reads `datasource.url` in `prisma7.config.ts`. It now prefers
`DIRECT_URL`, falling back to `DATABASE_URL` only for environments that do not
provide a separate connection. Do not add the obsolete `directUrl` schema field.
With Supabase, use a session pooler (5432) or direct endpoint for migrations.
The seed uses the same DIRECT_URL preference. The application retains DATABASE_URL
through the existing PrismaPg/pg adapter; no generator or infrastructure was replaced.

Both paths now authenticate. Database credentials remain only in the ignored local
.env and must be provided separately in the intended deployment environment.
The official Supabase CA was used in a verified-TLS diagnostic without disabling
certificate checks. No credentials or connection strings were printed.

References: [Prisma 7 connection configuration](https://docs.prisma.io/docs/guides/upgrade-prisma-orm/v7),
[Supabase Prisma connections](https://supabase.com/docs/guides/database/prisma).

## Installation / rollout

1. Configure `DATABASE_URL` and `DIRECT_URL` in the intended environment; never commit credentials.
2. Inspect the target database's tables, data, migration history, and schema. If existing
   app tables conflict, reconcile/baseline intentionally; do not reset or drop tables.
3. Review both migrations under `prisma/migrations/`.
   The first creates the tables/enums/indexes/constraints. The second enables RLS and
   revokes browser-role access only on the commerce tables/sequence. Neither deletes data.
4. After confirming the target is compatible, run `npm run db:status`, then
   `npm run db:deploy`. This is an explicit operation, NOT part of the Vercel build.
5. Run `npm run db:generate` and `npm run db:seed`.
6. Set real initial stock through a controlled administrative process. Newly seeded
   products have stock **0** and cannot be purchased. No stock number is invented.
7. Set `COMMERCE_DATABASE_READY=true` in the intended deployment environment.
   Validate both `/productos/limon` and `/productos/mandarina` before promoting it.

`npm run build` still only generates the client and builds Next.js. It does not
migrate or seed any database. The seed uses a transaction and upsert with an empty
update: reruns preserve existing prices, stock, names, and active state. It creates
only Limón and Mandarina at 15.00 USD, never customer orders, sales, or admin accounts.

## Data model

- **Product**: unique slug, name, canonical flavor, optional description,
  Decimal(12,2) price, currency, nonnegative stock, active state, timestamps.
- **Order**: unique internal id and PostgreSQL-generated numeric sequence. Display
  using `formatOrderNumber` (e.g. `USCHH-000124`). Sequence gaps are expected;
  never use a client counter or row count. Guest customer/contact/address fields,
  optional delivery instructions, money, shipping mode, carrier/tracking, workflow
  and paid/shipped/delivered/cancelled/refunded timestamps support exports/analytics.
- **OrderItem**: product reference and immutable purchase snapshots of name, flavor,
  price, quantity, line total; inventory deduction/restoration timestamps.
  One row per product and per canonical flavor per order; quantity 1–5.
- **Payment**: many attempts per order, method/status distinct from order workflow,
  optional provider/reference, unique idempotency key, exact amount/currency,
  payment/refund/manual verification timestamps and optional verifying admin.
  No sensitive card data or provider-specific contract is stored.
- **InventoryMovement**: signed delta, resulting stock, type, product/order item,
  optional admin/reason, timestamp. Unique order-item/type prevents duplicate
  SALE and duplicate CANCELLATION entries. Adjustments require an admin and reason.
- **OrderNote**: separate private content with author and timestamp. Never map
  notes into delivery instructions or customer-facing responses.
- **AdminUser**: unique email, optional name and passwordHash, active state,
  timestamps. Disabled by default, with no seeded credentials. Authentication and
  secure hash creation/verification are deferred to Phase 5.
- **MarketingContact**: current consent state defaults to NOT_GRANTED; email,
  source/text/version, consent and withdrawal timestamps.
- **MarketingConsentEvent**: append-only event history for grants, withdrawals,
  and non-grants, including source/text/version/timestamp.

Relations to financial history use RESTRICT. Deactivate products/admins rather
than deleting referenced records. The migration adds PostgreSQL CHECK constraints
for nonnegative stock/money, quantities, line/total consistency, shipping ambiguity,
restoration timestamps, payment timestamps, and consent traceability. These custom
constraints are not represented by Prisma attributes: preserve them in future migrations.

## Supabase private-table access

The default Supabase grants exposed SELECT access to anon/authenticated roles on the
new public commerce tables. The additive private-access migration enables RLS with
no browser-facing policies and revokes all table/sequence permissions from PUBLIC,
anon and authenticated. It only affects the nine commerce models and Order_number_seq;
Supabase Auth/Storage tables and other infrastructure are untouched. Roles are guarded
for portability to PostgreSQL installations without Supabase roles.

Both Prisma connection paths still read the products successfully. RLS is enabled on
all nine tables and browser SELECT privileges are absent. Eighteen read attempts
(nine tables for each role) returned permission denied in rolled-back test transactions.
Future storefront/admin functionality must continue through authorized server code;
no generic customer-facing Supabase policy may expose notes, hashes, orders or consent.

## Money and shipping

All stored money uses Decimal(12,2); pass decimal strings/Prisma.Decimal, never a
floating-point browser amount. Currency defaults to USD without locking future
schema expansion to a particular shipping region. Address fields are ordinary
strings; Quito/valley delivery coverage must be validated by a future server policy.

The current USD rule in `calculateShipping` is:

- subtotal >= 30.00: FREE, shippingAmount = 0.00;
- subtotal < 30.00: PAY_ON_DELIVERY, shippingAmount = null (courier rate unknown);
- CALCULATED: future explicit nonnegative shippingAmount.

For PAY_ON_DELIVERY, `total` is the amount collected by USCHH (subtotal); it excludes
an unknown courier fee paid directly on delivery. Do not interpret null as free.
For calculated shipping, total = subtotal + shippingAmount. Do not invent a rate.

## Boundaries for later phases

`src/server/commerce/products.ts` is server-only strict database access. No public
write endpoint exists. `requirePurchasableProduct` validates active, stock and 1–5
quantity; `assertFlavorQuantities` aggregates by the server-resolved canonical flavor.
A read alone is NOT an inventory reservation or authorization to collect payment.

Future checkout must load products from PostgreSQL and derive snapshots/totals/
shipping itself. Ignore client prices, stock, availability, totals, eligibility and
payment status. Aggregate duplicate flavor lines before storing the order.

Future payment confirmation/cancellation must use a Prisma transaction:

1. Validate the provider callback or an authenticated manual transfer verification.
2. Claim the payment event idempotently; lock/conditionally update the order/item.
3. For a first deduction, decrement only where product.stock >= quantity and active
   is true; require exactly one updated row. Append the unique SALE movement and
   set inventoryDeductedAt in the SAME transaction. Roll back everything on failure.
4. On qualifying cancellation, require a deduction and no restoration; restore
   the recorded deduction exactly once, append the unique CANCELLATION movement,
   and set inventoryRestoredAt in that SAME transaction. Never infer stock changes
   from order status alone. Prevent concurrent paid/cancelled transitions.
5. Use row locks or conditional updates/Serializable isolation with bounded retry
   for serialization conflicts. Unique keys are a backstop, not a substitute for
   atomic stock/payment/order writes. Ensure movement product matches its order item.

These transactions are intentionally not implemented in Phase 1. Refund policy,
reservation timing, partial refunds, and any reconfirmation after cancellation must
be settled before extending the lifecycle. The present audit model permits one sale
and one cancellation restoration per line.

Future marketing changes must atomically update contact + append event; normalize
emails consistently; only query contacts with GRANTED status, a consent timestamp,
and no withdrawal timestamp. Record the final approved consent wording/version;
never grant consent by default or use order email alone as consent.

All admin access, including notes, payments and marketing, requires authentication
and authorization in Phase 5. Do not expose whole Prisma records in customer APIs.

## Validation

- `npm run db:validate`
- `npm run db:generate`
- `npm run test:commerce`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

The generated migration was additionally executed on an isolated in-memory
PostgreSQL runtime (PGlite) outside the configured database, checking SQL constraints,
unique audit/payment keys, historical price preservation, sequence generation and
withdrawal eligibility. Temporary test fixtures are not seeds and never touched
the configured PostgreSQL database. Live migration status, Prisma adapters on both connection paths, the seed results
and browser-role privacy have now also been verified against Supabase.

## Final validation receipt

- Prisma validate and generate: successful (Prisma ORM 7.10.0).
- Both migrations: applied in Supabase; migrate status reports up to date.
- Product seed: executed and verified through both configured connection paths.
- Five commerce policy tests, TypeScript noEmit, lint and production build: passed.
- Eighteen private-table reads as anon/authenticated: rejected as intended.
- Production localhost storefront with COMMERCE_DATABASE_READY=true: /productos,
  /productos/limon and /productos/mandarina all rendered database-backed $15.00 prices;
  an unknown product returned 404, with no browser runtime errors.
- No database reset, fake sales, admin passwords, secrets in Git, or Phase 2 work.

## Phase 1 file inventory

Created:

- prisma/catalog.ts
- prisma/seed.ts
- prisma/migrations/migration_lock.toml
- prisma/migrations/20261006000100_commerce_foundation/migration.sql
- prisma/migrations/20261006000200_private_commerce_access/migration.sql
- src/server/commerce/products.ts
- src/server/commerce/policies.ts
- src/server/commerce/policies.test.ts
- src/server/storefront.ts
- docs/commerce-phase-1.md

Modified:

- prisma/schema.prisma
- prisma7.config.ts
- src/lib/prisma.ts
- src/lib/products.ts
- src/app/productos/page.tsx
- src/app/productos/[slug]/page.tsx
- package.json
- package-lock.json
- .gitignore
- .env.example (safe template)
- .env (local, ignored; only enabled the database-ready flag, preserving credentials)

Homepage, navigation, CSS, imagery and cinematic components have no Phase 1 edits;
existing changes from earlier tasks remain untouched.

## Before Phase 2

Database migration and seed are complete locally and in Supabase. Set real
inventory. Confirm the initial delivery coverage and the wording of courier-payment
messaging. The card provider, admin hash/auth method, marketing consent text/version,
and detailed stock/cancellation policy remain decisions for their later phases.
The website itself has not been deployed in this phase. Configure DATABASE_URL,
DIRECT_URL and COMMERCE_DATABASE_READY=true in Vercel before the next intended deployment.
Stop here; Phase 2 requires separate approval.

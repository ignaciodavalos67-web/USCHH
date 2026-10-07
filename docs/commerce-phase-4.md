# Checkout, transfer orders and reservations — Phase 4

## Delivered scope
/checkout validates customer information, delivery zone, cart and optional marketing consent. Supported V1 zones are Quito, Cumbayá, Tumbaco, Puembo and Los Chillos in Pichincha, as approved. Configuration is centralized in src/lib/checkout/config.ts; the database retains general province/city/area fields for expansion. Existing design tokens, type, real imagery and navigation are preserved. Homepage scenes, GSAP and ScrollTrigger were not changed.

The cart links to checkout only for a verified nonempty valid cart. The checkout confirms bank availability independently; missing configuration blocks submission. Card is visibly disabled. Customer fields are name, surname, email, phone, province, city/sector, address and optional delivery instructions. No accounts or invoice information.

## Server authority and atomic order creation
POST /api/checkout/orders validates origin, JSON content/type/size, private guest session, UUID attempt, customer fields, supported delivery area, payment method and quantities. Input is reconstructed from a whitelist; browser price, subtotal, shipping, stock and payment/order state fields are ignored.

The existing Prisma 7/PrismaPg architecture remains. An interactive transaction acquires a transaction-scoped advisory lock for the attempt key, checks an existing order, locks product rows in deterministic id order, reads current product identity/prices/active/stock, validates 1–5 per database flavor and USD, then computes exact Decimal snapshots, subtotal and shipping. One line per flavor remains a schema constraint. Order, OrderItems, PENDING bank Payment, conditional inventory deduction, reservation audit and opted-in consent are committed together. Any failure rolls back all changes. Order.number uses the existing PostgreSQL sequence and formatOrderNumber.

Shipping uses the existing Decimal policy: subtotal >= USD 30 is FREE with shippingAmount=0. Below USD 30 is PAY_ON_DELIVERY with shippingAmount=null; the merchandise total is the transfer amount, with unknown delivery cost paid separately. There is no invented courier fee.

## Idempotency and cart cleanup
The browser keeps only a random attempt UUID in sessionStorage, not customer details. Each POST carries that idempotency key. The server stores a unique checkout key and canonical request hash bound to the private guest session. Identical retries return the same order; changed payload/session is rejected. An advisory transaction lock serializes identical attempts and database unique indexes provide final safeguards. Reloading checkout recovers a completed attempt before allowing another submission.

Purchased quantities are cleared only once the authenticated transfer page successfully loads and the cart has hydrated. A local order-cleared marker prevents repeated subtraction on refresh; quantities newly added beyond the purchased amount survive. Failed creation or failed instructions loading does not clear the cart. A lost network response can be retried without creating another order or reserving twice.

## Inventory lifecycle
Product.stock now means available-to-purchase inventory. A valid transfer order conditionally decrements stock with active=true and stock>=quantity inside the transaction. Product nonnegative checks remain. Its RESERVATION movement records a negative delta and stockAfter. The order is RESERVED with reservedAt and reservationExpiresAt=24 hours later; items record inventoryReservedAt.

Confirmation uses RESERVATION_CONFIRMED, delta=0, reservationConfirmedAt and item inventoryDeductedAt. This converts a reserved order into a sale without a second stock deduction. Legacy SALE movements remain valid for existing/future explicitly separate direct-sale behavior.

Unpaid cancellation conditionally transitions the row-locked order to CANCELLED/RELEASED, increments inventory exactly once, sets inventoryReleasedAt, records RESERVATION_RELEASED positive deltas and an internal reason note, and marks its pending payment FAILED (not paid). Repeated cancellation is a no-op. Confirmed sales cannot be cancelled through this reservation-release operation; they require a deliberate future refund/return flow.

No scheduler or automatic expiry release was added. Expired reservations prevent new transfer claims and privileged confirmation. Their units remain unavailable until an authorized cancellation/release operation or a future expiration worker is implemented. The customer page stops showing payment instructions when the reservation expires. Phase 5 must establish operational handling of expired orders before sales launch.

## Transfer states and secure access
Initial states: Order=PENDING_PAYMENT, Payment method=BANK_TRANSFER/status=PENDING. GET /api/checkout/session creates a 256-bit random HttpOnly, SameSite=Strict cookie, Secure in production, with 30-day lifetime. Only its SHA-256 hash is persisted on orders. A separate random UUID accessId appears in /checkout/exito/[accessId]; access requires both this opaque identifier and the matching guest cookie. Predictable order numbers never grant access. Recovery and transfer endpoints enforce the same session. Responses are not cached, and the success page declares no-index/no-referrer.

Only required order reference, product snapshots, transfer amount, shipping mode, bank instruction snapshot, reservation expiry and transfer-claim timestamp reach the customer. No address/email, internal notes, payment metadata or admin identity are exposed. Product ids are included solely for clearing purchased cart lines.

YA REALICÉ LA TRANSFERENCIA locks the order, validates access/lifecycle, and sets customerMarkedTransferredAt only if absent. It is idempotent and never changes Payment or Order to PAID. UI then says TRANSFERENCIA PENDIENTE DE CONFIRMACIÓN. No emails are sent by this phase.

createOrderLifecycle is server-only and has no public route/action. It requires an injected trusted server session verifier and an active database admin. confirmPayment records PAID statuses/timestamps and a zero-delta sale conversion; cancelUnpaid performs the exactly-once release described above. Phase 5 must wire actual authentication and authorization before invoking either method; never supply an admin id from browser input.

## Marketing
Checkbox is optional and unchecked by default. Checked consent upserts a GRANTED contact with timestamp/source GUEST_CHECKOUT/text/version and appends a consent event inside the order transaction. Idempotent checkout does not duplicate consent events. Unchecked creates no opt-in and does not revoke an independently existing consent. No marketing admin or email functionality was added.

## Bank environment configuration
Safe blank/default entries were added to .env.example. No real or production placeholder banking values were added to .env or source.

Required to enable:
- BANK_TRANSFER_ENABLED=true
- BANK_NAME
- BANK_ACCOUNT_HOLDER
- BANK_ACCOUNT_TYPE
- BANK_ACCOUNT_NUMBER

Optional: BANK_ID_NUMBER, only if needed for transfers.

All required values must be nonempty with explicit enablement; otherwise the server rejects order creation and checkout displays unavailable transfer. Existing order instructions use a private bank-details snapshot so later configuration changes do not silently change that order's instructions. Test bank strings are explicitly labelled ISOLATED TEST / NOT A BANK and are supplied only to an isolated local test process, never the actual Supabase-backed storefront.

## Schema and Supabase migrations
Added ReservationStatus, three reservation InventoryMovementType values, order attempt/request/session/access fields, bank snapshot and lifecycle timestamps, item reservation/release timestamps, and Payment.customerMarkedTransferredAt. Added attempt/access uniqueness and expiration index; extended SQL lifecycle/audit constraints. Existing RLS/private table grants remain intact.

Applied to Supabase:
- 20261006000300_reservation_types
- 20261006000400_checkout_reservations
- 20261006000500_reservation_expiry_constraint

A first migration attempt failed before its first statement due to a Windows UTF-8 BOM. Read-only inspection proved there were no partial enum/column changes. SQL was saved without BOM, the failed attempt marked rolled back through Prisma migrate resolve, and the first two migrations then applied successfully. A final additive migration explicitly requires a nonnull expiry and bank snapshot, preventing SQL CHECK null semantics from admitting an incomplete reservation. No reset, seed or inventory update was used. Prisma migrate status reports up to date.

## Files created
- src/lib/checkout/config.ts
- src/lib/checkout/validation.ts
- src/lib/checkout/validation.test.ts
- src/server/commerce/bank.ts
- src/server/commerce/order-access.ts
- src/server/commerce/orders.ts
- src/server/commerce/order-lifecycle.ts
- src/server/commerce/checkout-api.ts
- src/server/commerce/test-database.ts
- src/server/commerce/orders.test.ts
- src/components/checkout/CheckoutForm.tsx
- src/components/checkout/TransferInstructions.tsx
- src/components/checkout/checkout.module.css
- src/app/checkout/page.tsx
- src/app/checkout/exito/[accessId]/page.tsx
- src/app/api/checkout/session/route.ts
- src/app/api/checkout/orders/route.ts
- src/app/api/checkout/transfer/route.ts
- the three migration.sql files listed above
- docs/commerce-phase-4.md

## Files modified in this phase
- prisma/schema.prisma
- src/components/cart/CartContents.tsx: valid checkout entry
- src/components/cart/CartProvider.tsx: once-only purchased-line cleanup
- .env.example: bank settings
- package.json/package-lock.json: isolated database dev dependencies and test coverage

## Validation
Prisma validate/generate, TypeScript, ESLint and production build passed. 36 automated tests pass, including live Prisma operations on in-memory PostgreSQL-compatible PGlite with all migrations. Tests cover successful order/stock reservation, all required fields, email/phone/areas, inactive/empty/insufficient stock, quantity rules, ignored client money/status, changed database price, exact shipping, unpaid states, competing checkouts, duplicate retries, access protection, transfer claims, privileged confirm/cancel exactly once, checked/unchecked consent and actual rollback after an injected database trigger failure. The test database factory never reads DATABASE_URL or DIRECT_URL.

PGlite's socket implementation multiplexes a single PostgreSQL connection. Competing integration requests exercise the reservation/idempotency code and conditional update safeguards, but this is not a production multi-connection PostgreSQL load test. Production uses PostgreSQL row/advisory locks plus guarded updates and unique constraints. A staging concurrency/load exercise can be added before public launch without writing fake orders to Supabase production.

Chromium checks at 1440px/390px exercised real add-to-cart, drawer checkout link, form validation, consent, actual isolated order creation/reservation, authenticated instructions, cart clearing/reload, outsider access denied, and transfer notice remaining unpaid; no runtime exceptions or checkout horizontal overflow. Both shipping branches were exercised. The actual Supabase-backed storefront was checked at both sizes: stock 0 prevents purchase, bank option is unavailable, no fake bank details appear, consent defaults unchecked, supported area options are correct, and unauthorized order access is blocked.

Final read-only verification through both real connections confirms Limón and Mandarina each USD 15.00, active=true, stock=0. Actual Supabase counts remain orders=0, payments=0, movements=0, admins=0, marketing contacts=0. Five migrations are applied successfully; Order/OrderItem/Payment/InventoryMovement retain RLS and no SELECT grants to anon/authenticated. No fake production orders or stock were created.

## Remaining before operation / Phase 5
No implementation blocker for starting Phase 5. Actual bank transfer sales remain intentionally unavailable until real bank environment values and real inventory are configured. Phase 5 must add admin authentication/UI, connect privileged payment/cancellation services, and define expiry handling. No automatic expiration job, card provider, email sending, refund workflow, admin UI or Phase 5 work has been started.

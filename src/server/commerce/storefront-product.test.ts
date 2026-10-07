import assert from "node:assert/strict";
import { test } from "node:test";
import { Prisma } from "../../generated/prisma/client";
import { toStorefrontProduct } from "./storefront-product";

const product = { id: "database-id", slug: "limon", name: "Database name", flavor: "Database flavor", price: new Prisma.Decimal("19.87"), currency: "USD", active: true, stock: 0 };
const visual = { image: "/products/limon.png", background: "#F7E2A3" };

test("storefront uses database identity and exact price, retaining visual assets only", () => {
  const result = toStorefrontProduct(product, visual);
  assert.equal(result.name, product.name);
  assert.equal(result.flavor, product.flavor);
  assert.equal(result.id, product.id);
  assert.equal(result.slug, product.slug);
  assert.equal(result.price, "$19.87");
  assert.equal(result.unitPrice, "19.87");
  assert.equal(result.image, visual.image);
  assert.doesNotThrow(() => JSON.stringify(result));
});

test("availability cannot authorize zero stock or inactive products", () => {
  for (const [active, stock, availability, purchasable] of [
    [true, 0, "AGOTADO", false], [false, 5, "NO DISPONIBLE", false],
    [false, 0, "NO DISPONIBLE", false], [true, 1, "DISPONIBLE", true],
  ] as const) {
    const result = toStorefrontProduct({ ...product, active, stock }, visual);
    assert.equal(result.availability, availability);
    assert.equal(result.purchasable, purchasable);
    assert.equal(result.stock, stock);
  }
});

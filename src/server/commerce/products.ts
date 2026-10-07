import "server-only";
import { prisma } from "@/lib/prisma";
import { isPurchasable, MAX_QUANTITY_PER_FLAVOR } from "./policies";

// Strict PostgreSQL access: never substitute seed data in purchase validation.
export async function getProducts() {
  return prisma.product.findMany({
    select: { id: true, slug: true, name: true, flavor: true, description: true, price: true, currency: true, stock: true, active: true },
    orderBy: { slug: "asc" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, flavor: true, description: true, price: true, currency: true, stock: true, active: true },
  });
}

export async function requirePurchasableProduct(slug: string, quantity: number) {
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_FLAVOR) throw new Error("Quantity must be between 1 and 5.");
  const product = await getProductBySlug(slug);
  if (!product || !isPurchasable(product) || product.stock < quantity) throw new Error("Product is unavailable.");
  // A preflight read does NOT reserve inventory. Later purchase code must recheck/update
  // conditionally inside the payment confirmation transaction.
  return product;
}

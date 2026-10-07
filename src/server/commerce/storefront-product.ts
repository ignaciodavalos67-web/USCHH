import type { Product } from "@/generated/prisma/client";
import { formatMoney, isPurchasable } from "./policies";

type CatalogProduct = Pick<Product, "id" | "slug" | "name" | "flavor" | "price" | "currency" | "stock" | "active">;
type Visual = { image: string; background: string };

// Exact decimal strings are serializable; purchase code must re-read the database.
export function toStorefrontProduct(product: CatalogProduct, visual: Visual) {
  return {
    id: product.id, slug: product.slug, name: product.name, flavor: product.flavor,
    unitPrice: product.price.toFixed(2), price: formatMoney(product.price, product.currency),
    currency: product.currency, stock: product.stock, active: product.active,
    purchasable: isPurchasable(product),
    availability: !product.active ? "NO DISPONIBLE" : product.stock === 0 ? "AGOTADO" : "DISPONIBLE",
    image: visual.image, background: visual.background,
  };
}

import "server-only";
import { products as presentation } from "@/lib/products";
import { getProducts, getProductBySlug } from "./commerce/products";
import { toStorefrontProduct } from "./commerce/storefront-product";

export async function getStorefrontProducts() {
  try {
    const catalog = await getProducts();
    return { available: true as const, products: presentation.flatMap(visual => {
      const product = catalog.find(item => item.slug === visual.slug);
      return product ? [toStorefrontProduct(product, visual)] : [];
    }) };
  } catch {
    return { available: false as const, products: [] };
  }
}

export async function getStorefrontProduct(slug: string) {
  try {
    const product = await getProductBySlug(slug);
    const visual = presentation.find(item => item.slug === slug);
    return { available: true as const, product: product && visual ? toStorefrontProduct(product, visual) : null };
  } catch {
    return { available: false as const, product: null };
  }
}

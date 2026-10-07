import type { toStorefrontProduct } from "@/server/commerce/storefront-product";
export type CartProduct = ReturnType<typeof toStorefrontProduct>;
export type CartItem = { id: string; slug: string; quantity: number };
export const CART_KEY = "uschh.cart.v1";
export const maxQuantity = (p: CartProduct) => p.purchasable ? Math.min(5, p.stock) : 0;

export function parseCart(raw: string | null): CartItem[] {
  try {
    const value = JSON.parse(raw ?? "null");
    if (value?.version !== 1 || !Array.isArray(value.items)) return [];
    const result: CartItem[] = [];
    for (const item of value.items.slice(0, 100)) {
      if (typeof item?.id !== "string" || !item.id || item.id.length > 128 || typeof item.slug !== "string" || !/^[a-z0-9-]{1,100}$/.test(item.slug) || !Number.isSafeInteger(item.quantity) || item.quantity < 1) continue;
      const existing = result.find(line => line.id === item.id || line.slug === item.slug);
      if (existing) existing.quantity = Math.min(5, existing.quantity + item.quantity);
      else result.push({ id: item.id, slug: item.slug, quantity: Math.min(5, item.quantity) });
    }
    return result;
  } catch { return []; }
}
export const serializeCart = (items: CartItem[]) => JSON.stringify({ version: 1, items: items.map(({id,slug,quantity}) => ({id,slug,quantity})) });
export const findProduct = (item: CartItem, products: CartProduct[]) => products.find(p => p.id === item.id && p.slug === item.slug);
export function reconcile(items: CartItem[], products: CartProduct[]): CartItem[] {
  const used = new Map<string, number>();
  return items.map(item => {
    const product = findProduct(item, products);
    if (!product || maxQuantity(product) === 0) return item; // Keep unavailable lines visible for explicit removal.
    const remaining = Math.max(0, Math.min(maxQuantity(product), 5 - (used.get(product.flavor) ?? 0)));
    const quantity = Math.min(item.quantity, remaining);
    used.set(product.flavor, (used.get(product.flavor) ?? 0) + quantity);
    return { ...item, quantity };
  }).filter(item => item.quantity > 0);
}
export function setQuantity(items: CartItem[], product: CartProduct, quantity: number, products: CartProduct[]): CartItem[] {
  const otherUnits = items.reduce((n,item) => n + (item.id !== product.id && findProduct(item,products)?.flavor === product.flavor ? item.quantity : 0),0);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > Math.min(maxQuantity(product),5-otherUnits)) return items;
  const existing = items.find(item => item.id === product.id);
  return existing ? items.map(item => item.id === product.id ? {...item,quantity} : item) : [...items,{id:product.id,slug:product.slug,quantity}];
}
export const addItem = (items: CartItem[], product: CartProduct, quantity: number, products: CartProduct[]) => Number.isSafeInteger(quantity) && quantity > 0 ? setQuantity(items,product,(items.find(item=>item.id===product.id)?.quantity ?? 0)+quantity,products) : items;
export const removeItem = (items: CartItem[], id: string) => items.filter(item=>item.id!==id);
export const totalUnits = (items: CartItem[]) => items.reduce((n,item)=>n+item.quantity,0);
export function cents(value: string): number {
  if (!/^\d{1,10}\.\d{2}$/.test(value)) throw new Error("Invalid display price");
  const [whole,fraction]=value.split(".");return Number(whole)*100+Number(fraction);
}
export const displayMoney = (value: number) => `$${Math.floor(value/100)}.${String(value%100).padStart(2,"0")}`;
export function cartSummary(items: CartItem[], products: CartProduct[]) {
  let subtotal=0;
  const flavors = new Map<string, number>();
  const valid = items.every(item => {
    const product=findProduct(item,products);
    if (!product || product.currency!=="USD" || item.quantity>maxQuantity(product)) return false;
    const count = (flavors.get(product.flavor) ?? 0) + item.quantity;
    flavors.set(product.flavor, count);
    if (count > 5) return false;
    return true;
  });
  if (valid) for(const item of items) subtotal+=cents(findProduct(item,products)!.unitPrice)*item.quantity;
  return { valid, subtotal: valid ? subtotal : null, shipping: valid ? subtotal>=3000 ? "ENVÍO GRATIS" : "ENVÍO PAGADO AL RECIBIR" : null };
}

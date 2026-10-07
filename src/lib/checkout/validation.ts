import { DELIVERY_AREAS } from "./config";
export class CheckoutError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); }
}
export function validateCheckout(value: unknown) {
  if (!value || typeof value !== "object") throw new CheckoutError("INVALID", "Revisa los datos del pedido.");
  const body = value as Record<string, unknown>;
  const source = body.customer;
  if (!source || typeof source !== "object") throw new CheckoutError("CUSTOMER", "Completa tus datos de entrega.");
  const customer = source as Record<string, unknown>;
  const labels: Record<string,string> = { firstName:"el nombre",lastName:"el apellido",email:"el email",phone:"el teléfono",address:"la dirección",deliveryInstructions:"las instrucciones de entrega" };
  const text = (field: string, max: number, required = true) => {
    const value = customer[field];
    const controls=field==="deliveryInstructions" ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/ : /[\u0000-\u001f]/;
    if (typeof value !== "string" || value.trim().length > max || (required && !value.trim()) || controls.test(value)) throw new CheckoutError("CUSTOMER", `Revisa ${labels[field] ?? "los datos de entrega"}.`);
    return value.trim();
  };
  const email = text("email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new CheckoutError("EMAIL", "Introduce un email válido.");
  const phone = text("phone", 30);
  if (!/^[+()\d .-]{7,30}$/.test(phone) || phone.replace(/\D/g, "").length < 7) throw new CheckoutError("PHONE", "Introduce un teléfono válido.");
  const area = DELIVERY_AREAS.find(area => area.id === customer.area);
  if (!area || customer.province !== area.province) throw new CheckoutError("AREA", "Selecciona una zona de entrega disponible en Pichincha.");
  if (body.paymentMethod !== "BANK_TRANSFER") throw new CheckoutError("PAYMENT", "Este método de pago no está disponible.");
  if (body.marketingConsent !== undefined && typeof body.marketingConsent !== "boolean") throw new CheckoutError("CONSENT", "Revisa tu preferencia de comunicaciones.");
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 10) throw new CheckoutError("ITEMS", "Revisa los productos del carrito.");
  const ids = new Set<string>();
  const items = body.items.map(value => {
    if (!value || typeof value !== "object") throw new CheckoutError("ITEMS", "Producto no válido.");
    const item = value as Record<string, unknown>;
    if (typeof item.id !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(item.id) || typeof item.slug !== "string" || !/^[a-z0-9-]{1,100}$/.test(item.slug) || typeof item.quantity !== "number" || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 5 || ids.has(item.id)) throw new CheckoutError("QUANTITY", "Máximo 5 unidades por sabor; revisa las cantidades.");
    ids.add(item.id);
    return { id: item.id, slug: item.slug, quantity: item.quantity };
  }).sort((a,b) => a.id.localeCompare(b.id));
  return {
    customer: { firstName: text("firstName",80), lastName: text("lastName",80), email, phone, province: area.province, city: area.label, area: area.id, address: text("address",500), deliveryInstructions: customer.deliveryInstructions === undefined ? "" : text("deliveryInstructions",500,false) },
    items, paymentMethod: "BANK_TRANSFER" as const, marketingConsent: body.marketingConsent === true,
  };
}
export type CheckoutInput = ReturnType<typeof validateCheckout>;

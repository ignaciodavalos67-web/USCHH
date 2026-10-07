import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { CheckoutError } from "@/lib/checkout/validation";
export const GUEST_COOKIE = "uschh_checkout_session";
export const hash = (value: string) => createHash("sha256").update(value).digest("hex");
export function validSession(value: string | undefined): value is string { return !!value && /^[a-f0-9]{64}$/.test(value); }
export function requireSession(value: string | undefined) { if(!validSession(value))throw new CheckoutError("SESSION","Vuelve al checkout para iniciar tu sesión.",401);return hash(value); }
export function checkAccess(expected: string | null, actual: string) {
  if(!expected || expected.length!==actual.length || !timingSafeEqual(Buffer.from(expected),Buffer.from(actual))) throw new CheckoutError("ACCESS","Pedido no disponible.",404);
}
export function validateAttempt(key: unknown): string { if(typeof key!=="string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key))throw new CheckoutError("ATTEMPT","Vuelve a iniciar el checkout.");return key.toLowerCase(); }

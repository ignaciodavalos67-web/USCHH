import "server-only";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { CheckoutError, validateCheckout } from "@/lib/checkout/validation";
import { CONSENT_TEXT, CONSENT_VERSION, RESERVATION_HOURS } from "@/lib/checkout/config";
import { assertFlavorQuantities, calculateShipping, formatMoney, formatOrderNumber } from "./policies";
import { checkAccess, hash, validateAttempt } from "./order-access";
import type { BankDetails } from "./bank";

const include = { items: true, payments: true } as const;
type OrderDetails = Prisma.OrderGetPayload<{ include: typeof include }>;
export function publicOrder(order: OrderDetails) {
  return { accessId:order.accessId!, number:formatOrderNumber(order.number), status:order.status,
    total:formatMoney(order.total,order.currency), shippingMode:order.shippingMode,
    expiresAt:order.reservationExpiresAt?.toISOString() ?? null,
    customerMarkedTransferredAt:order.payments.find(p=>p.method==="BANK_TRANSFER")?.customerMarkedTransferredAt?.toISOString() ?? null,
    bank:order.bankDetails as BankDetails | null,
    items:order.items.map(item=>({id:item.productId, quantity:item.quantity, name:item.productName, flavor:item.flavor, unitPrice:formatMoney(item.unitPrice,order.currency),lineTotal:formatMoney(item.lineTotal,order.currency)})),
  };
}
export function createOrderService(db: PrismaClient, bank: () => BankDetails | null) {
  async function create(value: unknown, attempt: unknown, guestHash: string) {
    const input=validateCheckout(value), key=validateAttempt(attempt), requestHash=hash(JSON.stringify(input));
    return db.$transaction(async tx=>{
      // Serialize retries of the same attempt; a unique index is the final safeguard.
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))::text AS "lock"`;
      const existing=await tx.order.findUnique({where:{checkoutKey:key},include});
      if(existing){checkAccess(existing.guestAccessHash,guestHash);if(existing.checkoutRequestHash!==requestHash)throw new CheckoutError("IDEMPOTENCY","Este intento ya creó un pedido. Recupera sus instrucciones antes de iniciar otro.",409);return publicOrder(existing);}
      const details=bank();if(!details)throw new CheckoutError("BANK","La transferencia bancaria todavía no está disponible.",503);
      const ids=input.items.map(item=>item.id);
      // Lock in deterministic order so prices/availability cannot change mid-checkout.
      await tx.$queryRaw(Prisma.sql`SELECT "id" FROM "Product" WHERE "id" IN (${Prisma.join(ids)}) ORDER BY "id" FOR UPDATE`);
      const products=await tx.product.findMany({where:{id:{in:ids}}});
      const lines=input.items.map(item=>{
        const product=products.find(p=>p.id===item.id && p.slug===item.slug);
        if(!product || !product.active || product.stock<item.quantity || product.currency!=="USD")throw new CheckoutError("STOCK","Uno de los productos ya no está disponible en la cantidad solicitada.",409);
        return {product,quantity:item.quantity,lineTotal:product.price.mul(item.quantity)};
      });
      try{assertFlavorQuantities(lines.map(line=>({flavor:line.product.flavor,quantity:line.quantity})));}catch{throw new CheckoutError("QUANTITY","Máximo 5 unidades por sabor.");}
      // Schema permits one item per flavor; reject ambiguous duplicate-flavor products.
      if(new Set(lines.map(line=>line.product.flavor)).size!==lines.length)throw new CheckoutError("ITEMS","Revisa los productos del carrito.");
      const subtotal=lines.reduce((total,line)=>total.plus(line.lineTotal),new Prisma.Decimal(0));
      const shipping=calculateShipping(subtotal);const now=new Date();const expires=new Date(now.getTime()+RESERVATION_HOURS*3600000);
      const order=await tx.order.create({data:{...input.customer,subtotal,...shipping,checkoutKey:key,checkoutRequestHash:requestHash,guestAccessHash:guestHash,
        bankDetails:details,reservationStatus:"RESERVED",reservedAt:now,reservationExpiresAt:expires,
        items:{create:lines.map(line=>({productId:line.product.id,productName:line.product.name,flavor:line.product.flavor,unitPrice:line.product.price,quantity:line.quantity,lineTotal:line.lineTotal,inventoryReservedAt:now}))},
        payments:{create:{method:"BANK_TRANSFER",status:"PENDING",idempotencyKey:key,amount:shipping.total,currency:"USD"}},
      },include});
      for(const item of order.items){
        const result=await tx.product.updateMany({where:{id:item.productId,active:true,stock:{gte:item.quantity}},data:{stock:{decrement:item.quantity}}});
        if(result.count!==1)throw new CheckoutError("STOCK","El stock cambió. Revisa el carrito.",409);
        const product=await tx.product.findUniqueOrThrow({where:{id:item.productId},select:{stock:true}});
        await tx.inventoryMovement.create({data:{productId:item.productId,orderItemId:item.id,type:"RESERVATION",delta:-item.quantity,stockAfter:product.stock,reason:"Reserva de pedido pendiente de transferencia"}});
      }
      if(input.marketingConsent){
        const contact=await tx.marketingContact.upsert({where:{email:input.customer.email},create:{email:input.customer.email,status:"GRANTED",consentAt:now,consentSource:"GUEST_CHECKOUT",consentText:CONSENT_TEXT,consentVersion:CONSENT_VERSION},update:{status:"GRANTED",consentAt:now,consentSource:"GUEST_CHECKOUT",consentText:CONSENT_TEXT,consentVersion:CONSENT_VERSION,withdrawnAt:null}});
        await tx.marketingConsentEvent.create({data:{contactId:contact.id,status:"GRANTED",source:"GUEST_CHECKOUT",consentText:CONSENT_TEXT,consentVersion:CONSENT_VERSION,occurredAt:now}});
      }
      return publicOrder(order);
    },{timeout:15000});
  }
  async function get(accessId: string, guestHash: string) {
    const order=await db.order.findUnique({where:{accessId},include});
    if(!order)throw new CheckoutError("ACCESS","Pedido no disponible.",404);checkAccess(order.guestAccessHash,guestHash);return publicOrder(order);
  }
  async function recover(attempt: string, guestHash: string) {
    const order=await db.order.findUnique({where:{checkoutKey:validateAttempt(attempt)},include});
    if(!order)return null;checkAccess(order.guestAccessHash,guestHash);return publicOrder(order);
  }
  async function markTransferred(accessId: string, guestHash: string) {
    return db.$transaction(async tx=>{
      await tx.$queryRaw`SELECT "id" FROM "Order" WHERE "accessId"=${accessId} FOR UPDATE`;
      const order=await tx.order.findUnique({where:{accessId},include});
      if(!order)throw new CheckoutError("ACCESS","Pedido no disponible.",404);checkAccess(order.guestAccessHash,guestHash);
      if(order.payments.some(payment=>payment.method==="BANK_TRANSFER" && payment.customerMarkedTransferredAt))return publicOrder(order);
      if(order.status!=="PENDING_PAYMENT" || order.reservationStatus!=="RESERVED" || !order.reservationExpiresAt || order.reservationExpiresAt<=new Date())throw new CheckoutError("EXPIRED","La reserva ya no está vigente. Contacta con USCHH.",409);
      await tx.payment.updateMany({where:{orderId:order.id,method:"BANK_TRANSFER",status:"PENDING",customerMarkedTransferredAt:null},data:{customerMarkedTransferredAt:new Date()}});
      return publicOrder(await tx.order.findUniqueOrThrow({where:{id:order.id},include}));
    });
  }
  return {create,get,recover,markTransferred};
}

import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { CheckoutError } from "@/lib/checkout/validation";

// No public route or server action exports these operations. Phase 5 must supply
// a trusted server-side session verifier; browser-provided admin IDs are forbidden.
export function createOrderLifecycle(db: PrismaClient, requireAdmin: () => Promise<string>) {
  async function authorize() {
    const id=await requireAdmin();const admin=await db.adminUser.findUnique({where:{id},select:{active:true}});
    if(!admin?.active)throw new CheckoutError("ADMIN","Acceso no autorizado.",403);return id;
  }
  async function confirmPayment(orderId: string) {
    const adminId=await authorize();
    return db.$transaction(async tx=>{
      await tx.$queryRaw`SELECT "id" FROM "Order" WHERE "id"=${orderId} FOR UPDATE`;
      const order=await tx.order.findUniqueOrThrow({where:{id:orderId},include:{items:true,payments:true}});
      if(["PAID","PREPARING","SHIPPED","DELIVERED"].includes(order.status) && order.reservationStatus==="CONFIRMED")return;
      if(order.status!=="PENDING_PAYMENT" || order.reservationStatus!=="RESERVED" || !order.reservationExpiresAt || order.reservationExpiresAt<=new Date() || !order.payments.some(p=>p.method==="BANK_TRANSFER" && p.status==="PENDING"))throw new CheckoutError("STATE","El pedido no admite confirmación.",409);
      const now=new Date();
      await tx.payment.updateMany({where:{orderId,method:"BANK_TRANSFER",status:"PENDING"},data:{status:"PAID",paidAt:now,verifiedAt:now,verifiedById:adminId}});
      for(const item of [...order.items].sort((a,b)=>a.productId.localeCompare(b.productId))){
        const product=await tx.product.findUniqueOrThrow({where:{id:item.productId},select:{stock:true}});
        await tx.orderItem.update({where:{id:item.id},data:{inventoryDeductedAt:now}});
        await tx.inventoryMovement.create({data:{productId:item.productId,orderItemId:item.id,type:"RESERVATION_CONFIRMED",delta:0,stockAfter:product.stock,adminId,reason:"Reserva convertida en venta; sin nuevo descuento de stock"}});
      }
      await tx.order.update({where:{id:orderId},data:{status:"PAID",paidAt:now,reservationStatus:"CONFIRMED",reservationConfirmedAt:now}});
      await tx.adminAuditEvent.create({data:{adminId,action:"PAYMENT_CONFIRMED",entityType:"Order",entityId:orderId}});
    });
  }
  async function cancelUnpaid(orderId: string, reason: string, options: {expiredOnly?:boolean} = {}) {
    const adminId=await authorize();if(!reason.trim() || reason.length>500)throw new CheckoutError("REASON","Indica el motivo de cancelación.");
    return db.$transaction(async tx=>{
      await tx.$queryRaw`SELECT "id" FROM "Order" WHERE "id"=${orderId} FOR UPDATE`;
      const order=await tx.order.findUniqueOrThrow({where:{id:orderId},include:{items:true,payments:true}});
      if(order.status==="CANCELLED" && order.reservationStatus==="RELEASED")return;
      if(options.expiredOnly && (!order.reservationExpiresAt || order.reservationExpiresAt>new Date()))throw new CheckoutError("STATE","La reserva todavía no ha vencido.",409);
      if(order.status!=="PENDING_PAYMENT" || order.reservationStatus!=="RESERVED" || order.payments.some(p=>p.status==="PAID"))throw new CheckoutError("STATE","Una venta confirmada requiere el flujo de devolución; no se libera como reserva.",409);
      const now=new Date();
      for(const item of [...order.items].sort((a,b)=>a.productId.localeCompare(b.productId))){
        if(!item.inventoryReservedAt || item.inventoryReleasedAt)throw new CheckoutError("STATE","Revisa el estado de inventario.",409);
        const product=await tx.product.update({where:{id:item.productId},data:{stock:{increment:item.quantity}},select:{stock:true}});
        await tx.orderItem.update({where:{id:item.id},data:{inventoryReleasedAt:now}});
        await tx.inventoryMovement.create({data:{productId:item.productId,orderItemId:item.id,type:"RESERVATION_RELEASED",delta:item.quantity,stockAfter:product.stock,adminId,reason}});
      }
      await tx.payment.updateMany({where:{orderId,status:"PENDING"},data:{status:"FAILED"}});
      await tx.orderNote.create({data:{orderId,authorId:adminId,content:`Cancelación de pedido sin pago: ${reason}`}});
      await tx.order.update({where:{id:orderId},data:{status:"CANCELLED",cancelledAt:now,reservationStatus:"RELEASED",reservationReleasedAt:now}});
      await tx.adminAuditEvent.create({data:{adminId,action:options.expiredOnly ? "RESERVATION_EXPIRED_RELEASED" : "ORDER_CANCELLED",entityType:"Order",entityId:orderId,details:{reason}}});
    });
  }
  return {confirmPayment,cancelUnpaid};
}

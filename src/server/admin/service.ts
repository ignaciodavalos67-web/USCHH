import "server-only";
import { Prisma, OrderStatus, PaymentStatus, type PrismaClient } from "@/generated/prisma/client";
import { createOrderLifecycle } from "@/server/commerce/order-lifecycle";
import { AdminError, id, text } from "./errors";
export type Filters={q?:string;status?:string;payment?:string;waiting?:string;expired?:string;page?:string;from?:string;to?:string};
export type TransferFilters={state?:string;page?:string};
export type TransferState="review"|"pending"|"confirmed"|"closed";
export const PAGE_SIZE=25;
export const SALES_STATUSES: OrderStatus[]=["PAID","PREPARING","SHIPPED","DELIVERED"];
export function orderFilter(filters:Filters):Prisma.OrderWhereInput {
  const q=filters.q?.trim().slice(0,100);const conditions:Prisma.OrderWhereInput[]=[];
  if(filters.status){if(!Object.values(OrderStatus).includes(filters.status as OrderStatus))throw new AdminError("Estado no válido.");conditions.push({status:filters.status as OrderStatus});}
  if(filters.payment){if(!Object.values(PaymentStatus).includes(filters.payment as PaymentStatus))throw new AdminError("Estado de pago no válido.");conditions.push({payments:{some:{status:filters.payment as PaymentStatus}}});}
  if(filters.waiting==="true")conditions.push({status:"PENDING_PAYMENT",payments:{some:{method:"BANK_TRANSFER",status:"PENDING",customerMarkedTransferredAt:{not:null}}}});
  if(filters.expired==="true")conditions.push({status:"PENDING_PAYMENT",reservationStatus:"RESERVED",reservationExpiresAt:{lte:new Date()}});
  if(q){const number=/^(?:USCHH-)?(\d+)$/i.exec(q);conditions.push({OR:[...(number && Number.isSafeInteger(Number(number[1])) && Number(number[1])<=2147483647 ? [{number:Number(number[1])}] : []),{firstName:{contains:q,mode:"insensitive"}},{lastName:{contains:q,mode:"insensitive"}},{email:{contains:q,mode:"insensitive"}}]});}
  const dates=dateRange(filters.from,filters.to);if(dates)conditions.push({createdAt:dates});
  return {AND:conditions};
}
export function dateRange(from?:string,to?:string){
  const parse=(value:string)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new AdminError("Fecha no válida.");const date=new Date(`${value}T00:00:00-05:00`);if(!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10)!==value)throw new AdminError("Fecha no válida.");return date;};
  if(!from && !to)return undefined;const gte=from ? parse(from) : undefined;const lt=to ? new Date(parse(to).getTime()+24*3600000) : undefined;if(gte && lt && gte>=lt)throw new AdminError("Revisa el rango de fechas.");return {gte,lt};
}
const pagination=(page?:string)=>{if(page && !/^\d{1,6}$/.test(page))throw new AdminError("Página no válida.");return Math.max(1,Number(page ?? 1));};
const transferState=(value?:string):TransferState=>{const state=value ?? "review";if(!["review","pending","confirmed","closed"].includes(state))throw new AdminError("Estado de transferencia no válido.");return state as TransferState;};
function periodStarts(now=new Date()){
  const local=new Date(now.getTime()-5*3600000);const y=local.getUTCFullYear(),m=local.getUTCMonth(),d=local.getUTCDate();
  const today=new Date(Date.UTC(y,m,d,5)),week=new Date(today.getTime()-((local.getUTCDay()+6)%7)*24*3600000),month=new Date(Date.UTC(y,m,1,5));return {today,week,month};
}
export function createAdminService(db:PrismaClient,requireAdmin:()=>Promise<{id:string}>) {
  const lifecycle=createOrderLifecycle(db,async()=>(await requireAdmin()).id);
  async function listOrders(filters:Filters={}){await requireAdmin();const where=orderFilter(filters),page=pagination(filters.page);const [orders,count]=await Promise.all([db.order.findMany({where,orderBy:{createdAt:"desc"},skip:(page-1)*PAGE_SIZE,take:PAGE_SIZE,include:{payments:{select:{method:true,status:true,customerMarkedTransferredAt:true}}}}),db.order.count({where})]);return {orders,count,page};}
  async function transfers(filters:TransferFilters={}){await requireAdmin();const state=transferState(filters.state),page=pagination(filters.page);const paymentWhere:Prisma.PaymentWhereInput={method:"BANK_TRANSFER",...(state==="review" ? {status:"PENDING",customerMarkedTransferredAt:{not:null}} : state==="pending" ? {status:"PENDING",customerMarkedTransferredAt:null} : state==="confirmed" ? {status:"PAID"} : {status:{in:["FAILED","REFUNDED"]}})};const where:Prisma.OrderWhereInput={payments:{some:paymentWhere}};const review:Prisma.OrderWhereInput={payments:{some:{method:"BANK_TRANSFER",status:"PENDING",customerMarkedTransferredAt:{not:null}}}},pending:Prisma.OrderWhereInput={payments:{some:{method:"BANK_TRANSFER",status:"PENDING",customerMarkedTransferredAt:null}}},confirmed:Prisma.OrderWhereInput={payments:{some:{method:"BANK_TRANSFER",status:"PAID"}}},closed:Prisma.OrderWhereInput={payments:{some:{method:"BANK_TRANSFER",status:{in:["FAILED","REFUNDED"]}}}};
    const [orders,count,reviewCount,pendingCount,confirmedCount,closedCount]=await Promise.all([db.order.findMany({where,orderBy:{updatedAt:"desc"},skip:(page-1)*PAGE_SIZE,take:PAGE_SIZE,include:{payments:{where:{method:"BANK_TRANSFER"},select:{id:true,status:true,amount:true,currency:true,customerMarkedTransferredAt:true,paidAt:true,verifiedAt:true,verifiedBy:{select:{name:true,email:true}}}}}}),db.order.count({where}),db.order.count({where:review}),db.order.count({where:pending}),db.order.count({where:confirmed}),db.order.count({where:closed})]);const now=new Date();return {orders:orders.map(order=>({...order,isExpired:order.reservationStatus==="RESERVED" && !!order.reservationExpiresAt && order.reservationExpiresAt<=now})),count,page,state,counts:{review:reviewCount,pending:pendingCount,confirmed:confirmedCount,closed:closedCount}};
  }
  async function detail(number:string){await requireAdmin();if(!/^(?:USCHH-)?\d{1,10}$/i.test(number))throw new AdminError("Pedido no encontrado.",404);const order=await db.order.findUnique({where:{number:Number(number.replace(/^USCHH-/i,""))},include:{items:{include:{inventoryMovements:{orderBy:{createdAt:"asc"}}}},payments:true,notes:{take:100,orderBy:{createdAt:"desc"},include:{author:{select:{email:true,name:true}}}},_count:{select:{notes:true}}}});if(!order)throw new AdminError("Pedido no encontrado.",404);return order;}
  async function products(){await requireAdmin();const [products,reserved]=await Promise.all([db.product.findMany({where:{slug:{in:["limon","mandarina"]}},orderBy:{slug:"asc"}}),db.orderItem.groupBy({by:["productId"],where:{order:{reservationStatus:"RESERVED"},inventoryReleasedAt:null},_sum:{quantity:true}})]);return products.map(product=>({...product,reserved:reserved.find(row=>row.productId===product.id)?._sum.quantity ?? 0}));}
  async function updateProduct(value:Record<string,unknown>){const admin=await requireAdmin();const productId=id(value.id);const price=text(value.price,"el precio",13);if(!/^\d{1,10}(\.\d{1,2})?$/.test(price) || new Prisma.Decimal(price).lte(0))throw new AdminError("El precio debe ser positivo y tener máximo dos decimales.");const stock=Number(value.stock);if(typeof value.stock!=="string" || !/^\d{1,9}$/.test(value.stock) || !Number.isSafeInteger(stock) || stock>2147483647)throw new AdminError("El stock disponible no puede ser negativo.");const active=value.active;if(typeof active!=="boolean")throw new AdminError("Disponibilidad no válida.");const reason=text(value.reason,"el motivo del ajuste",500);const expected=text(value.updatedAt,"la versión del producto",40);
    await db.$transaction(async tx=>{
      await tx.$queryRaw`SELECT "id" FROM "Product" WHERE "id"=${productId} FOR UPDATE`;
      const product=await tx.product.findUnique({where:{id:productId}});if(!product)throw new AdminError("Producto no encontrado.",404);if(product.updatedAt.toISOString()!==expected)throw new AdminError("El producto cambió. Actualiza la página antes de guardar.",409);
      const delta=stock-product.stock;
      await tx.product.update({where:{id:productId},data:{price:new Prisma.Decimal(price),stock,active}});
      if(delta)await tx.inventoryMovement.create({data:{productId,type:"ADMIN_ADJUSTMENT",delta,stockAfter:stock,reason,adminId:admin.id}});
      await tx.adminAuditEvent.create({data:{adminId:admin.id,action:"PRODUCT_UPDATED",entityType:"Product",entityId:productId,details:{before:{price:product.price.toFixed(2),stock:product.stock,active:product.active},after:{price:new Prisma.Decimal(price).toFixed(2),stock,active},reason}}});
    });
  }
  async function addNote(orderId:string,content:unknown){const admin=await requireAdmin();const note=text(content,"la nota",2000);await db.$transaction(async tx=>{await tx.orderNote.create({data:{orderId:id(orderId),content:note,authorId:admin.id}});await tx.adminAuditEvent.create({data:{adminId:admin.id,action:"NOTE_ADDED",entityType:"Order",entityId:orderId}});});}
  async function transition(orderId:string,value:Record<string,unknown>){const admin=await requireAdmin();const next=value.status;const allowed:Record<string,string>={PAID:"PREPARING",PREPARING:"SHIPPED",SHIPPED:"DELIVERED"};if(typeof next!=="string" || !["PREPARING","SHIPPED","DELIVERED"].includes(next))throw new AdminError("Transición no válida.");const carrier=next==="SHIPPED" ? text(value.carrier,"la empresa de envío",100) : undefined;const trackingNumber=next==="SHIPPED" ? text(value.trackingNumber,"el número de seguimiento",100) : undefined;
    await db.$transaction(async tx=>{
      await tx.$queryRaw`SELECT "id" FROM "Order" WHERE "id"=${id(orderId)} FOR UPDATE`;
      const order=await tx.order.findUniqueOrThrow({where:{id:orderId},include:{payments:{select:{status:true}}}});
      if(!order.paidAt || !order.payments.some(p=>p.status==="PAID"))throw new AdminError("Solo se puede preparar o enviar un pedido pagado.",409);
      if(order.status===next)return;if(allowed[order.status]!==next)throw new AdminError("La transición no corresponde al estado actual.",409);
      await tx.order.update({where:{id:orderId},data:{status:next as OrderStatus,...(next==="SHIPPED" ? {carrier,trackingNumber,shippedAt:new Date()} : {}),...(next==="DELIVERED" ? {deliveredAt:new Date()} : {})}});
      await tx.adminAuditEvent.create({data:{adminId:admin.id,action:"FULFILLMENT_CHANGED",entityType:"Order",entityId:orderId,details:{from:order.status,to:next,...(carrier ? {carrier,trackingNumber} : {})}}});
    });
  }
  async function releaseExpired(){await requireAdmin();const expired=await db.order.findMany({where:{status:"PENDING_PAYMENT",reservationStatus:"RESERVED",reservationExpiresAt:{lte:new Date()}},orderBy:{reservationExpiresAt:"asc"},take:50,select:{id:true}});let released=0;for(const order of expired){try{await lifecycle.cancelUnpaid(order.id,"Reserva vencida de 24 horas",{expiredOnly:true});released++;}catch(error){if(error instanceof Error && "status" in error && error.status===409)continue;throw error;}}return released;}
  async function marketing(filters:Filters={}){await requireAdmin();const page=pagination(filters.page);const where:Prisma.MarketingContactWhereInput={status:"GRANTED",withdrawnAt:null,consentAt:{not:null},consentSource:{not:null},consentText:{not:null},consentVersion:{not:null},...(filters.q ? {email:{contains:filters.q.slice(0,100),mode:"insensitive"}} : {})};const [contacts,count]=await Promise.all([db.marketingContact.findMany({where,select:{email:true,consentAt:true,consentSource:true,consentVersion:true,status:true},orderBy:{consentAt:"desc"},take:PAGE_SIZE,skip:(page-1)*PAGE_SIZE}),db.marketingContact.count({where})]);return {contacts,count,page};}
  async function sales(filters:Filters={}){await requireAdmin();const starts=periodStarts();const where:Prisma.OrderWhereInput={status:{in:SALES_STATUSES},paidAt:{not:null,...dateRange(filters.from,filters.to)},refundedAt:null,payments:{some:{status:"PAID"},none:{status:"REFUNDED"}},currency:"USD"};const aggregate=(extra:Prisma.OrderWhereInput={})=>db.order.aggregate({where:{AND:[where,extra]},_sum:{total:true},_count:{_all:true},_avg:{total:true}});
    const [all,today,week,month,flavors]=await Promise.all([aggregate(),aggregate({paidAt:{gte:starts.today,lt:new Date()}}),aggregate({paidAt:{gte:starts.week,lt:new Date()}}),aggregate({paidAt:{gte:starts.month,lt:new Date()}}),db.orderItem.groupBy({by:["flavor"],where:{order:where},_sum:{quantity:true}})]);return {all,today,week,month,flavors,units:flavors.reduce((n,row)=>n+(row._sum.quantity ?? 0),0)};
  }
  async function dashboard(){await requireAdmin();const [metrics,stock,recent,pending,waiting,expired]=await Promise.all([sales(),products(),listOrders(),db.order.count({where:{status:"PENDING_PAYMENT"}}),db.order.count({where:{status:"PENDING_PAYMENT",payments:{some:{method:"BANK_TRANSFER",status:"PENDING",customerMarkedTransferredAt:{not:null}}}}}),db.order.count({where:{status:"PENDING_PAYMENT",reservationStatus:"RESERVED",reservationExpiresAt:{lte:new Date()}}})]);return {metrics,stock,recent:recent.orders.slice(0,5),pending,waiting,expired};}
  return {listOrders,transfers,detail,products,updateProduct,addNote,transition,releaseExpired,marketing,sales,dashboard,confirm:lifecycle.confirmPayment,cancel:lifecycle.cancelUnpaid};
}

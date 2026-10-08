import assert from "node:assert/strict";
import { after,before,beforeEach,test } from "node:test";
import { randomUUID } from "node:crypto";
import ExcelJS from "exceljs";
import { isolatedCommerceDatabase } from "@/server/commerce/test-database";
import { bootstrapAdmin } from "./bootstrap";
import { createAdminAuth } from "./auth";
import { createAdminService } from "./service";
import { exportOrders } from "./export";
import { createOrderService } from "@/server/commerce/orders";
import { hash } from "@/server/commerce/order-access";

let database:Awaited<ReturnType<typeof isolatedCommerceDatabase>>;
let adminId:string;
const password="Isolated-test-passphrase-5";
const denied=async()=>{throw new Error("Unauthorized");};
const bank={name:"ISOLATED TEST ONLY",holder:"TEST",type:"NON-PRODUCTION",number:"NOT-A-BANK-ACCOUNT"};
const guest=hash("admin-isolated-guest");
const payload=(slug="limon",quantity=1,consent=false)=>({customer:{firstName:"Test",lastName:"Customer",email:"customer@example.test",phone:"0991234567",province:"Pichincha",area:"quito",address:"Test address",deliveryInstructions:"Customer-only instructions"},items:[{id:slug,slug,quantity}],paymentMethod:"BANK_TRANSFER",marketingConsent:consent});
const service=()=>createAdminService(database.client,async()=>({id:adminId}));
const orderService=()=>createOrderService(database.client,()=>bank);
const create=async(slug="limon",quantity=1,consent=false)=>{const view=await orderService().create(payload(slug,quantity,consent),randomUUID(),guest);return database.client.order.findUniqueOrThrow({where:{accessId:view.accessId}});};
before(async()=>{database=await isolatedCommerceDatabase();});
after(async()=>{if(database)await database.close();});
beforeEach(async()=>{
 await database.memory.exec('TRUNCATE "AdminLoginLimit","AdminSession","AdminAuditEvent","MarketingConsentEvent","MarketingContact","InventoryMovement","OrderNote","Payment","OrderItem","Order","AdminUser","Product" RESTART IDENTITY CASCADE');
 adminId=await bootstrapAdmin(database.client,{email:"admin@example.test",password,confirmed:true});
 await database.client.product.createMany({data:[{id:"limon",slug:"limon",name:"USCHH Limón",flavor:"LIMÓN",price:"15.00",stock:20},{id:"mandarina",slug:"mandarina",name:"USCHH Mandarina",flavor:"MANDARINA",price:"15.00",stock:20}]});
});
test("bootstrap hashes individual passwords, refuses unsafe or duplicate setup and supports a second account",async()=>{
 const admin=await database.client.adminUser.findUniqueOrThrow({where:{id:adminId}});assert.ok(admin.passwordHash?.startsWith("scrypt$"));assert.ok(!admin.passwordHash?.includes(password));
 await assert.rejects(()=>bootstrapAdmin(database.client,{email:"other@example.test",password,confirmed:false}));await assert.rejects(()=>bootstrapAdmin(database.client,{email:"other@example.test",password,confirmed:true}));
 await bootstrapAdmin(database.client,{email:"other@example.test",password,confirmed:true,allowAdditional:true});assert.equal(await database.client.adminUser.count(),2);
 await assert.rejects(()=>bootstrapAdmin(database.client,{email:"admin@example.test",password,confirmed:true,allowAdditional:true}));
});
test("invalid and unknown credentials are generic; valid sessions are hashed, revocable and expire",async()=>{
 const auth=createAdminAuth(database.client);for(const email of ["admin@example.test","unknown@example.test"]){await assert.rejects(()=>auth.login({email,password:"wrong"}),{message:"Email o contraseña no válidos."});}
 const session=await auth.login({email:"admin@example.test",password});assert.equal((await auth.requireAdmin(session.token)).id,adminId);const row=await database.client.adminSession.findFirstOrThrow();assert.notEqual(row.tokenHash,session.token);assert.equal(row.tokenHash.length,64);
 await auth.logout(session.token);assert.equal(await auth.current(session.token),null);await assert.rejects(()=>auth.requireAdmin(session.token));
 const second=await auth.login({email:"admin@example.test",password});await database.client.adminSession.updateMany({data:{createdAt:new Date(Date.now()-10*3600000),expiresAt:new Date(Date.now()-3600000)}});assert.equal(await auth.current(second.token),null);
});
test("disabled accounts and missing sessions cannot access privileged services or export",async()=>{
 const auth=createAdminAuth(database.client);const {token}=await auth.login({email:"admin@example.test",password});await database.client.adminUser.update({where:{id:adminId},data:{active:false}});assert.equal(await auth.current(token),null);await assert.rejects(()=>auth.login({email:"admin@example.test",password}),{message:"Email o contraseña no válidos."});await assert.rejects(()=>auth.requireAdmin(undefined));
 const protectedService=createAdminService(database.client,denied);for(const call of [()=>protectedService.listOrders(),()=>protectedService.transfers(),()=>protectedService.products(),()=>protectedService.marketing(),()=>protectedService.sales(),()=>protectedService.releaseExpired(),()=>protectedService.addNote("fake","note"),()=>protectedService.updateProduct({}),()=>protectedService.confirm("fake"),()=>protectedService.cancel("fake","reason"),()=>exportOrders(database.client,denied,{})])await assert.rejects(call);
});
test("persistent login limits reject repeated brute-force attempts without revealing account existence",async()=>{
 const auth=createAdminAuth(database.client);for(let i=0;i<5;i++)await assert.rejects(()=>auth.login({email:"missing@example.test",password:"invalid"}));await assert.rejects(()=>auth.login({email:"missing@example.test",password:"invalid"}),{status:429});
 assert.equal((await database.client.adminLoginLimit.findMany()).length,2);
});
test("orders list/search/payment/waiting/status/expired filters and private detail are database-driven",async()=>{
 const first=await create();await orderService().markTransferred(first.accessId!,guest);const second=await create("mandarina");await service().confirm(second.id);
 assert.equal((await service().listOrders({status:"PENDING_PAYMENT"})).count,1);assert.equal((await service().listOrders({payment:"PAID"})).count,1);assert.equal((await service().listOrders({waiting:"true"})).count,1);assert.equal((await service().listOrders({q:"USCHH-000001"})).count,1);assert.equal((await service().listOrders({q:"customer@example.test"})).count,2);
 const detail=await service().detail("USCHH-000001");assert.equal(detail.email,"customer@example.test");assert.equal(detail.items[0].unitPrice.toFixed(2),"15.00");await assert.rejects(()=>service().detail("not-an-order"));
});
test("confirm is idempotent, audited, and does not deduct reserved stock again",async()=>{
 const order=await create("limon",2);assert.equal((await database.client.product.findUniqueOrThrow({where:{id:"limon"}})).stock,18);
 await Promise.all([service().confirm(order.id),service().confirm(order.id)]);await service().confirm(order.id);assert.equal((await database.client.product.findUniqueOrThrow({where:{id:"limon"}})).stock,18);assert.equal(await database.client.adminAuditEvent.count({where:{action:"PAYMENT_CONFIRMED"}}),1);assert.equal(await database.client.inventoryMovement.count({where:{type:"RESERVATION_CONFIRMED"}}),1);const payment=await database.client.payment.findFirstOrThrow();assert.equal(payment.status,"PAID");assert.equal(payment.verifiedById,adminId);assert.ok(payment.verifiedAt);const audit=await database.client.adminAuditEvent.findFirstOrThrow({where:{action:"PAYMENT_CONFIRMED"}});assert.equal((audit.details as {amount:string}).amount,"30.00");
});
test("transfer workspace separates review, unpaid, confirmed and closed bank orders",async()=>{
 const notified=await create();await orderService().markTransferred(notified.accessId!,guest);await create("mandarina");const confirmed=await create();await service().confirm(confirmed.id);const closed=await create("mandarina");await service().cancel(closed.id,"Isolated closed transfer");
 const review=await service().transfers({state:"review"}),pending=await service().transfers({state:"pending"}),paid=await service().transfers({state:"confirmed"}),failed=await service().transfers({state:"closed"});
 assert.equal(review.count,1);assert.equal(pending.count,1);assert.equal(paid.count,1);assert.equal(failed.count,1);assert.deepEqual(review.counts,{review:1,pending:1,confirmed:1,closed:1});assert.equal(review.orders[0].payments[0].customerMarkedTransferredAt!==null,true);assert.equal(paid.orders[0].payments[0].verifiedBy?.email,"admin@example.test");await assert.rejects(()=>service().transfers({state:"invalid"}));
});
test("confirmation creates a sale but rejects expired, cancelled and non-bank payments",async()=>{
 const sale=await create("limon",2);await orderService().markTransferred(sale.accessId!,guest);await service().confirm(sale.id);const metrics=await service().sales();assert.equal(metrics.all._count._all,1);assert.equal(metrics.all._sum.total?.toFixed(2),"30.00");assert.equal((await database.client.order.findUniqueOrThrow({where:{id:sale.id}})).status,"PAID");
 const expired=await create();const expiredStart=new Date(Date.now()-48*3600000);await database.client.order.update({where:{id:expired.id},data:{reservedAt:expiredStart,reservationExpiresAt:new Date(expiredStart.getTime()+24*3600000)}});await assert.rejects(()=>service().confirm(expired.id),{message:"La reserva venció. Revisa el ingreso y el inventario manualmente antes de continuar."});
 const cancelled=await create("mandarina");await service().cancel(cancelled.id,"Isolated cancellation");await assert.rejects(()=>service().confirm(cancelled.id),{message:"El pedido está cancelado y no puede confirmarse automáticamente."});
 const card=await create();await database.client.payment.updateMany({where:{orderId:card.id},data:{method:"CARD"}});await assert.rejects(()=>service().confirm(card.id),{message:"El pedido no corresponde a una transferencia bancaria."});
});
test("paid fulfillment advances only forward; shipment/delivery timestamps and actor audit are recorded",async()=>{
 const order=await create();await assert.rejects(()=>service().transition(order.id,{status:"SHIPPED",carrier:"Test",trackingNumber:"TEST"}));await service().confirm(order.id);await service().transition(order.id,{status:"PREPARING"});await assert.rejects(()=>service().transition(order.id,{status:"DELIVERED"}));
 await service().transition(order.id,{status:"SHIPPED",carrier:"Test courier",trackingNumber:"TEST-123"});await service().transition(order.id,{status:"DELIVERED"});await service().transition(order.id,{status:"DELIVERED"});await service().confirm(order.id);
 const updated=await database.client.order.findUniqueOrThrow({where:{id:order.id}});assert.ok(updated.shippedAt);assert.ok(updated.deliveredAt);assert.equal(updated.carrier,"Test courier");assert.equal(await database.client.adminAuditEvent.count({where:{action:"FULFILLMENT_CHANGED"}}),3);await assert.rejects(()=>service().transition(order.id,{status:"PREPARING"}));
});
test("cancel releases unpaid reservation once, while paid cancellation is never a silent refund",async()=>{
 const unpaid=await create("limon",2);await service().cancel(unpaid.id,"Test unpaid cancellation");await service().cancel(unpaid.id,"Retry");assert.equal((await database.client.product.findUniqueOrThrow({where:{id:"limon"}})).stock,20);assert.equal(await database.client.inventoryMovement.count({where:{type:"RESERVATION_RELEASED"}}),1);
 const paid=await create();await service().confirm(paid.id);await assert.rejects(()=>service().cancel(paid.id,"Not a refund"));assert.equal((await database.client.order.findUniqueOrThrow({where:{id:paid.id}})).status,"PAID");
});
test("notes retain actor/date and are not exposed through customer order output",async()=>{
 const order=await create();await service().addNote(order.id,"Private admin-only information");const detail=await service().detail("USCHH-000001");assert.equal(detail.notes[0].authorId,adminId);assert.ok(detail.notes[0].createdAt);assert.equal(detail.deliveryInstructions,"Customer-only instructions");const customer=await orderService().get(order.accessId!,guest);assert.equal(JSON.stringify(customer).includes("Private admin-only"),false);
});
test("price, active and available stock changes are audited; order snapshots and reservations stay intact",async()=>{
 const order=await create("limon",2);const product=(await service().products()).find(p=>p.id==="limon")!;assert.equal(product.reserved,2);
 await service().updateProduct({id:"limon",price:"19.80",stock:"7",active:false,reason:"Isolated adjustment",updatedAt:product.updatedAt.toISOString()});
 const updated=await database.client.product.findUniqueOrThrow({where:{id:"limon"}});assert.equal(updated.price.toFixed(2),"19.80");assert.equal(updated.stock,7);assert.equal(updated.active,false);
 const movement=await database.client.inventoryMovement.findFirstOrThrow({where:{type:"ADMIN_ADJUSTMENT"}});assert.equal(movement.delta,-11);assert.equal(movement.adminId,adminId);assert.equal(movement.stockAfter,7);assert.equal((await database.client.orderItem.findFirstOrThrow({where:{orderId:order.id}})).unitPrice.toFixed(2),"15.00");assert.equal((await service().products()).find(p=>p.id==="limon")!.reserved,2);
 await service().cancel(order.id,"Release test reservation");assert.equal((await database.client.product.findUniqueOrThrow({where:{id:"limon"}})).stock,9);
});
test("invalid prices, negative stock and stale versions are rejected without modifying products",async()=>{
 const product=await database.client.product.findUniqueOrThrow({where:{id:"limon"}});const values={id:product.id,price:"15.00",stock:"20",active:true,reason:"Test",updatedAt:product.updatedAt.toISOString()};for(const price of ["0","-1","1.001","NaN","10000000000.00"])await assert.rejects(()=>service().updateProduct({...values,price}));await assert.rejects(()=>service().updateProduct({...values,stock:"-1"}));await assert.rejects(()=>service().updateProduct({...values,updatedAt:new Date(0).toISOString()}));assert.equal(await database.client.inventoryMovement.count(),0);
});
test("analytics excludes unpaid, cancelled and refunded orders and totals both flavors accurately",async()=>{
 const limon=await create("limon",2);await service().confirm(limon.id);const orange=await create("mandarina",1);await service().confirm(orange.id);await create();const cancelled=await create();await service().cancel(cancelled.id,"Test");const refund=await create();await service().confirm(refund.id);const now=new Date();await database.client.order.update({where:{id:refund.id},data:{status:"REFUNDED",refundedAt:now}});await database.client.payment.updateMany({where:{orderId:refund.id},data:{status:"REFUNDED",refundedAt:now}});
 const sales=await service().sales();assert.equal(sales.all._sum.total?.toFixed(2),"45.00");assert.equal(sales.all._count._all,2);assert.equal(sales.units,3);assert.equal(sales.flavors.find(f=>f.flavor==="LIMÓN")?._sum.quantity,2);assert.equal(sales.flavors.find(f=>f.flavor==="MANDARINA")?._sum.quantity,1);assert.equal(sales.all._avg.total?.toFixed(2),"22.50");
});
test("marketing includes only currently granted traceable consent, excluding withdrawn and non-consenting customers",async()=>{
 await create("limon",1,true);await database.client.marketingContact.create({data:{email:"without@example.test"}});const contact=await database.client.marketingContact.findUniqueOrThrow({where:{email:"customer@example.test"}});assert.equal((await service().marketing()).count,1);await database.client.marketingContact.update({where:{id:contact.id},data:{status:"WITHDRAWN",withdrawnAt:new Date()}});assert.equal((await service().marketing()).count,0);
});
test("Excel export includes operational fields, preserves strings and excludes all auth/internal secrets",async()=>{
 const order=await create();await service().addNote(order.id,"PRIVATE NOTE NOT EXPORTED");await database.client.order.update({where:{id:order.id},data:{firstName:"=HYPERLINK(\"unsafe\")"}});
 const bytes=await exportOrders(database.client,async()=>({id:adminId}),{});const workbook=new ExcelJS.Workbook();await workbook.xlsx.load(Buffer.from(bytes) as unknown as ExcelJS.Buffer);const sheet=workbook.worksheets[0];assert.equal(sheet.getRow(1).getCell(1).value,"Pedido");assert.equal(sheet.getRow(2).getCell(1).value,"USCHH-000001");assert.equal(sheet.getRow(2).getCell(3).type,ExcelJS.ValueType.String);const values=JSON.stringify(sheet.getSheetValues());for(const forbidden of ["passwordHash","guestAccessHash","checkoutKey","tokenHash","PRIVATE NOTE NOT EXPORTED"])assert.equal(values.includes(forbidden),false);assert.ok(values.includes("customer@example.test"));assert.ok(values.includes("Customer-only instructions"));assert.equal(await database.client.adminAuditEvent.count({where:{action:"ORDERS_EXPORTED"}}),1);
});
test("expired batch release identifies unpaid reservations and restores each exactly once",async()=>{
 const order=await create("limon",2);const start=new Date(Date.now()-48*3600000);await database.client.order.update({where:{id:order.id},data:{reservedAt:start,reservationExpiresAt:new Date(start.getTime()+24*3600000)}});assert.equal((await service().listOrders({expired:"true"})).count,1);assert.equal((await service().dashboard()).expired,1);assert.equal(await service().releaseExpired(),1);assert.equal(await service().releaseExpired(),0);assert.equal((await database.client.product.findUniqueOrThrow({where:{id:"limon"}})).stock,20);assert.equal(await database.client.adminAuditEvent.count({where:{action:"RESERVATION_EXPIRED_RELEASED"}}),1);
});

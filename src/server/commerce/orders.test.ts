import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { randomUUID } from "node:crypto";
import { validateCheckout } from "@/lib/checkout/validation";
import { createOrderService } from "./orders";
import { createOrderLifecycle } from "./order-lifecycle";
import { hash } from "./order-access";
import { isolatedCommerceDatabase } from "./test-database";

let database: Awaited<ReturnType<typeof isolatedCommerceDatabase>>;
const bank={name:"ISOLATED TEST — NOT A BANK",holder:"TEST FIXTURE",type:"NON-PRODUCTION",number:"TEST-NOT-A-BANK-ACCOUNT"};
const guest=hash("isolated-test-guest");
const customer={firstName:"Test",lastName:"Fixture",email:"test@example.test",phone:"0991234567",province:"Pichincha",area:"quito",address:"Isolated fixture address",deliveryInstructions:""};
const input=(quantity=1,extra={})=>({customer,items:[{id:"lemon",slug:"limon",quantity}],paymentMethod:"BANK_TRANSFER",marketingConsent:false,...extra});
const service=()=>createOrderService(database.client,()=>bank);
before(async()=>{database=await isolatedCommerceDatabase();});
after(async()=>{if(database)await database.close();});
beforeEach(async()=>{
  await database.memory.exec('TRUNCATE "MarketingConsentEvent","MarketingContact","InventoryMovement","OrderNote","Payment","OrderItem","Order","AdminUser","Product" RESTART IDENTITY CASCADE');
  await database.client.product.createMany({data:[{id:"lemon",slug:"limon",name:"USCHH Limón",flavor:"LIMÓN",price:"15.00",stock:5},{id:"orange",slug:"mandarina",name:"USCHH Mandarina",flavor:"MANDARINA",price:"15.00",stock:5}]});
});
test("valid checkout creates unpaid order/payment, reservation and exact authoritative totals",async()=>{
  const result=await service().create(input(),randomUUID(),guest);
  assert.equal(result.number,"USCHH-000001");assert.equal(result.total,"$15.00");assert.equal(result.shippingMode,"PAY_ON_DELIVERY");
  const order=await database.client.order.findFirstOrThrow({include:{items:true,payments:true}});
  assert.equal(order.status,"PENDING_PAYMENT");assert.equal(order.reservationStatus,"RESERVED");assert.equal(order.payments[0].status,"PENDING");assert.equal(order.payments[0].method,"BANK_TRANSFER");assert.equal(order.shippingAmount,null);
  assert.equal(order.reservationExpiresAt!.getTime()-order.reservedAt!.getTime(),24*3600000);
  assert.equal((await database.client.product.findUniqueOrThrow({where:{id:"lemon"}})).stock,4);
  assert.equal((await database.client.inventoryMovement.findFirstOrThrow()).type,"RESERVATION");
});
test("required fields, email, phone, area, method and quantity are validated",async()=>{
  for(const firstName of ["",null,undefined])assert.throws(()=>validateCheckout(input(1,{customer:{...customer,firstName}})));
  for(const field of ["lastName","email","phone","province","area","address"])assert.throws(()=>validateCheckout(input(1,{customer:{...customer,[field]:""}})));
  assert.throws(()=>validateCheckout(input(1,{customer:{...customer,email:"not-email"}})));
  assert.throws(()=>validateCheckout(input(1,{customer:{...customer,phone:"letters"}})));
  assert.throws(()=>validateCheckout(input(1,{customer:{...customer,area:"guayaquil"}})));
  assert.throws(()=>validateCheckout(input(1,{paymentMethod:"CARD"})));
  for(const quantity of [0,6,1.5,-1])await assert.rejects(()=>service().create(input(quantity),randomUUID(),guest));
  assert.equal(await database.client.order.count(),0);
});
test("approved areas include Puembo and Los Chillos, without nationwide delivery",()=>{
  for(const area of ["quito","tumbaco","cumbaya","puembo","los-chillos"])assert.equal(validateCheckout(input(1,{customer:{...customer,area}})).customer.province,"Pichincha");
});
test("inactive, empty and insufficient stock are rejected with no partial records",async()=>{
  for(const state of [{active:false,stock:5},{active:true,stock:0},{active:true,stock:1}]){
    await database.client.product.update({where:{id:"lemon"},data:state});
    await assert.rejects(()=>service().create(input(2),randomUUID(),guest));
    assert.equal(await database.client.order.count(),0);assert.equal(await database.client.payment.count(),0);assert.equal(await database.client.inventoryMovement.count(),0);
  }
});
test("server ignores manipulated price, total, shipping and status; uses latest price",async()=>{
  await database.client.product.update({where:{id:"lemon"},data:{price:"17.25"}});
  const result=await service().create(input(1,{price:0,subtotal:0,total:0,shippingMode:"FREE",status:"PAID",items:[{id:"lemon",slug:"limon",quantity:1,price:0,stock:999}]}),randomUUID(),guest);
  assert.equal(result.total,"$17.25");assert.equal(result.status,"PENDING_PAYMENT");assert.equal(result.shippingMode,"PAY_ON_DELIVERY");
});
test("free shipping starts at authoritative $30 with known zero fee",async()=>{
  const result=await service().create(input(2),randomUUID(),guest);assert.equal(result.shippingMode,"FREE");assert.equal(result.total,"$30.00");
  assert.equal((await database.client.order.findFirstOrThrow()).shippingAmount?.toFixed(2),"0.00");
});
test("five units per flavor permits five of each but not duplicated flavor overflow",async()=>{
  const result=await service().create(input(5,{items:[{id:"lemon",slug:"limon",quantity:5},{id:"orange",slug:"mandarina",quantity:5}]}),randomUUID(),guest);assert.equal(result.total,"$150.00");
});
test("retry and concurrent duplicate submission reserve once; payload or session mismatch rejected",async()=>{
  const key=randomUUID();const results=await Promise.all([service().create(input(2),key,guest),service().create(input(2),key,guest)]);
  assert.equal(results[0].accessId,results[1].accessId);assert.equal(await database.client.order.count(),1);assert.equal(await database.client.inventoryMovement.count(),1);assert.equal((await database.client.product.findUniqueOrThrow({where:{id:"lemon"}})).stock,3);
  await assert.rejects(()=>service().create(input(1),key,guest));await assert.rejects(()=>service().create(input(2),key,hash("other-session")));
});
test("competing checkouts cannot oversell and failures roll back reservations",async()=>{
  await database.client.product.update({where:{id:"lemon"},data:{stock:3}});
  const results=await Promise.allSettled([service().create(input(2),randomUUID(),guest),service().create(input(2),randomUUID(),guest)]);
  assert.equal(results.filter(r=>r.status==="fulfilled").length,1);assert.equal(await database.client.order.count(),1);assert.equal((await database.client.product.findUniqueOrThrow({where:{id:"lemon"}})).stock,1);
});
test("transfer claim is idempotent, remains unpaid, and requires secure session",async()=>{
  const order=await service().create(input(),randomUUID(),guest);
  await assert.rejects(()=>service().get(order.accessId,hash("other")));await assert.rejects(()=>service().get(randomUUID(),guest));await assert.rejects(()=>service().markTransferred(order.accessId,hash("other")));
  const first=await service().markTransferred(order.accessId,guest),again=await service().markTransferred(order.accessId,guest);
  assert.equal(first.customerMarkedTransferredAt,again.customerMarkedTransferredAt);assert.equal(again.status,"PENDING_PAYMENT");assert.equal((await database.client.payment.findFirstOrThrow()).status,"PENDING");
});
test("cancel unpaid releases inventory exactly once with audit history",async()=>{
  const admin=await database.client.adminUser.create({data:{email:"admin@example.test",active:true}});const lifecycle=createOrderLifecycle(database.client,async()=>admin.id);
  await service().create(input(2),randomUUID(),guest);const order=await database.client.order.findFirstOrThrow();
  await lifecycle.cancelUnpaid(order.id,"Isolated test cancellation");await lifecycle.cancelUnpaid(order.id,"Repeated test");
  assert.equal((await database.client.product.findUniqueOrThrow({where:{id:"lemon"}})).stock,5);assert.equal(await database.client.inventoryMovement.count({where:{type:"RESERVATION_RELEASED"}}),1);assert.equal((await database.client.order.findFirstOrThrow()).status,"CANCELLED");assert.equal((await database.client.payment.findFirstOrThrow()).status,"FAILED");
});
test("privileged confirmation converts reservation once without another stock deduction",async()=>{
  const admin=await database.client.adminUser.create({data:{email:"admin@example.test",active:true}});const lifecycle=createOrderLifecycle(database.client,async()=>admin.id);
  await service().create(input(2),randomUUID(),guest);const order=await database.client.order.findFirstOrThrow();
  await lifecycle.confirmPayment(order.id);await lifecycle.confirmPayment(order.id);
  assert.equal((await database.client.product.findUniqueOrThrow({where:{id:"lemon"}})).stock,3);assert.equal(await database.client.inventoryMovement.count({where:{type:"RESERVATION_CONFIRMED"}}),1);assert.equal((await database.client.payment.findFirstOrThrow()).status,"PAID");
  await assert.rejects(()=>lifecycle.cancelUnpaid(order.id,"Not an unpaid reservation"));
  await assert.rejects(()=>createOrderLifecycle(database.client,async()=>"unauthenticated").confirmPayment(order.id));
});
test("marketing consent checked is traceable once; unchecked creates no opt-in",async()=>{
  await service().create(input(),randomUUID(),guest);assert.equal(await database.client.marketingContact.count(),0);
  const key=randomUUID();const checked=input(1,{marketingConsent:true});await service().create(checked,key,guest);await service().create(checked,key,guest);
  const contact=await database.client.marketingContact.findFirstOrThrow();assert.equal(contact.status,"GRANTED");assert.equal(contact.consentSource,"GUEST_CHECKOUT");assert.ok(contact.consentAt);assert.ok(contact.consentText);assert.ok(contact.consentVersion);assert.equal(await database.client.marketingConsentEvent.count(),1);
});
test("expired reservation rejects transfer claims and confirmations without restoring implicitly",async()=>{
  const order=await service().create(input(),randomUUID(),guest);
  const past=new Date(Date.now()-48*3600000);await database.client.order.update({where:{accessId:order.accessId},data:{reservedAt:past,reservationExpiresAt:new Date(past.getTime()+24*3600000)}});
  await assert.rejects(()=>service().markTransferred(order.accessId,guest));assert.equal((await database.client.product.findUniqueOrThrow({where:{id:"lemon"}})).stock,4);
});
test("missing bank configuration or database failure cannot create a partial order",async()=>{
  await assert.rejects(()=>createOrderService(database.client,()=>null).create(input(),randomUUID(),guest));assert.equal(await database.client.order.count(),0);
  const unreachable = new (database.client.constructor as typeof import("@/generated/prisma/client").PrismaClient)({adapter:new (await import("@prisma/adapter-pg")).PrismaPg({connectionString:"postgresql://test:test@127.0.0.1:1/test",connectionTimeoutMillis:100})});
  try{await assert.rejects(()=>createOrderService(unreachable,()=>bank).create(input(),randomUUID(),guest));}finally{await unreachable.$disconnect();}
  assert.equal(await database.client.order.count(),0);
});

test("multiple product identifiers of the same flavor cannot bypass the five-unit limit",async()=>{
  await database.client.product.update({where:{id:"orange"},data:{flavor:"LIMÓN"}});
  await assert.rejects(()=>service().create(input(3,{items:[{id:"lemon",slug:"limon",quantity:3},{id:"orange",slug:"mandarina",quantity:3}]}),randomUUID(),guest));
  assert.equal(await database.client.order.count(),0);
});
test("database failure after reservation rolls back order, stock, payment and consent",async()=>{
  await database.memory.exec(`CREATE FUNCTION isolated_fail_movement() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'isolated test failure'; END $$; CREATE TRIGGER isolated_fail BEFORE INSERT ON "InventoryMovement" FOR EACH ROW EXECUTE FUNCTION isolated_fail_movement();`);
  try{await assert.rejects(()=>service().create(input(2,{marketingConsent:true}),randomUUID(),guest));
    assert.equal(await database.client.order.count(),0);assert.equal(await database.client.payment.count(),0);assert.equal(await database.client.inventoryMovement.count(),0);assert.equal(await database.client.marketingContact.count(),0);assert.equal((await database.client.product.findUniqueOrThrow({where:{id:"lemon"}})).stock,5);
  }finally{await database.memory.exec('DROP TRIGGER isolated_fail ON "InventoryMovement"; DROP FUNCTION isolated_fail_movement()');}
});
test("optional multiline delivery instructions and consent unchecked do not revoke existing consent",async()=>{
  assert.equal(validateCheckout(input(1,{marketingConsent:undefined})).marketingConsent,false);
  assert.throws(()=>validateCheckout(input(1,{marketingConsent:"false"})));
  const checked=input(1,{marketingConsent:true,customer:{...customer,deliveryInstructions:"Primera línea\nSegunda línea"}});
  await service().create(checked,randomUUID(),guest);
  await service().create(input(),randomUUID(),guest);
  assert.equal((await database.client.marketingContact.findFirstOrThrow()).status,"GRANTED");assert.equal(await database.client.marketingConsentEvent.count(),1);
});

test("database rejects reserved orders without expiration or bank instruction snapshot",async()=>{
  const order=await service().create(input(),randomUUID(),guest);
  await assert.rejects(()=>database.client.order.update({where:{accessId:order.accessId},data:{reservationExpiresAt:null}}));
  await assert.rejects(()=>database.client.$executeRaw`UPDATE "Order" SET "bankDetails"=NULL WHERE "accessId"=${order.accessId}`);
});

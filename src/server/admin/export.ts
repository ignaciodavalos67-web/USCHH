import "server-only";
import ExcelJS from "exceljs";
import type { PrismaClient } from "@/generated/prisma/client";
import { orderFilter, type Filters } from "./service";
import { AdminError } from "./errors";
import { formatOrderNumber } from "@/server/commerce/policies";
export async function exportOrders(db:PrismaClient,requireAdmin:()=>Promise<{id:string}>,filters:Filters) {
  const admin=await requireAdmin();const where=orderFilter(filters);const count=await db.order.count({where});
  if(count>5000)throw new AdminError("Reduce el rango o los filtros: el máximo por exportación es 5.000 pedidos.");
  const workbook=new ExcelJS.Workbook();workbook.creator="USCHH";const sheet=workbook.addWorksheet("Pedidos");
  const headings=["Pedido","Creado (UTC)","Nombre","Apellido","Email","Teléfono","Provincia","Ciudad / Sector","Dirección","Instrucciones de entrega","Productos","Cantidades","Subtotal USD","Envío","Importe envío USD","Total USD","Método de pago","Estado de pago","Estado pedido","Transportista","Seguimiento","Enviado (UTC)","Entregado (UTC)"];
  sheet.addRow(headings);sheet.getRow(1).font={bold:true};sheet.views=[{state:"frozen",ySplit:1}];
  // Database reads are bounded and keyset-paginated; credentials/notes are never selected.
  let cursor:string|undefined;let written=0;
  while(written<5000){const orders=await db.order.findMany({where,orderBy:{id:"asc"},take:Math.min(250,5000-written),...(cursor ? {cursor:{id:cursor},skip:1} : {}),select:{id:true,number:true,createdAt:true,firstName:true,lastName:true,email:true,phone:true,province:true,city:true,area:true,address:true,deliveryInstructions:true,subtotal:true,shippingMode:true,shippingAmount:true,total:true,status:true,carrier:true,trackingNumber:true,shippedAt:true,deliveredAt:true,items:{select:{productName:true,flavor:true,quantity:true}},payments:{select:{method:true,status:true}}}});if(!orders.length)break;
    for(const order of orders)sheet.addRow([formatOrderNumber(order.number),order.createdAt.toISOString(),order.firstName,order.lastName,order.email,order.phone,order.province,order.city,order.address,order.deliveryInstructions ?? "",order.items.map(item=>`${item.productName} (${item.flavor})`).join("; "),order.items.map(item=>item.quantity).join("; "),Number(order.subtotal.toFixed(2)),order.shippingMode,order.shippingAmount===null ? null : Number(order.shippingAmount.toFixed(2)),Number(order.total.toFixed(2)),order.payments.map(p=>p.method).join("; "),order.payments.map(p=>p.status).join("; "),order.status,order.carrier ?? "",order.trackingNumber ?? "",order.shippedAt?.toISOString() ?? "",order.deliveredAt?.toISOString() ?? ""]);
    written+=orders.length;cursor=orders.at(-1)!.id;
  }
  sheet.columns.forEach((column,index)=>{column.width=[2,3,4,5,8,9,10].includes(index)?32:22;});for(const column of [13,15,16])sheet.getColumn(column).numFmt='0.00';sheet.autoFilter={from:"A1",to:"W1"};
  await db.adminAuditEvent.create({data:{adminId:admin.id,action:"ORDERS_EXPORTED",entityType:"Order",entityId:"filtered-export",details:{rows:written}}});
  return new Uint8Array(await workbook.xlsx.writeBuffer());
}

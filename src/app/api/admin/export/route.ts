import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/context";
import { exportOrders } from "@/server/admin/export";
import { adminApiError } from "@/server/admin/api";
export async function GET(request:Request){try{await requireAdmin();const filters=Object.fromEntries(new URL(request.url).searchParams);const buffer=await exportOrders(prisma,requireAdmin,filters);return new Response(buffer,{headers:{"Content-Type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","Content-Disposition":'attachment; filename="uschh-pedidos.xlsx"',"Cache-Control":"no-store"}});}catch(error){return adminApiError(error);}}

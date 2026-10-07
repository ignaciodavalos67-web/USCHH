import { NextResponse } from "next/server";
import { adminService, requireAdmin } from "@/server/admin/context";
import { adminApiError } from "@/server/admin/api";
import { AdminError, id, text } from "@/server/admin/errors";
import { readBody, sameOrigin } from "@/server/commerce/checkout-api";
export async function POST(request:Request){try{await requireAdmin();sameOrigin(request);const body=await readBody(request);if(["confirm","cancel","releaseExpired","product"].includes(body.action) && body.confirmed!==true)throw new AdminError("Confirma la acción antes de continuar.");
  switch(body.action){case "confirm":await adminService.confirm(id(body.id));break;case "cancel":await adminService.cancel(id(body.id),text(body.reason,"el motivo",500));break;case "note":await adminService.addNote(id(body.id),body.content);break;case "transition":await adminService.transition(id(body.id),body);break;case "product":await adminService.updateProduct(body);break;case "releaseExpired":return NextResponse.json({ok:true,released:await adminService.releaseExpired()},{headers:{"Cache-Control":"no-store"}});default:throw new AdminError("Acción no válida.");}
  return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
}catch(error){return adminApiError(error);}}

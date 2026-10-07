import "server-only";
import { NextResponse } from "next/server";
import { CheckoutError } from "@/lib/checkout/validation";
import { createOrderService } from "./orders";
import { prisma } from "@/lib/prisma";
import { getBankDetails } from "./bank";
export const orders=createOrderService(prisma,getBankDetails);
export function sameOrigin(request: Request) {
  const origin=request.headers.get("origin");
  if(!origin || origin!==new URL(request.url).origin)throw new CheckoutError("ORIGIN","Solicitud no válida.",403);
}
export async function readBody(request: Request) {
  if(!request.headers.get("content-type")?.startsWith("application/json"))throw new CheckoutError("BODY","Solicitud no válida.",415);
  const reader=request.body?.getReader();if(!reader)throw new CheckoutError("BODY","Solicitud no válida.");
  const chunks: Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();throw new CheckoutError("BODY","Solicitud demasiado grande.",413);}chunks.push(value);}
  try{const body=JSON.parse(Buffer.concat(chunks).toString("utf8"));if(!body || typeof body!=="object" || Array.isArray(body))throw new Error();return body;}catch{throw new CheckoutError("BODY","Solicitud no válida.");}
}
export function apiError(error: unknown) {
  return NextResponse.json({error:error instanceof CheckoutError ? error.message : "No podemos procesar el pedido ahora. Inténtalo de nuevo.",code:error instanceof CheckoutError ? error.code : "UNAVAILABLE"},{status:error instanceof CheckoutError ? error.status : 503,headers:{"Cache-Control":"no-store"}});
}

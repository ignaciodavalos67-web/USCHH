import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError, orders, readBody, sameOrigin } from "@/server/commerce/checkout-api";
import { GUEST_COOKIE, requireSession } from "@/server/commerce/order-access";
export async function POST(request: Request) {
  try{sameOrigin(request);const guestHash=requireSession((await cookies()).get(GUEST_COOKIE)?.value);const body=await readBody(request);
    if(typeof body.accessId!=="string" || !/^[a-f0-9-]{36}$/i.test(body.accessId))return NextResponse.json({error:"Pedido no disponible."},{status:404});
    const order=await orders.markTransferred(body.accessId,guestHash);
    return NextResponse.json({customerMarkedTransferredAt:order.customerMarkedTransferredAt},{headers:{"Cache-Control":"no-store"}});
  }catch(error){return apiError(error);}
}

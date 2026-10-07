import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError, orders, readBody, sameOrigin } from "@/server/commerce/checkout-api";
import { GUEST_COOKIE, requireSession } from "@/server/commerce/order-access";
export async function POST(request: Request) {
  try{sameOrigin(request);const guestHash=requireSession((await cookies()).get(GUEST_COOKIE)?.value);const body=await readBody(request);
    const order=await orders.create(body,request.headers.get("idempotency-key"),guestHash);
    return NextResponse.json({url:`/checkout/exito/${order.accessId}`},{headers:{"Cache-Control":"no-store"}});
  }catch(error){return apiError(error);}
}
export async function GET(request: Request) {
  try{const guestHash=requireSession((await cookies()).get(GUEST_COOKIE)?.value);const key=new URL(request.url).searchParams.get("attempt");const order=key ? await orders.recover(key,guestHash) : null;
    return NextResponse.json({url:order ? `/checkout/exito/${order.accessId}` : null},{headers:{"Cache-Control":"no-store"}});
  }catch(error){return apiError(error);}
}

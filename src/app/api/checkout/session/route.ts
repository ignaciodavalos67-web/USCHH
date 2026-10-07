import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getBankDetails } from "@/server/commerce/bank";
import { GUEST_COOKIE, validSession } from "@/server/commerce/order-access";
export async function GET() {
  const store=await cookies();const existing=store.get(GUEST_COOKIE)?.value;
  const response=NextResponse.json({bankTransferAvailable:!!getBankDetails()},{headers:{"Cache-Control":"no-store"}});
  if(!validSession(existing))response.cookies.set(GUEST_COOKIE,randomBytes(32).toString("hex"),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:30*24*3600});
  return response;
}

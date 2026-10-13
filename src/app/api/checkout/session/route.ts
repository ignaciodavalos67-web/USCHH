import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getBankDetails } from "@/server/commerce/bank";
import { getPayphoneConfig } from "@/server/commerce/payphone-config";
import { GUEST_COOKIE, validSession } from "@/server/commerce/order-access";

export async function GET() {
  const store = await cookies();
  const existing = store.get(GUEST_COOKIE)?.value;
  const bank = getBankDetails();
  const payphone = getPayphoneConfig();
  const response = NextResponse.json(
    {
      bankTransferAvailable: !!bank,
      bankDetails: bank,
      payphoneAvailable: !!payphone,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
  if (!validSession(existing)) {
    response.cookies.set(GUEST_COOKIE, randomBytes(32).toString("hex"), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 3600,
    });
  }
  return response;
}

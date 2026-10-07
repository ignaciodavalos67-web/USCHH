import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminAuth } from "@/server/admin/context";
import { ADMIN_COOKIE } from "@/server/admin/auth";
import { adminApiError } from "@/server/admin/api";
import { sameOrigin } from "@/server/commerce/checkout-api";
export async function POST(request:Request){try{sameOrigin(request);await adminAuth.logout((await cookies()).get(ADMIN_COOKIE)?.value);const response=NextResponse.json({ok:true});response.cookies.set(ADMIN_COOKIE,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:0});return response;}catch(error){return adminApiError(error);}}

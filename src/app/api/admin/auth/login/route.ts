import { NextResponse } from "next/server";
import { adminAuth } from "@/server/admin/context";
import { ADMIN_COOKIE, SESSION_SECONDS } from "@/server/admin/auth";
import { adminApiError } from "@/server/admin/api";
import { readBody, sameOrigin } from "@/server/commerce/checkout-api";
export async function POST(request:Request){try{sameOrigin(request);const result=await adminAuth.login(await readBody(request));const response=NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});response.cookies.set(ADMIN_COOKIE,result.token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:SESSION_SECONDS});return response;}catch(error){return adminApiError(error);}}

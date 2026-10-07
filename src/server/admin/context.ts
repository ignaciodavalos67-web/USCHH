import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminAuth, ADMIN_COOKIE } from "./auth";
import { createAdminService } from "./service";
export const adminAuth=createAdminAuth(prisma);
export const requireAdmin=async()=>adminAuth.requireAdmin((await cookies()).get(ADMIN_COOKIE)?.value);
export async function requireAdminPage(){const admin=await adminAuth.current((await cookies()).get(ADMIN_COOKIE)?.value);if(!admin)redirect("/admin/login");return admin;}
export const adminService=createAdminService(prisma,requireAdmin);

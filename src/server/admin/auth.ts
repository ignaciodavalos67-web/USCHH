import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { PrismaClient } from "@/generated/prisma/client";
import { AdminError } from "./errors";
import { DUMMY_HASH, verifyPassword } from "./password";
export const ADMIN_COOKIE="uschh_admin_session";
export const SESSION_SECONDS=8*3600;
const digest=(value:string)=>createHash("sha256").update(value).digest("hex");
export function createAdminAuth(db:PrismaClient) {
  async function current(token: string | undefined) {
    if(!token || !/^[a-f0-9]{64}$/.test(token))return null;
    const session=await db.adminSession.findUnique({where:{tokenHash:digest(token)},select:{expiresAt:true,revokedAt:true,admin:{select:{id:true,email:true,name:true,active:true}}}});
    if(!session || session.revokedAt || session.expiresAt<=new Date() || !session.admin.active)return null;
    return {id:session.admin.id,email:session.admin.email,name:session.admin.name};
  }
  async function requireAdmin(token:string | undefined) {const admin=await current(token);if(!admin)throw new AdminError("Acceso no autorizado.",401);return admin;}
  async function consumeAttempt(email:string) {
    return db.$transaction(async tx=>{
      const now=new Date(),resetAt=new Date(now.getTime()+15*60000);
      // Global guard first bounds both hashing work and attacker-created limit rows.
      for(const [key,limit] of [[digest("admin-login-global"),50],[digest(`admin-login-email:${email}`),5]] as const){
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key},0))::text`;
        const bucket=await tx.adminLoginLimit.findUnique({where:{key}});
        if(bucket && bucket.resetAt>now && bucket.attempts>=limit)return false;
        await tx.adminLoginLimit.upsert({where:{key},create:{key,attempts:1,resetAt},update:bucket && bucket.resetAt>now ? {attempts:{increment:1}} : {attempts:1,resetAt}});
      }
      await tx.adminLoginLimit.deleteMany({where:{resetAt:{lt:new Date(now.getTime()-24*3600000)}}});return true;
    });
  }
  async function login(value:unknown) {
    const body=value && typeof value==="object" ? value as Record<string,unknown> : {};
    const email=typeof body.email==="string" ? body.email.trim().toLowerCase() : "";
    const password=typeof body.password==="string" ? body.password : "";
    if(email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length>128 || !password)throw new AdminError("Email o contraseña no válidos.",401);
    if(!await consumeAttempt(email))throw new AdminError("Email o contraseña no válidos. Inténtalo más tarde.",429);
    const admin=await db.adminUser.findUnique({where:{email},select:{id:true,active:true,passwordHash:true}});
    const valid=await verifyPassword(password,admin?.passwordHash ?? DUMMY_HASH);
    if(!admin?.active || !valid)throw new AdminError("Email o contraseña no válidos.",401);
    const token=randomBytes(32).toString("hex"),expiresAt=new Date(Date.now()+SESSION_SECONDS*1000);
    await db.$transaction(async tx=>{
      await tx.adminSession.deleteMany({where:{expiresAt:{lt:new Date()}}});
      await tx.adminSession.create({data:{tokenHash:digest(token),adminId:admin.id,expiresAt}});
      await tx.adminAuditEvent.create({data:{adminId:admin.id,action:"LOGIN",entityType:"AdminUser",entityId:admin.id}});
    });return {token,expiresAt};
  }
  async function logout(token:string|undefined){if(token && /^[a-f0-9]{64}$/.test(token))await db.adminSession.updateMany({where:{tokenHash:digest(token),revokedAt:null},data:{revokedAt:new Date()}});}
  return {current,requireAdmin,login,logout};
}

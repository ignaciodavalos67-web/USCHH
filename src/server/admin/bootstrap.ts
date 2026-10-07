import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { hashPassword } from "./password";
import { AdminError } from "./errors";
export async function bootstrapAdmin(db:PrismaClient,config:{email:string;password:string;name?:string;confirmed:boolean;allowAdditional?:boolean}) {
  const email=config.email.trim().toLowerCase();if(!config.confirmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254)throw new AdminError("Revisa la confirmación y el email del administrador.");
  const passwordHash=await hashPassword(config.password);
  return db.$transaction(async tx=>{
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended('admin-bootstrap',0))::text`;
    if(!config.allowAdditional && await tx.adminUser.count())throw new AdminError("Ya existe un administrador. Autoriza explícitamente una cuenta adicional.");
    if(await tx.adminUser.findUnique({where:{email}}))throw new AdminError("La cuenta ya existe; no se modificó su contraseña.");
    const admin=await tx.adminUser.create({data:{email,name:config.name?.trim().slice(0,80)||null,passwordHash,active:true}});
    await tx.adminAuditEvent.create({data:{adminId:admin.id,action:"ACCOUNT_BOOTSTRAP",entityType:"AdminUser",entityId:admin.id}});return admin.id;
  });
}

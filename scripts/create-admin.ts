import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { bootstrapAdmin } from "../src/server/admin/bootstrap";
async function main(){
  const connectionString=process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if(!connectionString)throw new Error();const db=new PrismaClient({adapter:new PrismaPg({connectionString})});
  try{await bootstrapAdmin(db,{email:process.env.ADMIN_BOOTSTRAP_EMAIL ?? "",password:process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "",name:process.env.ADMIN_BOOTSTRAP_NAME,confirmed:process.env.ADMIN_BOOTSTRAP_CONFIRM==="true",allowAdditional:process.env.ADMIN_BOOTSTRAP_ALLOW_ADDITIONAL==="true"});console.log("Administrador creado. No se mostraron credenciales.");}finally{await db.$disconnect();delete process.env.ADMIN_BOOTSTRAP_PASSWORD;}
}
main().catch(()=>{console.error("No se creó el administrador. Revisa la configuración, confirmación y requisitos documentados. No se modificaron cuentas existentes.");process.exitCode=1;});

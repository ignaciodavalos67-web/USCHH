import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

// Always creates an in-memory database. Never reads DATABASE_URL/DIRECT_URL.
export async function isolatedCommerceDatabase() {
  const memory=await PGlite.create();
  for(const migration of (await readdir(join(process.cwd(),"prisma/migrations"))).sort()){
    if(migration==="migration_lock.toml")continue;
    await memory.exec(await readFile(join(process.cwd(),"prisma/migrations",migration,"migration.sql"),"utf8"));
  }
  const server=new PGLiteSocketServer({db:memory,port:0,host:"127.0.0.1",maxConnections:100});await server.start();
  const client=new PrismaClient({adapter:new PrismaPg({connectionString:`postgresql://postgres:postgres@${server.getServerConn()}/postgres`,max:1,connectionTimeoutMillis:3000})});
  return {client, memory, server, close:async()=>{await client.$disconnect();await server.stop();await memory.close();}};
}

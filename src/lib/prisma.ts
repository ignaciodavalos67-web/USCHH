import "server-only";
import { createHash } from "node:crypto";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaModelSignature: string | undefined;
  prismaDatasourceHash: string | undefined;
  prismaPool: Pool | undefined;
};

function createPrismaClient(connectionString: string) {
  const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
  const adapter = new PrismaPg(pool);
  return { client: new PrismaClient({ adapter }), pool };
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required for database access.");
const datasourceHash = createHash("sha256").update(connectionString).digest("hex");
// Stable across Next's separate page/API bundles; constructor identity is not.
const modelSignature = JSON.stringify([
  Prisma.prismaVersion.client,
  Prisma.ModelName,
  Object.entries(Prisma).filter(([name]) => name.endsWith("ScalarFieldEnum")).sort(([a], [b]) => a.localeCompare(b)),
]);
// HMR must not retain a client generated before new models, or its old connection.
const reusable = process.env.NODE_ENV !== "production"
  && globalForPrisma.prisma
  && globalForPrisma.prismaModelSignature === modelSignature
  && globalForPrisma.prismaDatasourceHash === datasourceHash;
if (!reusable && globalForPrisma.prisma) {
  void globalForPrisma.prisma.$disconnect().catch(() => {});
  void globalForPrisma.prismaPool?.end().catch(() => {});
}
const created = reusable ? undefined : createPrismaClient(connectionString);
export const prisma = created?.client ?? globalForPrisma.prisma!;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaModelSignature = modelSignature;
  globalForPrisma.prismaDatasourceHash = datasourceHash;
  if (created) globalForPrisma.prismaPool = created.pool;
}

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { initialProducts } from "./catalog";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DIRECT_URL or DATABASE_URL is required to seed products.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

try {
  await prisma.$transaction(initialProducts.map(product => prisma.product.upsert({
    where: { slug: product.slug },
    update: {},
    create: { ...product, stock: 0, active: true },
  })));
  console.log("Initial products ensured. Existing values preserved; new products have stock 0. Set real inventory before enabling purchases.");
} catch {
  console.error("Product seed failed. Check database credentials and migration status; no partial seed was committed.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}

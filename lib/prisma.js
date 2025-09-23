import { PrismaClient } from "@prisma/client";
let globalForPrisma = globalThis;

if (!globalForPrisma.__prismaClient) {
  globalForPrisma.__prismaClient = new PrismaClient();
}

const prisma = globalForPrisma.__prismaClient;

export default prisma;

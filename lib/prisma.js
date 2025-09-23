import { PrismaClient } from "./generated/prisma";
let globalForPrisma = globalThis;

if (!globalForPrisma.__prismaClient) {
  globalForPrisma.__prismaClient = new PrismaClient();
}

const prisma = globalForPrisma.__prismaClient;

export default prisma;

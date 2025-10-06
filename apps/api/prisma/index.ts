import { PrismaClient } from "../src/generated/prisma/index.js";

export const prisma = new PrismaClient();

export type AppPrisma = typeof prisma;

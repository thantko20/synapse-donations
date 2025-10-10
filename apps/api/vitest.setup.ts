import { config } from "dotenv";
import { resolve } from "path";
import { beforeEach } from "vitest";
import { prisma, type AppPrisma } from "./prisma/index.js";

// Load test environment variables
config({ path: resolve(process.cwd(), ".env.test") });

process.env.NODE_ENV = "test";

export const resetDatabase = async (prisma: AppPrisma) => {
  console.log("Resetting database...");
  await prisma.$transaction(async (tx) => {
    await tx.adminSession.deleteMany();
    await tx.admin.deleteMany();
    await tx.user.deleteMany();
    await tx.orgMembers.deleteMany();
    await tx.organization.deleteMany();
    await tx.donation.deleteMany();
    await tx.campaign.deleteMany();
    await tx.adminSession.deleteMany();
  });
  console.log("Database reset complete.");
};

// beforeEach(async () => {
//   await resetDatabase(prisma);
// });

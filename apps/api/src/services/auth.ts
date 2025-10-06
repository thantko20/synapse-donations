import type { LoginAdminInput } from "@repo/shared/schemas";
import { type AppPrisma } from "../../prisma/index.js";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";

function invalidCredentialsError(): never {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "Invalid email or password",
  });
}

export const login = async (prisma: AppPrisma, input: LoginAdminInput) => {
  const admin = await prisma.admin.findFirst({
    where: {
      email: input.email,
    },
  });
  if (!admin) {
    invalidCredentialsError();
  }
  const isValidPassword = await bcrypt.compare(
    input.password,
    admin.passwordHash
  );
  if (!isValidPassword) {
    invalidCredentialsError();
  }

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  const session = await prisma.adminSession.create({
    data: {
      adminId: admin.id,
      expiresAt,
      token: crypto.randomUUID(),
    },
  });

  return {
    session,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    },
  };
};

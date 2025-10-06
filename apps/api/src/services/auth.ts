import type { LoginAdminInput, RegisterUserInput } from "@repo/shared/schemas";
import { type AppPrisma } from "../../prisma/index.js";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";

type BaseCtx = {
  prisma: AppPrisma;
};

export function invalidCredentialsError() {
  return new TRPCError({
    code: "BAD_REQUEST",
    message: "Invalid email or password",
  });
}

export function userWithEmailExistsError() {
  return new TRPCError({
    code: "CONFLICT",
    message: "User with this email already exists",
  });
}

type LoginAdminCtx = BaseCtx & {};

export const loginAdmin = async (
  ctx: LoginAdminCtx,
  input: LoginAdminInput
) => {
  const { prisma } = ctx;
  const admin = await prisma.admin.findFirst({
    where: {
      email: input.email,
    },
  });
  if (!admin) {
    throw invalidCredentialsError();
  }
  const isValidPassword = await bcrypt.compare(
    input.password,
    admin.passwordHash
  );
  if (!isValidPassword) {
    throw invalidCredentialsError();
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

type RegisterUserCtx = BaseCtx & {};

export const registerUser = async (
  { prisma }: RegisterUserCtx,
  input: RegisterUserInput
) => {
  const existingUser = await prisma.user.findUnique({
    select: { id: true },
    where: { email: input.email },
  });

  if (existingUser) {
    throw userWithEmailExistsError();
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
    },
  });

  return { id: user.id };
};

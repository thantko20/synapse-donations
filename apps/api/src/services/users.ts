import type { User } from "@repo/shared/schemas";
import { prisma } from "../../prisma/index.js";
import { Prisma } from "../generated/prisma/index.js";

const userSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
});

function mapUser(
  user: Prisma.UserGetPayload<{ select: typeof userSelect }>
): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function getUserById(id: string): Promise<User | null> {
  const result = await prisma.user.findUnique({
    select: userSelect,
    where: { id },
  });

  return result ? mapUser(result) : null;
}

export async function createUser(): Promise<User> {
  return {} as User;
}

import {
  orgVerificationStatus,
  type Organization,
  type RegisterOrganizationInput,
} from "@repo/shared/schemas";
import type { AppPrisma } from "../../prisma/index.js";
import { TRPCError } from "@trpc/server";

function sameLegalNameExistsError(legalName: string) {
  return new TRPCError({
    code: "CONFLICT",
    message: `Organization with legal name "${legalName}" already exists.`,
  });
}

function registrationNumberExistsError(registrationNumber: string) {
  return new TRPCError({
    code: "CONFLICT",
    message: `Organization with registration number "${registrationNumber}" already exists.`,
  });
}

type BaseCtx = {
  prisma: AppPrisma;
};

type RegisterOrganizationCtx = BaseCtx & {
  userId: string;
};

export const registerOrganization = async (
  { prisma, userId }: RegisterOrganizationCtx,
  input: RegisterOrganizationInput
) => {
  const organizationWithSameLegalName = await prisma.organization.findFirst({
    select: { id: true },
    where: { legalName: input.legalName },
  });
  if (organizationWithSameLegalName) {
    throw sameLegalNameExistsError(input.legalName);
  }
  const organizationWithSameRegistrationNumber =
    await prisma.organization.findFirst({
      select: { id: true },
      where: { registrationNumber: input.registrationNumber },
    });
  if (organizationWithSameRegistrationNumber) {
    throw registrationNumberExistsError(input.registrationNumber!);
  }

  const newOrg = await prisma.organization.create({
    data: {
      displayName: input.displayName,
      website: input.website,
      description: input.description,
      legalName: input.legalName,
      registrationNumber: input.registrationNumber,
      verificationStatus: orgVerificationStatus.pending,
      owner: {
        connect: { id: userId },
      },
    },
  });
  return newOrg;
};

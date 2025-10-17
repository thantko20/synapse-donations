import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { registerOrganization } from "../src/services/organizations.js";
import {
  orgVerificationStatus,
  type RegisterOrganizationInput,
  type User,
} from "@repo/shared/schemas";
import { prisma } from "../prisma/index.js";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";

describe("Organizations Service Integration Tests", () => {
  describe("registerOrganization", () => {
    let testUserIdOrg: string;
    beforeAll(async () => {
      const userCreationResult = await prisma.user.create({
        data: {
          name: "Test User",
          email: "testuser@testorg.com",
          passwordHash: bcrypt.hashSync("testpassword123", 10),
        },
      });
      testUserIdOrg = userCreationResult.id;
    });
    it("should register an organization successfully with valid inputs", async () => {
      const input: RegisterOrganizationInput = {
        displayName: "Test Organization",
        website: "https://www.testorg.com",
        description: "This is a test organization.",
        legalName: "Test Org Legal Name",
        registrationNumber: "REG123456",
      };
      const result = await registerOrganization(
        {
          prisma: prisma,
          userId: testUserIdOrg,
        },
        input,
      );

      expect(result).toHaveProperty("id");
      expect(result.verificationStatus).toBe(orgVerificationStatus.pending);
    });

    it("should not register an organization with a duplicate legal name", async () => {
      const input1: RegisterOrganizationInput = {
        displayName: "Test A Organization",
        website: "https://www.testaorg.com",
        description: "This is a test organization.",
        legalName: "Test Org Legal Name for duplication check",
        registrationNumber: "REG123456_DUPLICATION_CHECK",
      };
      const input2: RegisterOrganizationInput = {
        displayName: "Test B Organization",
        website: "https://www.testborg.com",
        description: "This is a test organization.",
        legalName: "Test Org Legal Name for duplication check",
        registrationNumber: "REG123456_DUPLICATION_CHECK",
      };
      const result1 = await registerOrganization(
        {
          prisma: prisma,
          userId: testUserIdOrg,
        },
        input1,
      );

      try {
        const result2 = await registerOrganization(
          {
            prisma: prisma,
            userId: testUserIdOrg,
          },
          input2,
        );
        expect.fail("Expected error for duplicate legal name");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        const err = error as TRPCError;
        expect(err.code).toBe("CONFLICT");
        expect(err.message).toBe(
          `Organization with legal name "${input2.legalName}" already exists.`,
        );
      }
    });
  });
});

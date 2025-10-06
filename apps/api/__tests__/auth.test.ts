import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
import { PrismaClient } from "../src/generated/prisma/index.js";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { loginAdmin, registerUser } from "../src/services/auth.js";
import type { LoginAdminInput, RegisterUserInput } from "@repo/shared/schemas";

const prisma = new PrismaClient();

describe("Auth Service Integration Tests", () => {
  let testAdmin: {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
  };

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("loginAdmin", () => {
    beforeEach(async () => {
      const passwordHash = await bcrypt.hash("testpassword123", 10);
      testAdmin = await prisma.admin.create({
        data: {
          email: "test@example.com",
          name: "Test Admin",
          passwordHash,
        },
      });
    });
    it("should successfully login with valid credentials", async () => {
      const input: LoginAdminInput = {
        email: "test@example.com",
        password: "testpassword123",
      };

      const result = await loginAdmin({ prisma }, input);

      expect(result).toHaveProperty("session");
      expect(result).toHaveProperty("admin");

      expect(result.session).toHaveProperty("id");
      expect(result.session).toHaveProperty("token");
      expect(result.session).toHaveProperty("expiresAt");
      expect(result.session.adminId).toBe(testAdmin.id);
      expect(typeof result.session.token).toBe("string");
      expect(result.session.token.length).toBeGreaterThan(0);

      const now = new Date();
      const expectedExpiry = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);
      const timeDiff = Math.abs(
        result.session.expiresAt.getTime() - expectedExpiry.getTime()
      );
      expect(timeDiff).toBeLessThan(5000); // Allow 5 second difference

      expect(result.admin).toEqual({
        id: testAdmin.id,
        email: testAdmin.email,
        name: testAdmin.name,
        createdAt: testAdmin.createdAt,
        updatedAt: testAdmin.updatedAt,
      });
      expect(result.admin).not.toHaveProperty("passwordHash");

      const sessionInDb = await prisma.adminSession.findUnique({
        where: { id: result.session.id },
      });
      expect(sessionInDb).toBeTruthy();
      expect(sessionInDb!.adminId).toBe(testAdmin.id);
      expect(sessionInDb!.token).toBe(result.session.token);
    });

    it("should throw TRPCError with code `BAD_REQUEST` when admin email does not exist", async () => {
      const input: LoginAdminInput = {
        email: "nonexistent@example.com",
        password: "testpassword123",
      };

      await expect(loginAdmin({ prisma }, input)).rejects.toThrow(TRPCError);

      try {
        await loginAdmin({ prisma }, input);
        expect.fail("Expected TRPCError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe("BAD_REQUEST");
        expect((error as TRPCError).message).toBe("Invalid email or password");
      }

      const sessionsCount = await prisma.adminSession.count();
      expect(sessionsCount).toBe(0);
    });

    it("should throw TRPCError with code `BAD_REQUEST` when password is incorrect", async () => {
      const input: LoginAdminInput = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      await expect(loginAdmin({ prisma }, input)).rejects.toThrow(TRPCError);

      try {
        await loginAdmin({ prisma }, input);
        expect.fail("Expected TRPCError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe("BAD_REQUEST");
        expect((error as TRPCError).message).toBe("Invalid email or password");
      }

      const sessionsCount = await prisma.adminSession.count();
      expect(sessionsCount).toBe(0);
    });

    it("should create a unique session token for each login", async () => {
      const input: LoginAdminInput = {
        email: "test@example.com",
        password: "testpassword123",
      };

      const result1 = await loginAdmin({ prisma }, input);
      const result2 = await loginAdmin({ prisma }, input);

      expect(result1.session.token).not.toBe(result2.session.token);
      expect(result1.session.id).not.toBe(result2.session.id);

      const sessionsCount = await prisma.adminSession.count();
      expect(sessionsCount).toBe(2);

      expect(result1.session.adminId).toBe(testAdmin.id);
      expect(result2.session.adminId).toBe(testAdmin.id);
    });

    it("should handle case-sensitive email matching", async () => {
      const input: LoginAdminInput = {
        email: "TEST@EXAMPLE.COM", // Different case
        password: "testpassword123",
      };

      await expect(loginAdmin({ prisma }, input)).rejects.toThrow(TRPCError);

      try {
        await loginAdmin({ prisma }, input);
        expect.fail("Expected TRPCError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe("BAD_REQUEST");
        expect((error as TRPCError).message).toBe("Invalid email or password");
      }

      const sessionsCount = await prisma.adminSession.count();
      expect(sessionsCount).toBe(0);
    });

    it("should set session expiration to exactly 7 days from now", async () => {
      const input: LoginAdminInput = {
        email: "test@example.com",
        password: "testpassword123",
      };
      const beforeLogin = Date.now();

      const result = await loginAdmin({ prisma }, input);

      const afterLogin = Date.now();
      const sessionExpiry = result.session.expiresAt.getTime();

      const expectedMin = beforeLogin + 1000 * 60 * 60 * 24 * 7;
      const expectedMax = afterLogin + 1000 * 60 * 60 * 24 * 7;

      expect(sessionExpiry).toBeGreaterThanOrEqual(expectedMin);
      expect(sessionExpiry).toBeLessThanOrEqual(expectedMax);
    });

    it("should handle multiple admins with different emails", async () => {
      const passwordHash2 = await bcrypt.hash("anotherpassword456", 10);
      const testAdmin2 = await prisma.admin.create({
        data: {
          email: "admin2@example.com",
          name: "Second Admin",
          passwordHash: passwordHash2,
        },
      });

      const input1: LoginAdminInput = {
        email: "test@example.com",
        password: "testpassword123",
      };

      const input2: LoginAdminInput = {
        email: "admin2@example.com",
        password: "anotherpassword456",
      };

      const result1 = await loginAdmin({ prisma }, input1);
      const result2 = await loginAdmin({ prisma }, input2);

      expect(result1.admin.id).toBe(testAdmin.id);
      expect(result1.admin.email).toBe("test@example.com");
      expect(result2.admin.id).toBe(testAdmin2.id);
      expect(result2.admin.email).toBe("admin2@example.com");

      const sessionsCount = await prisma.adminSession.count();
      expect(sessionsCount).toBe(2);
    });

    it("should fail when trying to login with first admin's password for second admin", async () => {
      const passwordHash2 = await bcrypt.hash("anotherpassword456", 10);
      await prisma.admin.create({
        data: {
          email: "admin2@example.com",
          name: "Second Admin",
          passwordHash: passwordHash2,
        },
      });

      const input: LoginAdminInput = {
        email: "admin2@example.com",
        password: "testpassword123",
      };

      await expect(loginAdmin({ prisma }, input)).rejects.toThrow(TRPCError);

      try {
        await loginAdmin({ prisma }, input);
        expect.fail("Expected TRPCError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        let err = error as TRPCError;
        expect(err.code).toBe("BAD_REQUEST");
        expect(err.message).toBe("Invalid email or password");
      }
    });
  });

  describe("registerUser", () => {
    it("should register a new user successfully with valid input", async () => {
      const input: RegisterUserInput = {
        email: "johndoe@example.com",
        hasReadTerms: true,
        name: "John Doe",
        password: "securepassword123",
      };

      const result = await registerUser({ prisma }, input);

      expect(result).toHaveProperty("id");
    });

    it("should throw TRPCError with code `CONFLICT` when registering with an existing email", async () => {
      // register first user
      await registerUser(
        { prisma },
        {
          email: "janedoe@example.com",
          name: "Jane Doe",
          password: "anothersecurepassword",
          hasReadTerms: true,
        }
      );

      // use the same email to register again
      const input: RegisterUserInput = {
        email: "janedoe@example.com",
        name: "Jane Smith",
        password: "yetanotherpassword",
        hasReadTerms: true,
      };

      try {
        await registerUser({ prisma }, input);
        expect.fail("Expected TRPCError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        const err = error as TRPCError;
        expect(err.code).toBe("CONFLICT");
      }
    });
  });
});

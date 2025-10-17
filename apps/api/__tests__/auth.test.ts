import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { loginAdmin, registerUser, loginUser } from "../src/services/auth.js";
import type {
  LoginAdminInput,
  RegisterUserInput,
  LoginUserInput,
} from "@repo/shared/schemas";
import { prisma } from "../prisma/index.js";

describe("Auth Service Integration Tests", () => {
  let testAdmin: {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
  };

  describe("loginAdmin", () => {
    beforeAll(async () => {
      const passwordHash = await bcrypt.hash("testpassword123", 10);
      testAdmin = await prisma.admin.create({
        data: {
          email: "test@example.com",
          name: "Test Admin",
          passwordHash,
        },
      });
    });
    it("should successfully authenticate admin with valid credentials", async () => {
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
        result.session.expiresAt.getTime() - expectedExpiry.getTime(),
      );
      expect(timeDiff).toBeLessThan(5000);

      expect(result.admin).toEqual({
        id: testAdmin.id,
        email: testAdmin.email,
        name: testAdmin.name,
        createdAt: testAdmin.createdAt,
        updatedAt: testAdmin.updatedAt,
      });
      expect(result.admin).not.toHaveProperty("passwordHash");
    });

    it("should reject login when admin email does not exist", async () => {
      const input: LoginAdminInput = {
        email: "nonexistent@example.com",
        password: "testpassword123",
      };

      try {
        await loginAdmin({ prisma }, input);
        expect.fail("Expected TRPCError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe("BAD_REQUEST");
        expect((error as TRPCError).message).toBe("Invalid email or password");
      }
    });

    it("should reject login when admin password is incorrect", async () => {
      const input: LoginAdminInput = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      try {
        await loginAdmin({ prisma }, input);
        expect.fail("Expected TRPCError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe("BAD_REQUEST");
        expect((error as TRPCError).message).toBe("Invalid email or password");
      }
    });

    it("should require exact email case matching for login", async () => {
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
    });

    it("should create session with 7-day expiration", async () => {
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

    it("should allow multiple admins to login independently", async () => {
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
    });
  });

  describe("registerUser", () => {
    it("should create new user account with valid information", async () => {
      const input: RegisterUserInput = {
        email: "johndoe@example.com",
        hasReadTerms: true,
        name: "John Doe",
        password: "securepassword123",
      };

      const result = await registerUser({ prisma }, input);

      expect(result).toHaveProperty("id");
    });

    it("should prevent duplicate registration with same email", async () => {
      // register first user
      await registerUser(
        { prisma },
        {
          email: "janedoe@example.com",
          name: "Jane Doe",
          password: "anothersecurepassword",
          hasReadTerms: true,
        },
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

  describe("loginUser", () => {
    let testUser: {
      id: string;
      email: string;
      name: string;
      passwordHash: string;
      isVerified: boolean;
      createdAt: Date;
      updatedAt: Date;
    };

    beforeAll(async () => {
      const passwordHash = await bcrypt.hash("userpassword123", 10);
      testUser = await prisma.user.create({
        data: {
          email: "testuser@example.com",
          name: "Test User",
          passwordHash,
        },
      });
    });

    it("should successfully authenticate user with valid credentials", async () => {
      const input: LoginUserInput = {
        email: "testuser@example.com",
        password: "userpassword123",
      };

      const result = await loginUser({ prisma }, input);

      expect(result).toHaveProperty("session");
      expect(result).toHaveProperty("user");

      expect(result.session).toHaveProperty("id");
      expect(result.session).toHaveProperty("token");
      expect(result.session).toHaveProperty("expiresAt");
      expect(result.session.userId).toBe(testUser.id);
      expect(typeof result.session.token).toBe("string");
      expect(result.session.token.length).toBeGreaterThan(0);

      const now = new Date();
      const expectedExpiry = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);
      const timeDiff = Math.abs(
        result.session.expiresAt.getTime() - expectedExpiry.getTime(),
      );
      expect(timeDiff).toBeLessThan(5000);

      expect(result.user).toEqual({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        isVerified: testUser.isVerified,
        createdAt: testUser.createdAt,
        updatedAt: testUser.updatedAt,
      });
      expect(result.user).not.toHaveProperty("passwordHash");

      const sessionInDb = await prisma.session.findUnique({
        where: { id: result.session.id },
      });
      expect(sessionInDb).toBeTruthy();
      expect(sessionInDb!.userId).toBe(testUser.id);
      expect(sessionInDb!.token).toBe(result.session.token);
    });

    it("should reject login when user email does not exist", async () => {
      const input: LoginUserInput = {
        email: "nonexistent@example.com",
        password: "userpassword123",
      };

      try {
        await loginUser({ prisma }, input);
        expect.fail("Expected TRPCError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        const err = error as TRPCError;
        expect(err.code).toBe("BAD_REQUEST");
        expect(err.message).toBe("Invalid email or password");
      }
    });

    it("should reject login when user password is incorrect", async () => {
      const input: LoginUserInput = {
        email: "testuser@example.com",
        password: "wrongpassword",
      };

      try {
        await loginUser({ prisma }, input);
        expect.fail("Expected TRPCError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        const err = error as TRPCError;
        expect(err.code).toBe("BAD_REQUEST");
        expect(err.message).toBe("Invalid email or password");
      }
    });
  });
});

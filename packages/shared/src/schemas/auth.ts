import z from "zod";
import { userSchema } from "./users.js";

const passwordSchema = z
  .string("Password is required")
  .min(8, "Password is too short")
  .max(16, "Password is too long");

export const loginAdminSchema = z.object({
  email: z.email("Invalid email address"),
  password: passwordSchema,
});

export type LoginAdminInput = z.infer<typeof loginAdminSchema>;

export const loginUserSchema = z.object({
  email: z.email("Invalid email address"),
  password: passwordSchema,
});

export type LoginUserInput = z.infer<typeof loginUserSchema>;

export const registerUserSchema = z.object({
  email: userSchema.shape.email,
  name: userSchema.shape.name,
  password: passwordSchema,
  hasReadTerms: z.literal(true, "You must accept the terms and conditions"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

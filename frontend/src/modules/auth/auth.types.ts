import z from "zod";

export const loginAdminSchema = z.object({
  email: z.email("Invalid email"),
  password: z
    .string("Password is required")
    .min(6, "Password must have at least 6 characters."),
});

export type LoginAdmin = z.infer<typeof loginAdminSchema>;

export const adminSessionSchema = z.object({
  token: z.string(),
  expiresAt: z.string(),
  id: z.string(),
  adminId: z.string(),
  createdAt: z.string(),
});

export type AdminSession = z.infer<typeof adminSessionSchema>;

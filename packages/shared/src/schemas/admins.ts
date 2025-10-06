import z from "zod";

export const adminSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Admin = z.infer<typeof adminSchema>;

export const createAdminSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(16),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;

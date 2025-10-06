import z from "zod";

export const createAdminSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(16),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;

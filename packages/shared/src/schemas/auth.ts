import z from "zod";

export const loginAdminSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string("Password is required")
    .min(8, "Password is too short")
    .max(16, "Password is too long"),
});

export type LoginAdminInput = z.infer<typeof loginAdminSchema>;

import { z } from "zod";

export const userSchema = z.object({
  id: z.uuid("Invalid ID"),
  email: z.email("Invalid email address"),
  name: z
    .string("Name is required")
    .trim()
    .nonempty("Name is required")
    .min(2, "Name must have at least 2 characters")
    .max(100, "Name must have at most 100 characters"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;

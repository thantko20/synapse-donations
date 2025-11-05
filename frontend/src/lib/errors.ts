import z from "zod";

export const appErrorSchema = z.object({
  code: z.string(),
  status: z.number().catch(0),
  message: z.string().default(""),
});

export type AppError = z.infer<typeof appErrorSchema>;

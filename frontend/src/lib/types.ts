import z from "zod";

export const metaSchema = z.object({
  page: z.number().optional(),
  nextPage: z.number().optional(),
  size: z.number().optional(),
  totalPages: z.number().optional(),
  totalItems: z.number().optional(),
  requestId: z.string(),
});

export const errorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  fields: z.record(z.string(), z.string()).nullish(),
});

export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  meta: metaSchema.nullish(),
  message: z.string().nullish(),
  error: errorDetailSchema.nullish(),
});

export type Meta = z.infer<typeof metaSchema>;
export type ErrorDetail = z.infer<typeof errorDetailSchema>;
export type ApiResponse<T = unknown> = Omit<
  z.infer<typeof apiResponseSchema>,
  "data"
> & {
  data: T;
};

import z from "zod";

export const verifyOrganizationSchema = z.object({
  organizationId: z.uuid(),
});

export type VerifyOrganizationInput = z.infer<typeof verifyOrganizationSchema>;

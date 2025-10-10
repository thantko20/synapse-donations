import z from "zod";

export const orgVerificationStatus = {
  pending: "PENDING",
  verified: "VERIFIED",
  rejected: "REJECTED",
} as const;

export const organizationSchema = z.object({
  id: z.uuid(),
  legalName: z.string().min(1).max(100),
  displayName: z.string().min(1).max(50),
  website: z.string().url().optional(),
  description: z.string().max(500).optional(),
  registrationNumber: z.string().max(50).optional(),
  verificationStatus: z.enum(orgVerificationStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Organization = z.infer<typeof organizationSchema>;

export const verifyOrganizationSchema = z.object({
  organizationId: z.uuid(),
});

export type VerifyOrganizationInput = z.infer<typeof verifyOrganizationSchema>;

export const registerOrganizationSchema = z.object({
  legalName: z
    .string("Legal Name is required")
    .min(1, "Legal Name must have at least 1 character")
    .max(100, "Legal Name must be at most 100 characters"),
  displayName: z
    .string("Display Name")
    .min(1, "Display Name must have at least 1 character")
    .max(50, "Display Name must be at most 50 characters"),
  website: z
    .url({
      error: () => ({
        message: "Website must be a valid URL",
      }),
    })
    .optional(),
  description: z.string().max(500).optional(),
  registrationNumber: z.string().max(50).optional(),
});

export type RegisterOrganizationInput = z.infer<
  typeof registerOrganizationSchema
>;

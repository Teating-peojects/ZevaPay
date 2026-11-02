import { z } from "zod";

/**
 * Validation schemas shared by the forms.
 *
 * The rules mirror the API's own validation so the user sees the same
 * message whether the form or the server rejects the input.
 */

/** Bangladeshi mobile number, e.g. 01712345678. */
export const bdPhoneSchema = z
  .string()
  .trim()
  .regex(/^01[3-9]\d{8}$/, "Enter a valid 11-digit mobile number.");

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address.");

export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters.")
  .max(128, "Password is too long.")
  .regex(/[a-z]/, "Include at least one lowercase letter.")
  .regex(/[A-Z]/, "Include at least one uppercase letter.")
  .regex(/\d/, "Include at least one number.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  business: z.string().trim().min(2, "Enter your business name."),
  email: emailSchema,
  phone: bdPhoneSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Re-enter your password."),
  terms: z.literal(true, {
    error: "You must accept the terms to continue.",
  }),
});

export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const accountSchema = z.object({
  provider: z.enum(["BKASH", "NAGAD", "ROCKET", "UPAY"], {
    error: "Choose a payment provider.",
  }),
  accountNumber: bdPhoneSchema,
  accountType: z.enum(["PERSONAL", "MERCHANT", "AGENT", "BUSINESS"], {
    error: "Choose an account type.",
  }),
  label: z.string().trim().min(1, "Give this account a label."),
});

export type AccountValues = z.infer<typeof accountSchema>;

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email: emailSchema,
  phone: bdPhoneSchema,
  businessName: z.string().trim().min(2, "Enter your business name."),
});

export type ProfileValues = z.infer<typeof profileSchema>;

/**
 * The merchant settings form. The phone number is optional, so it is
 * validated only when it is filled in.
 */
export const merchantProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^01[3-9]\d{8}$/.test(value),
      "Enter a valid 11-digit mobile number.",
    ),
  businessName: z.string().trim().min(2, "Enter your business name."),
});

export type MerchantProfileValues = z.infer<typeof merchantProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Re-enter your password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const adminProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^01[3-9]\d{8}$/.test(value),
      "Enter a valid 11-digit mobile number.",
    ),
});

export type AdminProfileValues = z.infer<typeof adminProfileSchema>;

export const apiKeySchema = z.object({
  name: z.string().trim().min(2, "Give the key a name."),
});

export type ApiKeyValues = z.infer<typeof apiKeySchema>;

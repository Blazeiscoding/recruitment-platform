import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email();

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long");

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .max(64, "Too long");

export const optionalString = z
  .string()
  .trim()
  .max(256, "Too long")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const urlOptional = z
  .string()
  .trim()
  .url("Invalid URL")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const skillsOptional = z
  .string()
  .trim()
  .optional()
  .or(z.literal("").transform(() => undefined))
  .transform((val) =>
    val
      ? val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined
  );

export const experienceYearsOptional = z
  .union([z.number().int().min(0).max(60), z.string()])
  .optional()
  .transform((val) => {
    if (val === undefined || val === "") return undefined;
    if (typeof val === "string") {
      const n = Number(val);
      return Number.isFinite(n)
        ? Math.max(0, Math.min(60, Math.trunc(n)))
        : undefined;
    }
    return val;
  });

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: optionalString,
  headline: optionalString,
  bio: z
    .string()
    .trim()
    .max(2000, "Bio too long")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  location: optionalString,
  skills: skillsOptional,
  experienceYears: experienceYearsOptional,
  linkedinUrl: urlOptional,
  portfolioUrl: urlOptional,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// schemas/userSchemas.js
const { z } = require("zod");

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(100, "Password must be less than 100 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character"
  );

// Phone validation (optional but when provided must be valid)
const phoneSchema = z
  .string()
  .regex(
    /^\+?[1-9]\d{1,14}$/,
    "Phone number must be a valid international format"
  )
  .optional();

// Skills array validation
const skillsSchema = z
  .array(
    z
      .string()
      .min(2, "Each skill must be at least 2 characters")
      .max(50, "Each skill must be less than 50 characters")
      .trim()
  )
  .max(20, "Maximum 20 skills allowed")
  .optional();

// Experience level enum
const experienceLevelSchema = z.enum(["entry", "mid", "senior", "executive"], {
  errorMap: () => ({
    message: "Experience level must be one of: entry, mid, senior, executive",
  }),
});

// User registration schema
const registerSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .min(1, "Email is required")
    .max(255, "Email must be less than 255 characters")
    .transform((email) => email.toLowerCase().trim()),

  password: passwordSchema,

  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .transform((name) => name.trim()),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .transform((name) => name.trim()),

  phone: phoneSchema,

  location: z
    .string()
    .max(255, "Location must be less than 255 characters")
    .optional()
    .transform((loc) => loc?.trim()),

  bio: z
    .string()
    .max(1000, "Bio must be less than 1000 characters")
    .optional()
    .transform((bio) => bio?.trim()),

  skills: skillsSchema,

  experienceLevel: experienceLevelSchema.optional(),

  salaryExpectation: z
    .number()
    .int("Salary must be a whole number")
    .min(1000, "Salary expectation must be at least $1,000")
    .max(10000000, "Salary expectation must be less than $10,000,000")
    .optional(),
});

// User login schema
const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .min(1, "Email is required")
    .transform((email) => email.toLowerCase().trim()),

  password: z.string().min(1, "Password is required"),
});

// Profile update schema (all fields optional)
const updateProfileSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters")
      .transform((name) => name.trim())
      .optional(),

    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters")
      .transform((name) => name.trim())
      .optional(),

    phone: phoneSchema,

    location: z
      .string()
      .max(255, "Location must be less than 255 characters")
      .transform((loc) => loc?.trim())
      .optional(),

    bio: z
      .string()
      .max(1000, "Bio must be less than 1000 characters")
      .transform((bio) => bio?.trim())
      .optional(),

    skills: skillsSchema,

    experienceLevel: experienceLevelSchema.optional(),

    salaryExpectation: z
      .number()
      .int("Salary must be a whole number")
      .min(1000, "Salary expectation must be at least $1,000")
      .max(10000000, "Salary expectation must be less than $10,000,000")
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update"
  );

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  passwordSchema,
  phoneSchema,
  skillsSchema,
  experienceLevelSchema,
};

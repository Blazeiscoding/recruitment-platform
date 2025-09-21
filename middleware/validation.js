// middleware/validation.js
const { z } = require("zod");

/**
 * Middleware factory for validating request data using Zod schemas
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {string} source - Where to get data from: 'body', 'query', 'params'
 * @returns {Function} Express middleware function
 */
const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      // Get data from specified source
      const dataToValidate = req[source];

      // Validate and transform data using Zod schema
      const validatedData = schema.parse(dataToValidate);

      // Replace request data with validated/transformed data
      req[source] = validatedData;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod validation errors for better readability
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: formattedErrors,
        });
      }

      // Handle unexpected errors
      console.error("Validation middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal validation error",
      });
    }
  };
};

/**
 * Middleware for validating request body
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
const validateBody = (schema) => validate(schema, "body");

/**
 * Middleware for validating query parameters
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
const validateQuery = (schema) => validate(schema, "query");

/**
 * Middleware for validating URL parameters
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
const validateParams = (schema) => validate(schema, "params");

/**
 * Generic validation function for use outside middleware context
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {any} data - Data to validate
 * @returns {Object} { success: boolean, data?: any, errors?: array }
 */
const validateData = (schema, data) => {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      }));

      return {
        success: false,
        errors: formattedErrors,
      };
    }

    return {
      success: false,
      errors: [{ field: "unknown", message: "Validation error occurred" }],
    };
  }
};

// Common parameter validation schemas
const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID must be a positive integer")
    .transform(Number),
});

const paginationQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a positive integer")
    .transform(Number)
    .refine((val) => val > 0, "Page must be greater than 0")
    .optional()
    .default(1),

  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive integer")
    .transform(Number)
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
    .optional()
    .default(10),
});

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateData,
  idParamSchema,
  paginationQuerySchema,
};

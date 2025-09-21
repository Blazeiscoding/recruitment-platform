// controllers/authController.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { validateData } = require("../middleware/validation");
const { registerSchema, loginSchema } = require("../schemas/userSchemas");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "24h",
    issuer: "recruitment-platform",
    audience: "recruitment-platform-users",
  });
};

const register = async (req, res) => {
  try {
    // Validate request data (this should already be done by middleware, but double-checking)
    const validation = validateData(registerSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const validatedData = validation.data;

    // Create user with validated data
    const user = await User.create({
      email: validatedData.email,
      password: validatedData.password,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phone: validatedData.phone,
      location: validatedData.location,
      bio: validatedData.bio,
      skills: validatedData.skills || [],
      experienceLevel: validatedData.experienceLevel,
      salaryExpectation: validatedData.salaryExpectation,
    });

    // Generate token
    const token = generateToken(user.id);

    // Remove sensitive data
    delete user.password_hash;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle specific database errors
    if (error.message === "Email already exists") {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
        code: "EMAIL_EXISTS",
      });
    }

    // Handle PostgreSQL unique constraint violation
    if (error.code === "23505" && error.constraint?.includes("email")) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
        code: "EMAIL_EXISTS",
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: "Registration failed",
      code: "REGISTRATION_ERROR",
    });
  }
};

const login = async (req, res) => {
  try {
    // Validate request data (should already be done by middleware)
    const validation = validateData(loginSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const { email, password } = validation.data;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Validate password
    const isValidPassword = await User.validatePassword(
      password,
      user.password_hash
    );
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Update last login timestamp
    await User.updateLastLogin(user.id);

    // Generate token
    const token = generateToken(user.id);

    // Remove sensitive data
    delete user.password_hash;

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      code: "LOGIN_ERROR",
    });
  }
};

/**
 * Refresh token endpoint - allows users to get a new token
 * before their current one expires
 */
const refreshToken = async (req, res) => {
  try {
    // User is already authenticated via middleware
    const user = req.user;

    // Generate new token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        token,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Token refresh failed",
      code: "TOKEN_REFRESH_ERROR",
    });
  }
};

/**
 * Logout endpoint - mainly for client-side token cleanup
 * (server-side token invalidation would require a token blacklist)
 */
const logout = async (req, res) => {
  try {
    // In a more advanced implementation, you might:
    // 1. Add the token to a blacklist
    // 2. Store logout timestamp in database
    // 3. Invalidate refresh tokens

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      code: "LOGOUT_ERROR",
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};

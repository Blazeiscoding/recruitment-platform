// routes/auth.js
const express = require("express");
const {
  register,
  login,
  refreshToken,
  logout,
} = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const { validateBody } = require("../middleware/validation");
const { registerSchema, loginSchema } = require("../schemas/userSchemas");

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validateBody(registerSchema), register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post("/login", validateBody(loginSchema), login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post("/refresh", authenticateToken, refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (mainly for client-side cleanup)
 * @access  Private
 */
router.post("/logout", authenticateToken, logout);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify if current token is valid
 * @access  Private
 */
router.get("/verify", authenticateToken, (req, res) => {
  // If we reach here, token is valid (middleware passed)
  res.json({
    success: true,
    message: "Token is valid",
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
      },
    },
  });
});

module.exports = router;

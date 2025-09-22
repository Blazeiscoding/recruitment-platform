import express from "express";
const router = express.Router();

// Import controllers and middleware
const {
  register,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

const authenticateToken = require("../middleware/auth");
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
} = require("../middleware/validation");

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", validateRegister, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validateLogin, login);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", authenticateToken, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", authenticateToken, validateProfileUpdate, updateProfile);

module.exports = router;

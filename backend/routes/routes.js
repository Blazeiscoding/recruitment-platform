import express from "express";
const router = express.Router();

// Import controllers and middleware
import {
  register,
  login,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";

import { authenticateToken } from "../middleware/auth.js";
import {
  validateProfileUpdate,
  validateRegister,
  validateLogin,
} from "../middleware/validation.js";

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

export default router;

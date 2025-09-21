// routes/users.js
const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  validateBody,
  validateParams,
  validateQuery,
} = require("../middleware/validation");
const { updateProfileSchema } = require("../schemas/userSchemas");
const {
  idParamSchema,
  paginationQuerySchema,
} = require("../middleware/validation");
const User = require("../models/user");

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile",
      code: "PROFILE_FETCH_ERROR",
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put("/profile", validateBody(updateProfileSchema), async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Convert camelCase to snake_case for database
    const dbUpdateData = {};
    if (updateData.firstName) dbUpdateData.first_name = updateData.firstName;
    if (updateData.lastName) dbUpdateData.last_name = updateData.lastName;
    if (updateData.phone !== undefined) dbUpdateData.phone = updateData.phone;
    if (updateData.location !== undefined)
      dbUpdateData.location = updateData.location;
    if (updateData.bio !== undefined) dbUpdateData.bio = updateData.bio;
    if (updateData.skills !== undefined)
      dbUpdateData.skills = updateData.skills;
    if (updateData.experienceLevel !== undefined)
      dbUpdateData.experience_level = updateData.experienceLevel;
    if (updateData.salaryExpectation !== undefined)
      dbUpdateData.salary_expectation = updateData.salaryExpectation;

    const updatedUser = await User.updateProfile(userId, dbUpdateData);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.message === "No valid fields to update") {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
        code: "NO_FIELDS_TO_UPDATE",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      code: "PROFILE_UPDATE_ERROR",
    });
  }
});

/**
 * @route   DELETE /api/users/profile
 * @desc    Deactivate current user's account (soft delete)
 * @access  Private
 */
router.delete("/profile", async (req, res) => {
  try {
    const userId = req.user.id;

    // Soft delete - set is_active to false
    const result = await User.deactivateAccount(userId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate account",
      code: "ACCOUNT_DEACTIVATION_ERROR",
    });
  }
});

/**
 * @route   GET /api/users/search
 * @desc    Search for users (for future recruiter functionality)
 * @access  Private
 */
router.get(
  "/search",
  validateQuery(paginationQuerySchema),
  async (req, res) => {
    try {
      const { page, limit } = req.query;
      const offset = (page - 1) * limit;

      // This would be expanded for actual search functionality
      // For now, just return paginated users
      const users = await User.findMany({ offset, limit });
      const total = await User.count();

      res.json({
        success: true,
        message: "Users retrieved successfully",
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Search users error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search users",
        code: "USER_SEARCH_ERROR",
      });
    }
  }
);

module.exports = router;

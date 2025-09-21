const jwt = require("jsonwebtoken");
const User = require("../models/user");
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "24h",
    issuer: "recruitment-platform",
    audience: "recruitment-platform-users",
  });
};

const register = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      location,
      bio,
      skills,
      experienceLevel,
      salaryExpectation,
    } = req.body;

    // Create user
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone,
      location,
      bio,
      skills: skills || [],
      experienceLevel,
      salaryExpectation,
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

    if (error.message === "Email already exists") {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
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
      });
    }

    // Update last login
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
    });
  }
};

module.exports = {
  register,
  login,
};

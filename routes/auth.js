const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validateRegistration } = require("../middleware/validation-simple");

const router = express.Router();

// User Registration with simple validation
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.validatedData;

    console.log("🚀 Starting user registration for:", email);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or username",
      });
    }

    // Create new user - password will be auto-hashed by the pre-save hook
    const newUser = new User({
      username,
      email,
      password, // This will be hashed automatically
    });

    console.log("📝 About to save user...");
    await newUser.save();
    console.log("✅ User saved to database:", newUser._id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    console.log("✅ Token generated for user:", newUser._id);

    // Return success response with token
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
        token,
      },
    });
  } catch (error) {
    console.error("💥 Registration error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or username",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error during user registration",
      error: error.message,
    });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login attempt for:", email);

    // Manual validation for login
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.correctPassword(password);
    if (!isPasswordValid) {
      console.log("❌ Invalid password for:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    console.log("✅ Login successful for:", email);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    console.error("💥 Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
});

module.exports = router;

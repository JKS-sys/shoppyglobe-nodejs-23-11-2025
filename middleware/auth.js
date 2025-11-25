const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Instead of calling next(error), we return a response directly
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided or invalid format.",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and attach to request
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is valid but user no longer exists.",
      });
    }

    req.user = user;

    // Proceed to next middleware/controller
    // This is the standard next() call, but we've handled errors by returning responses
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    });
  }
};

module.exports = authMiddleware;

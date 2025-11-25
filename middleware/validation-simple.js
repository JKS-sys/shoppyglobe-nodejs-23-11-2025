// Simple manual validation without Zod
exports.validateRegistration = (req, res, next) => {
  console.log("🔍 validateRegistration called with:", req.body);

  const { username, email, password } = req.body;
  const errors = [];

  // Validate username
  if (!username || username.length < 3) {
    errors.push({
      field: "username",
      message: "Username must be at least 3 characters",
    });
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({
      field: "email",
      message: "Please provide a valid email",
    });
  }

  // Validate password
  if (!password || password.length < 6) {
    errors.push({
      field: "password",
      message: "Password must be at least 6 characters long",
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  req.validatedData = { username, email, password };
  console.log("✅ Manual validation passed");
  next();
};

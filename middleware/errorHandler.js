/**
 * Centralized error-handling middleware for Express.
 * Formats Zod errors to clear JSON responses.
 */
const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err.name === "ZodError") {
    // Send back detailed validation errors
    return res.status(400).json({
      errors: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }
  // Generic error response
  res.status(500).json({ message: err.message || "Internal Server Error" });
};

module.exports = errorHandler;

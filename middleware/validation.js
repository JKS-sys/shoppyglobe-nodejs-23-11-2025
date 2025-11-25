const { z } = require("zod");

// Validation for Product creation and update
exports.productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100),
  price: z.number().positive("Price must be a positive number"),
  description: z.string().max(1000).optional(),
  stockQuantity: z.number().int().nonnegative("Stock cannot be negative"),
});

// Validation for User registration
exports.userRegistrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Validation for User login
exports.userLoginSchema = z.object({
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Validation for adding item to cart
exports.cartItemSchema = z.object({
  productId: z
    .string()
    .length(24, "Product ID must be a valid 24-character hex string"),
  quantity: z
    .number()
    .int()
    .positive("Quantity must be a positive integer")
    .min(1),
});

// Validation for updating cart item quantity
exports.updateCartItemSchema = z.object({
  quantity: z.number().int().nonnegative("Quantity cannot be negative").min(0),
});

// Fixed validation middleware - SIMPLIFIED VERSION
exports.validateData = (schema) => {
  return (req, res, next) => {
    try {
      console.log("🔍 Validation middleware called for:", req.body);

      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;

      console.log("✅ Validation passed");
      next(); // Simple next() call - no conditions
    } catch (error) {
      console.log("❌ Validation failed:", error.errors);

      const errorMessages = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorMessages,
      });
    }
  };
};

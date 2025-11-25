const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

// Import routes
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === "test"
        ? process.env.MONGODB_URI_TEST ||
          "mongodb://127.0.0.1:27017/shoppyglobe_test"
        : process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shoppyglobe";

    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

// Root endpoint - Display API information
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Shoppyglobe E-commerce API",
    version: "1.0.0",
    description: "Backend API for Shoppyglobe E-commerce application",
    documentation: "Available endpoints are listed below",
    endpoints: {
      auth: {
        "POST /auth/register": "Register a new user",
        "POST /auth/login": "Login user and get JWT token",
      },
      products: {
        "GET /products": "Get all products",
        "GET /products/:id": "Get single product by ID",
      },
      cart: {
        "GET /cart": "Get user's cart (Protected)",
        "POST /cart": "Add product to cart (Protected)",
        "PUT /cart/:productId": "Update cart item quantity (Protected)",
        "DELETE /cart/:productId": "Remove item from cart (Protected)",
      },
    },
    status: {
      database: "Connected ✅",
      server: `Running on port ${PORT} ✅`,
    },
    timestamp: new Date().toISOString(),
  });
});

// Use Routes
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/auth", authRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server!",
    error: err.message,
  });
});

// 404 Handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    availableEndpoints: {
      "GET /": "API information and endpoints",
      "POST /auth/register": "User registration",
      "POST /auth/login": "User login",
      "GET /products": "Get all products",
      "GET /products/:id": "Get single product",
      "GET /cart": "Get user cart (Protected)",
      "POST /cart": "Add to cart (Protected)",
      "PUT /cart/:productId": "Update cart (Protected)",
      "DELETE /cart/:productId": "Remove from cart (Protected)",
    },
  });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Shoppyglobe server is running on port ${PORT}`);
    });
  });
}

// Export the app for testing
module.exports = app;

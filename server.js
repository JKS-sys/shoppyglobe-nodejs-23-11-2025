const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// CORS Configuration - More permissive for development
app.use(
  cors({
    origin: "*", // Allow all origins in development
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Debug middleware imports
try {
  const validation = require("./middleware/validation");
  console.log(
    "✅ Validation middleware loaded:",
    typeof validation.validateRequest
  );
} catch (error) {
  console.error("❌ Validation middleware error:", error.message);
}

try {
  const authController = require("./controllers/authController");
  console.log("✅ Auth controller loaded");
} catch (error) {
  console.error("❌ Auth controller error:", error.message);
}

// Debug middleware for all requests
app.use((req, res, next) => {
  console.log(`\n=== NEW REQUEST ===`);
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.path}`);
  console.log(`Body:`, req.body);
  console.log(`Headers:`, req.headers);
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));

// Default route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the ShoppyGlobe API",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
      },
      products: {
        getAll: "GET /api/products",
        getSingle: "GET /api/products/:id",
      },
      cart: {
        getCart: "GET /api/cart",
        addToCart: "POST /api/cart",
        updateCart: "PUT /api/cart/:itemId",
        removeFromCart: "DELETE /api/cart/:itemId",
      },
    },
    status: "Server is running correctly",
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: "Connected",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: [
      "GET /",
      "GET /health",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/products",
      "GET /api/products/:id",
    ],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

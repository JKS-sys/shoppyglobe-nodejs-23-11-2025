// app.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const authRoutes = require("./routes/authRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();
app.use(express.json());

// Connect MongoDB with async function to await completion during tests
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
connectDB();

app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to ShoppyGlobe API",
    endpoints: {
      "GET /products": "List all products",
      "GET /products/:id": "Get product details by ID",
      "POST /cart": "Add item to cart",
      "GET /cart": "View cart items",
      "POST /register": "User registration",
      "POST /login": "User login",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

app.use(errorMiddleware);

module.exports = app;

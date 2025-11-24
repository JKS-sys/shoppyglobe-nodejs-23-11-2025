const express = require("express");
const {
  getProducts,
  getProducts,
} = require("../controllers/productController");

const router = express.Router();

// Route to get all products
router.get("/", getProducts);

// Route to get a single product by ID
router.get("/:id", getProducts);

module.exports = router;

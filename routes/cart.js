const express = require("express");
const { body } = require("express-validator");
const {
  addToCart,
  updateCartItem,
  getCart,
  removeFromCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validation");

const router = express.Router();
router.use(protect);

// Route to get user's cart
router.get("/", getCart);

// Route to add item to cart
router.post(
  "/add",
  [
    body("productId").notEmpty().withMessage("Product ID is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  handleValidationErrors,
  addToCart
);

// Route to update cart item quantity
router.put(
  "/update",
  [
    body("productId").notEmpty().withMessage("Product ID is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  handleValidationErrors,
  updateCartItem
);

// Route to remove item from cart
router.delete(
  "/:ItemId",
  [body("productId").notEmpty().withMessage("Product ID is required")],
  handleValidationErrors,
  removeFromCart
);

module.exports = router;

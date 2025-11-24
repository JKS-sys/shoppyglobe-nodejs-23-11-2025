const express = require("express");
const { body } = require("express-validator");
const {
  addToCart,
  updateCartItem,
  getCart,
  removeFromCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validation");

const router = express.Router();
router.use(protect);

// Route to get user's cart
router.get("/", getCart);

// Route to add item to cart
router.post(
  "/",
  [
    body("productId").notEmpty().withMessage("Product ID is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  validateRequest,
  addToCart
);

// Route to update cart item quantity
router.put(
  "/:itemId",
  [
    body("productId").notEmpty().withMessage("Product ID is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  validateRequest,
  updateCartItem
);

// Route to remove item from cart
router.delete("/:itemId", removeFromCart);

module.exports = router;

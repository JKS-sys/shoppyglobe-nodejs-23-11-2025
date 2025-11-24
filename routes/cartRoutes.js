const express = require("express");
const {
  addToCart,
  updateCartItem,
  removeCartItem,
} = require("../controllers/cartController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect); // Protect all cart routes

router.post("/", addToCart);
router.put("/:id", updateCartItem);
router.delete("/:id", removeCartItem);

module.exports = router;

const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

// POST /cart - Add product to cart
router.post("/", async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    console.log("🛒 Adding to cart:", { productId, quantity, userId });

    // Manual validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if product is in stock
    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stockQuantity} items available`,
      });
    }

    // Find user's cart or create new one
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      console.log("📦 Creating new cart for user:", userId);
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      // Check stock again with new quantity
      if (product.stockQuantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for additional items. Only ${
            product.stockQuantity - cart.items[existingItemIndex].quantity
          } more available`,
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      console.log("📝 Updated existing item quantity to:", newQuantity);
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity,
      });
      console.log("🆕 Added new item to cart");
    }

    await cart.save();
    console.log("✅ Cart saved successfully");

    // Populate the cart with product details before sending response
    await cart.populate("items.product", "name price description");

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: cart,
    });
  } catch (error) {
    console.error("💥 Error adding to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding product to cart",
      error: error.message,
    });
  }
});

// GET /cart - Get user's cart
router.get("/", async (req, res) => {
  try {
    const userId = req.user._id;

    console.log("📥 Getting cart for user:", userId);

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "name price description stockQuantity"
    );

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    console.log("✅ Cart retrieved successfully");

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("💥 Error fetching cart:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: error.message,
    });
  }
});

// PUT /cart/:productId - Update product quantity in cart
router.put("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    console.log("✏️ Updating cart item:", { productId, quantity, userId });

    // Manual validation
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a non-negative number",
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find item in cart
    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
      console.log("🗑️ Removed item from cart");
    } else {
      // Check stock availability
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (product.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Only ${product.stockQuantity} items available`,
        });
      }

      // Update quantity
      cartItem.quantity = quantity;
      console.log("📝 Updated item quantity to:", quantity);
    }

    await cart.save();
    await cart.populate("items.product", "name price");

    const message =
      quantity === 0
        ? "Product removed from cart"
        : "Cart updated successfully";

    console.log("✅ Cart updated successfully");

    return res.status(200).json({
      success: true,
      message,
      data: cart,
    });
  } catch (error) {
    console.error("💥 Error updating cart:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating cart",
      error: error.message,
    });
  }
});

// DELETE /cart/:productId - Remove product from cart
router.delete("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    console.log("🗑️ Deleting item from cart:", { productId, userId });

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Remove item from cart
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    await cart.save();
    await cart.populate("items.product", "name price");

    console.log("✅ Item deleted from cart successfully");

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      data: cart,
    });
  } catch (error) {
    console.error("💥 Error removing from cart:", error);
    return res.status(500).json({
      success: false,
      message: "Error removing product from cart",
      error: error.message,
    });
  }
});

module.exports = router;

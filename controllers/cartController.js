const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity) {
    return res
      .status(400)
      .json({ message: "Product ID and quantity required" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stockQuantity < quantity)
      return res.status(400).json({ message: "Insufficient stock" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  const { quantity } = req.body;
  const itemId = req.params.id;

  if (!quantity) return res.status(400).json({ message: "Quantity required" });

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Cart item not found" });

    const product = await Product.findById(item.product);
    if (product.stockQuantity < quantity)
      return res.status(400).json({ message: "Insufficient stock" });

    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

exports.removeCartItem = async (req, res, next) => {
  const itemId = req.params.id;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
    } else {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

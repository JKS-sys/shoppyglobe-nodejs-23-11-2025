const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }
    res.json(cart);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  if (quantity < 1)
    return res.status(400).json({ message: "Quantity must be at least 1" });

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].price = product.price;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }

    await cart.save();
    res.json(cart);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1)
    return res.status(400).json({ message: "Quantity must be at least 1" });
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1)
      return res.status(404).json({ message: "Item not found" });

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.json(cart);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeFromCart = async (req, res) => {
  const { itemId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    res.json(cart);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

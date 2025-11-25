const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product ID is required for cart item"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
    default: 1,
  },
});

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required for cart"],
      unique: true, // One cart per user
    },
    items: [CartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// FIXED: Calculate total amount without using next
CartSchema.pre("save", function () {
  // Calculate total amount (we'll improve this later to use actual prices)
  let total = 0;

  // If items are populated with product data, use actual prices
  if (
    this.items &&
    this.items.length > 0 &&
    this.items[0].product &&
    this.items[0].product.price
  ) {
    total = this.items.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;
    }, 0);
  }

  this.totalAmount = total;
});

module.exports = mongoose.model("Cart", CartSchema);

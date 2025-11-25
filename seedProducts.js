require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product"); // adjust path as needed

const products = [
  {
    name: "Apple iPhone 15",
    price: 999.99,
    description: "Latest Apple iPhone with A17 chip.",
    stockQuantity: 50,
  },
  {
    name: "Samsung Galaxy S25",
    price: 899.99,
    description: "New Samsung flagship phone with excellent camera.",
    stockQuantity: 40,
  },
  {
    name: "Sony WH-1000XM4 Headphones",
    price: 349.99,
    description: "Industry leading noise canceling headphones.",
    stockQuantity: 30,
  },
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for seeding");

    await Product.deleteMany({});
    console.log("Old products cleared");

    await Product.insertMany(products);
    console.log("Sample products inserted");

    mongoose.disconnect();
  } catch (error) {
    console.error("Seeding error:", error);
  }
}

seedDB();

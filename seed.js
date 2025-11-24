const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();

const products = [
  {
    name: "Sample Product 1",
    price: 29.99,
    description: "This is a sample product description.",
    stockQuantity: 100,
    category: "Electronics",
  },
  {
    name: "Sample Product 2",
    price: 49.99,
    description: "This is another sample product description.",
    stockQuantity: 50,
    category: "Books",
  },
  {
    name: "Sample Product 3",
    price: 19.99,
    description: "This is yet another sample product description.",
    stockQuantity: 200,
    category: "Clothing",
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");

    await Product.deleteMany({});
    console.log("Existing products removed");

    await Product.insertMany(products);
    console.log("Sample products added");

    mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

seedDB();

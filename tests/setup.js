const mongoose = require("mongoose");
require("dotenv").config();

// Set test environment
process.env.NODE_ENV = "test";

beforeAll(async () => {
  const mongoURI =
    process.env.MONGODB_URI_TEST ||
    "mongodb://127.0.0.1:27017/shoppyglobe_test";

  // Connect to test database
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

afterAll(async () => {
  // Close database connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

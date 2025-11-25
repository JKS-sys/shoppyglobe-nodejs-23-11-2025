const request = require("supertest");
const mongoose = require("mongoose");
const app = require("./server"); // Import the app

// Test data
const testUser = {
  username: "testuser",
  email: "test@example.com",
  password: "password123",
};

const testProduct = {
  name: "Test Product",
  price: 99.99,
  description: "Test description",
  stockQuantity: 10,
};

describe("ShoppyGlobe API Tests", () => {
  let jwtToken;
  let productId;
  let userId;

  beforeAll(async () => {
    // Wait for connection to be established
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI_TEST ||
          "mongodb://127.0.0.1:27017/shoppyglobe_test"
      );
    }
  });

  beforeEach(async () => {
    // Clear collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test GET / - API Information
  describe("GET /", () => {
    it("should return API information", async () => {
      const res = await request(app).get("/");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Welcome to Shoppyglobe");
      expect(res.body).toHaveProperty("endpoints");
    });
  });

  // Test Authentication Endpoints
  describe("Authentication Endpoints", () => {
    it("POST /auth/register - should register a new user", async () => {
      const res = await request(app).post("/auth/register").send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.user).toHaveProperty("id");

      jwtToken = res.body.data.token;
      userId = res.body.data.user.id;
    });

    it("POST /auth/register - should return validation error for invalid data", async () => {
      const res = await request(app).post("/auth/register").send({
        username: "ab",
        email: "invalid-email",
        password: "123",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it("POST /auth/login - should login user and return token", async () => {
      // First register
      await request(app).post("/auth/register").send(testUser);

      // Then login
      const res = await request(app).post("/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");

      jwtToken = res.body.data.token;
    });

    it("POST /auth/login - should return error for invalid credentials", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "wrong@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });

  // Test Product Endpoints
  describe("Product Endpoints", () => {
    beforeEach(async () => {
      // Add a test product before each product test
      const Product = mongoose.model("Product");
      const product = new Product(testProduct);
      await product.save();
      productId = product._id.toString();
    });

    it("GET /products - should return list of products", async () => {
      const res = await request(app).get("/products");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      if (res.body.data.length > 0) {
        productId = res.body.data[0]._id;
      }
    });

    it("GET /products/:id - should return single product", async () => {
      const res = await request(app).get(`/products/${productId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(productId);
      expect(res.body.data.name).toBe(testProduct.name);
    });

    it("GET /products/:id - should return 404 for non-existent product", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/products/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // Test Cart Endpoints (Protected)
  describe("Cart Endpoints", () => {
    let testProductId;

    beforeEach(async () => {
      // Create a test product and user before each cart test
      const Product = mongoose.model("Product");
      const product = new Product(testProduct);
      await product.save();
      testProductId = product._id.toString();

      // Register and login to get token
      const registerRes = await request(app)
        .post("/auth/register")
        .send(testUser);

      jwtToken = registerRes.body.data.token;
    });

    it("POST /cart - should add product to cart", async () => {
      const res = await request(app)
        .post("/cart")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          productId: testProductId,
          quantity: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("items");
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].quantity).toBe(2);
    });

    it("POST /cart - should deny access without token", async () => {
      const res = await request(app).post("/cart").send({
        productId: testProductId,
        quantity: 1,
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("PUT /cart/:productId - should update cart item quantity", async () => {
      // First add item to cart
      await request(app)
        .post("/cart")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({ productId: testProductId, quantity: 2 });

      // Then update quantity
      const res = await request(app)
        .put(`/cart/${testProductId}`)
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Check if quantity was updated
      const updatedItem = res.body.data.items.find(
        (item) => item.product._id === testProductId
      );
      expect(updatedItem.quantity).toBe(5);
    });

    it("DELETE /cart/:productId - should remove item from cart", async () => {
      // First add item to cart
      await request(app)
        .post("/cart")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({ productId: testProductId, quantity: 2 });

      // Then delete it
      const res = await request(app)
        .delete(`/cart/${testProductId}`)
        .set("Authorization", `Bearer ${jwtToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(0);
    });
  });

  // Test Error Cases
  describe("Error Handling", () => {
    it("GET /unknown - should return 404 for unknown route", async () => {
      const res = await request(app).get("/unknown");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

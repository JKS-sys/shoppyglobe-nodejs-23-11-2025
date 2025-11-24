const request = require("supertest");
const app = require("./app"); // Adjust relative path to your Express app

let jwtToken; // To store JWT for protected routes
let productId;
let cartItemId;

describe("ShoppyGlobe API Tests", () => {
  // Test GET /products
  it("GET /products - should return list of products", async () => {
    const res = await request(app).get("/products");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      productId = res.body[0]._id;
    }
  });

  // Test User Registration POST /register
  it("POST /register - should register a new user", async () => {
    const res = await request(app)
      .post("/register")
      .send({ username: "testuser", password: "testpass" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  // Test User Login POST /login
  it("POST /login - should login user and return token", async () => {
    const res = await request(app)
      .post("/login")
      .send({ username: "testuser", password: "testpass" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    jwtToken = res.body.token;
  });

  // Use JWT token in this and subsequent tests for protected routes
  // Test Add product to cart POST /cart
  it("POST /cart - should add product to cart", async () => {
    if (!productId) return; // skip if no productId
    const res = await request(app)
      .post("/cart")
      .set("Authorization", `Bearer ${jwtToken}`)
      .send({ productId, quantity: 2 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("items");
    const addedItem = res.body.items.find((item) => item.product === productId);
    expect(addedItem).toBeDefined();
    cartItemId = addedItem._id;
  });

  // Test Update cart item quantity PUT /cart/:id
  it("PUT /cart/:id - should update quantity of cart item", async () => {
    if (!cartItemId) return; // skip if no cart item id
    const res = await request(app)
      .put(`/cart/${cartItemId}`)
      .set("Authorization", `Bearer ${jwtToken}`)
      .send({ quantity: 5 });
    expect(res.statusCode).toBe(200);
    const updatedItem = res.body.items.find((item) => item._id === cartItemId);
    expect(updatedItem.quantity).toBe(5);
  });

  // Test Remove cart item DELETE /cart/:id
  it("DELETE /cart/:id - should remove cart item", async () => {
    if (!cartItemId) return; // skip if no cart item id
    const res = await request(app)
      .delete(`/cart/${cartItemId}`)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.statusCode).toBe(200);
    const removedItem = res.body.items.find((item) => item._id === cartItemId);
    expect(removedItem).toBeUndefined();
  });

  // Test protected route without token
  it("POST /cart - should deny access without token", async () => {
    const res = await request(app)
      .post("/cart")
      .send({ productId, quantity: 1 });
    expect(res.statusCode).toBe(401);
  });

  // Test 404 for unknown route
  it("GET /unknown - should return 404", async () => {
    const res = await request(app).get("/unknown");
    expect(res.statusCode).toBe(404);
  });
});

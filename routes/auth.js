const express = require("express");
const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validation");
const authController = require("../controllers/authController");

const router = express.Router();

// User registration route
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("email").isEmail().withMessage("Please provide a valid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  validateRequest,
  authController.registerUser
);

// User login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  authController.loginUser
);

module.exports = router;

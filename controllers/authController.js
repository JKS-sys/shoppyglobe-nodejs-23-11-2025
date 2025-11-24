const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

exports.register = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ username, password });
    await user.save();

    res.status(201).json({ token: generateToken(user._id) });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    res.json({ token: generateToken(user._id) });
  } catch (error) {
    next(error);
  }
};

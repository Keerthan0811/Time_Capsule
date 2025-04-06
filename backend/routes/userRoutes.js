const express = require("express");
const router = express.Router(); // ✅ THIS LINE is essential
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// Register Route
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({ username, email, password: hashedPassword });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ _id: newUser._id, username: newUser.username, email: newUser.email, token });

  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ _id: user._id, username: user.username, email: user.email, token });

  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Example protected route
router.get("/protected", protect, (req, res) => {
  res.json({
    message: `🔐 Hello ${req.user.username}, you're authorized!`,
  });
});

module.exports = router;

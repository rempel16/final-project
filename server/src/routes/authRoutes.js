const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

router.post("/signup", async (req, res) => {
  const { email, username, password, name } = req.body;

  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) return res.status(409).json({ message: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    username,
    passwordHash,
    name: name || "",
  });

  const token = signToken(user._id);
  res
    .status(201)
    .json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
    });
});

router.post("/login", async (req, res) => {
  const identifier = req.body?.identifier || req.body?.email;
  const { password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Identifier and password are required" });
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select("+passwordHash");
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user._id);
  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      name: user.name,
    },
  });
});

router.post("/reset", async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ message: "Identifier is required" });

  await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
  return res.status(200).json({ message: "Reset link sent" });
});

module.exports = router;

const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");

const signup = async (req, res) => {
  const { email, password, username, name = "" } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const exists = await User.findOne({
    $or: [{ email: normalizedEmail }, { username }],
  });
  if (exists) {
    return res.status(409).json({ message: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: normalizedEmail,
    username,
    name,
    passwordHash,
  });

  const token = signToken({ id: user._id.toString() });

  res.status(201).json({
    token,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      name: user.name,
    },
  });
};

const login = async (req, res) => {

  const { email, identifier, password } = req.body;
  const loginValue = String(email ?? identifier ?? "")
    .trim()
    .toLowerCase();

  if (!loginValue || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const user = await User.findOne({
    $or: [{ email: loginValue }, { username: loginValue }],
  }).select("+passwordHash");

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken({ id: user._id.toString() });

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      name: user.name,
    },
  });
};

// Keep route so frontend doesn’t crash.
// Real reset flow is out of scope.
const reset = async (_req, res) => {
  return res.json({
    message: "If this email exists, a reset link will be sent.",
  });
};

module.exports = { signup, login, reset };

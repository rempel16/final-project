const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");

const signup = async (req, res) => {
  const { email, password, username, name = "" } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) {
    return res.status(409).json({ message: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, username, name, passwordHash });

  const token = signToken({ id: user._id });

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
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken({ id: user._id });

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

module.exports = { signup, login };

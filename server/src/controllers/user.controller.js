const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid id" });

    const user = await User.findById(id).select(
      "email username name bio avatar createdAt",
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      id: user._id,
      email: user.email,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
    });
  } catch {
    return res.status(500).json({ message: "Failed to load user" });
  }
};

const updateMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { name, bio, avatar } = req.body;

    const user = await User.findById(userId).select(
      "email username name bio avatar",
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    if (typeof name === "string") user.name = name;
    if (typeof bio === "string") user.bio = bio;
    if (typeof avatar === "string") user.avatar = avatar;

    await user.save();

    return res.json({
      id: user._id,
      email: user.email,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
    });
  } catch {
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

const searchUsers = async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();
    if (!q) return res.json([]);

    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(safe, "i");

    const users = await User.find({
      $or: [{ username: rx }, { name: rx }],
    })
      .select("username name avatar")
      .limit(20);

    return res.json(
      users.map((u) => ({
        id: u._id,
        username: u.username,
        name: u.name,
        avatar: u.avatar,
      })),
    );
  } catch {
    return res.status(500).json({ message: "Failed to search users" });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid id" });

    const limit = Math.min(Number(req.query.limit ?? 20), 50);
    const skip = Math.max(Number(req.query.skip ?? 0), 0);

    const posts = await Post.find({ author: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "author", select: "username name avatar" });

    return res.json(posts);
  } catch {
    return res.status(500).json({ message: "Failed to load user posts" });
  }
};

module.exports = { getUserById, updateMe, searchUsers, getUserPosts };

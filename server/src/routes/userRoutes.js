const router = require("express").Router();

const auth = require("../middlewares/auth.middleware");
const User = require("../models/User");

const toUserProfile = (user) => ({
  id: user._id.toString(),
  username: user.username,
  name: user.name || "",
  avatarUrl: user.avatar || null,
  bio: user.bio || null,
});

const toUserPreview = (user) => ({
  id: user._id.toString(),
  username: user.username,
  name: user.name || "",
  avatarUrl: user.avatar || null,
});

router.use(auth);

// GET /api/users/me
router.get("/me", async (req, res) => {
  const meId = req.user?.id;
  if (!meId) return res.status(401).json({ message: "Unauthorized" });

  const me = await User.findById(meId);
  if (!me) return res.status(404).json({ message: "User not found" });

  return res.json({
    ...toUserProfile(me),
    followingIds: (me.following ?? []).map((x) => x.toString()),
  });
});

// PATCH /api/users/me
router.patch("/me", async (req, res) => {
  const meId = req.user?.id;
  if (!meId) return res.status(401).json({ message: "Unauthorized" });

  const { name, bio, avatarUrl } = req.body ?? {};

  const patch = {};
  if (typeof name === "string") patch.name = name.slice(0, 80);
  if (typeof bio === "string") patch.bio = bio.slice(0, 200);
  if (typeof avatarUrl === "string") patch.avatar = avatarUrl;

  const updated = await User.findByIdAndUpdate(meId, patch, { new: true });
  if (!updated) return res.status(404).json({ message: "User not found" });

  return res.json(toUserProfile(updated));
});

// GET /api/users/search?q=...
router.get("/search", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) return res.json([]);

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const users = await User.find({ $or: [{ username: regex }, { name: regex }] })
    .limit(30)
    .select("username name avatar");

  return res.json(users.map(toUserPreview));
});

// GET /api/users/:id
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "username name avatar bio",
  );
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json(toUserProfile(user));
});

// POST /api/users/:id/follow (toggle)
router.post("/:id/follow", async (req, res) => {
  const meId = req.user?.id;
  const targetId = req.params.id;

  if (!meId) return res.status(401).json({ message: "Unauthorized" });
  if (meId === targetId)
    return res.status(400).json({ message: "Cannot follow yourself" });

  const me = await User.findById(meId);
  const target = await User.findById(targetId);
  if (!me || !target)
    return res.status(404).json({ message: "User not found" });

  const already = me.following.some((x) => x.toString() === targetId);

  if (already) {
    me.following = me.following.filter((x) => x.toString() !== targetId);
  } else {
    me.following.push(target._id);
  }

  await me.save();
  return res.json({ following: !already });
});

module.exports = router;

const router = require("express").Router();

const auth = require("../middlewares/auth.middleware");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const toUserPreview = (user) => ({
  id: user._id.toString(),
  username: user.username,
  avatarUrl: user.avatar || null,
});

const toPostDto = (post, meId, commentsCount) => {
  const likes = Array.isArray(post.likes) ? post.likes : [];
  const likedByMe = meId ? likes.some((x) => x.toString() === meId) : false;

  return {
    id: post._id.toString(),
    author: toUserPreview(post.author),
    imageUrl: post.imageUrl,
    text: post.text || "",
    createdAt: post.createdAt.toISOString(),
    likesCount: likes.length,
    likedByMe,
    commentsCount: commentsCount ?? 0,
    isMine: meId ? post.author._id.toString() === meId : false,
  };
};

const toCommentDto = (comment, meId) => ({
  id: comment._id.toString(),
  postId: comment.post.toString(),
  author: toUserPreview(comment.author),
  text: comment.text,
  createdAt: comment.createdAt.toISOString(),
  isMine: meId ? comment.author._id.toString() === meId : false,
});

router.use(auth);

// GET /api/posts?page=1&limit=10 or ?userId=...
router.get("/", async (req, res) => {
  const meId = req.user?.id;
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const limit = Math.min(
    30,
    Math.max(1, parseInt(String(req.query.limit ?? "10"), 10) || 10),
  );
  const userId = String(req.query.userId ?? "").trim();

  const filter = userId ? { author: userId } : {};
  const total = await Post.countDocuments(filter);

  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("author", "username avatar");

  const postIds = posts.map((p) => p._id);
  const countsAgg = await Comment.aggregate([
    { $match: { post: { $in: postIds } } },
    { $group: { _id: "$post", count: { $sum: 1 } } },
  ]);
  const counts = new Map(countsAgg.map((r) => [r._id.toString(), r.count]));

  return res.json({
    items: posts.map((p) =>
      toPostDto(p, meId, counts.get(p._id.toString()) ?? 0),
    ),
    total,
  });
});

// GET /api/posts/:id
router.get("/:id", async (req, res) => {
  const meId = req.user?.id;
  const post = await Post.findById(req.params.id).populate(
    "author",
    "username avatar",
  );
  if (!post) return res.status(404).json({ message: "Post not found" });

  const commentsCount = await Comment.countDocuments({ post: post._id });
  return res.json(toPostDto(post, meId, commentsCount));
});

// POST /api/posts
router.post("/", async (req, res) => {
  const meId = req.user?.id;
  if (!meId) return res.status(401).json({ message: "Unauthorized" });

  const { imageUrl, text } = req.body ?? {};
  if (!imageUrl || typeof imageUrl !== "string") {
    return res.status(400).json({ message: "imageUrl is required" });
  }
  if (typeof text === "string" && text.length > 1200) {
    return res.status(400).json({ message: "text is too long" });
  }

  const created = await Post.create({
    author: meId,
    imageUrl,
    text: typeof text === "string" ? text : "",
  });

  const post = await Post.findById(created._id).populate(
    "author",
    "username avatar",
  );
  return res.status(201).json(toPostDto(post, meId, 0));
});

// PATCH /api/posts/:id
router.patch("/:id", async (req, res) => {
  const meId = req.user?.id;
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.author.toString() !== meId)
    return res.status(403).json({ message: "Forbidden" });

  const { text } = req.body ?? {};
  const nextText = String(text ?? "").trim();
  if (!nextText)
    return res.status(400).json({ message: "Post text is required" });
  if (nextText.length > 1200)
    return res.status(400).json({ message: "Post text is too long" });

  post.text = nextText;
  await post.save();

  const populated = await Post.findById(post._id).populate(
    "author",
    "username avatar",
  );
  const commentsCount = await Comment.countDocuments({ post: post._id });
  return res.json(toPostDto(populated, meId, commentsCount));
});

// DELETE /api/posts/:id
router.delete("/:id", async (req, res) => {
  const meId = req.user?.id;
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.author.toString() !== meId)
    return res.status(403).json({ message: "Forbidden" });

  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();
  return res.status(204).send();
});

// POST /api/posts/:id/like { liked: boolean }
router.post("/:id/like", async (req, res) => {
  const meId = req.user?.id;
  if (!meId) return res.status(401).json({ message: "Unauthorized" });

  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const { liked } = req.body ?? {};
  const wantLike = Boolean(liked);

  const has = post.likes.some((x) => x.toString() === meId);
  if (wantLike && !has) post.likes.push(meId);
  if (!wantLike && has)
    post.likes = post.likes.filter((x) => x.toString() !== meId);

  await post.save();
  return res.json({ likesCount: post.likes.length, likedByMe: wantLike });
});

// GET /api/posts/:id/comments?limit&offset
router.get("/:id/comments", async (req, res) => {
  const meId = req.user?.id;
  const postId = req.params.id;

  const limit = Math.min(
    50,
    Math.max(0, parseInt(String(req.query.limit ?? "3"), 10) || 3),
  );
  const offset = Math.max(
    0,
    parseInt(String(req.query.offset ?? "0"), 10) || 0,
  );

  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author", "username avatar");

  return res.json(comments.map((c) => toCommentDto(c, meId)));
});

// POST /api/posts/:id/comments
router.post("/:id/comments", async (req, res) => {
  const meId = req.user?.id;
  if (!meId) return res.status(401).json({ message: "Unauthorized" });

  const postId = req.params.id;
  const text = String(req.body?.text ?? "").trim();
  if (!text)
    return res.status(400).json({ message: "Comment text is required" });
  if (text.length > 500)
    return res.status(400).json({ message: "Comment is too long" });

  const created = await Comment.create({ post: postId, author: meId, text });
  const populated = await Comment.findById(created._id).populate(
    "author",
    "username avatar",
  );
  return res.status(201).json(toCommentDto(populated, meId));
});

// PATCH /api/posts/:postId/comments/:commentId
router.patch("/:postId/comments/:commentId", async (req, res) => {
  const meId = req.user?.id;
  const text = String(req.body?.text ?? "").trim();
  if (!text)
    return res.status(400).json({ message: "Comment text is required" });

  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });
  if (comment.author.toString() !== meId)
    return res.status(403).json({ message: "Forbidden" });

  comment.text = text;
  await comment.save();

  const populated = await Comment.findById(comment._id).populate(
    "author",
    "username avatar",
  );
  return res.json(toCommentDto(populated, meId));
});

router.delete("/:postId/comments/:commentId", async (req, res) => {
  const meId = req.user?.id;
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });
  if (comment.author.toString() !== meId)
    return res.status(403).json({ message: "Forbidden" });

  await comment.deleteOne();
  return res.status(204).send();
});

module.exports = router;

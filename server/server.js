require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const healthRoutes = require("./src/routes/healthRoutes");
const chatsRoutes = require("./src/routes/chatRoutes");
const usersRoutes = require("./src/routes/userRoutes");
const postsRoutes = require("./src/routes/postRoutes");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);
app.options(/.*/, cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/chats", chatsRoutes);

(async () => {
  await connectDB();
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
})();

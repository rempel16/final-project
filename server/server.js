require("dotenv").config();

const express = require("express");
const { connectDB } = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const healthRoutes = require("./src/routes/healthRoutes");

const app = express();
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);

(async () => {
  await connectDB();
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
})();

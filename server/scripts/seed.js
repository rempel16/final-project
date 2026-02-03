require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../src/models/User");
const Post = require("../src/models/Post");

async function connect() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is missing");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
}

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  console.log("Seeding started...");

  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("123456", 10);

  const users = await User.insertMany([
    { email: "anna@test.com", username: "anna", passwordHash, name: "Anna" },
    { email: "max@test.com", username: "max", passwordHash, name: "Max" },
    { email: "kate@test.com", username: "kate", passwordHash, name: "Kate" },
    { email: "tom@test.com", username: "tom", passwordHash, name: "Tom" },
    { email: "lisa@test.com", username: "lisa", passwordHash, name: "Lisa" },
  ]);
  
  const imageUrls = [
    "https://picsum.photos/id/1011/800/800",
    "https://picsum.photos/id/1025/800/800",
    "https://picsum.photos/id/1035/800/800",
    "https://picsum.photos/id/1041/800/800",
    "https://picsum.photos/id/1050/800/800",
  ];

  const postsPayload = Array.from({ length: 50 }).map((_, i) => ({
    author: sample(users)._id,
    imageUrl: sample(imageUrls),
    imageMeta: null, // задел под upload позже
    text: `Seed post #${i + 1}`,
  }));

  await Post.insertMany(postsPayload);

  console.log("✅ Seed done");
}

(async () => {
  try {
    await connect();
    await seed();
  } catch (e) {
    console.error("Seed failed:", e.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    imageUrl: { type: String, required: true },
    imageMeta: { type: Object, default: null },
    text: { type: String, maxlength: 1200, default: "" },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  { timestamps: true },
);

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);

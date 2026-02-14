const express = require("express");
const auth = require("../middlewares/auth.middleware");
const {
  getChats,
  getOrCreateChat,
  getChatMessages,
  sendChatMessage,
} = require("../controllers/chat.controller");

const router = express.Router();

router.get("/", auth, getChats);
router.post("/", auth, getOrCreateChat);

router.get("/:chatId/messages", auth, getChatMessages);
router.post("/:chatId/messages", auth, sendChatMessage);

module.exports = router;

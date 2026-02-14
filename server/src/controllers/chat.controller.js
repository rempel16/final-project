const mongoose = require("mongoose");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

const getMeId = (req) => req.user?.id;

const isParticipant = async (chatId, userId) => {
  const chat = await Chat.findById(chatId).select("_id participants");
  if (!chat) return { ok: false, chat: null };
  const ok = chat.participants.some((p) => String(p) === String(userId));
  return { ok, chat };
};

const toThreadDto = async (chat, meId) => {
  const other =
    (chat.participants || []).find((u) => String(u._id) !== String(meId)) ??
    chat.participants?.[0];

  const last = await Message.findOne({ chatId: chat._id })
    .sort({ createdAt: -1 })
    .select("text")
    .lean();

  return {
    id: String(chat._id),
    participant: other
      ? {
          id: String(other._id),
          username: other.username,
          name: other.name || "",
          avatar: other.avatar || "",
        }
      : { id: "", username: "unknown", name: "", avatar: "" },
    lastMessage: last?.text ?? "",
  };
};

// GET /api/chats
const getChats = async (req, res) => {
  const meId = getMeId(req);
  if (!meId) return res.status(401).json({ message: "Unauthorized" });

  const chats = await Chat.find({ participants: meId })
    .sort({ updatedAt: -1 })
    .populate("participants", "username name avatar")
    .lean();

  const threads = [];
  for (const c of chats) {
    threads.push(await toThreadDto(c, meId));
  }

  res.json(threads);
};

// POST /api/chats { userId }
const getOrCreateChat = async (req, res) => {
  const meId = getMeId(req);
  if (!meId) return res.status(401).json({ message: "Unauthorized" });

  const { userId } = req.body ?? {};
  if (!userId) return res.status(400).json({ message: "Missing userId" });
  if (String(userId) === String(meId)) {
    return res.status(400).json({ message: "Cannot chat with yourself" });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  let chat = await Chat.findOne({
    participants: { $all: [meId, userId] },
  })
    .populate("participants", "username name avatar")
    .lean();

  if (!chat) {
    const created = await Chat.create({ participants: [meId, userId] });
    chat = await Chat.findById(created._id)
      .populate("participants", "username name avatar")
      .lean();
  }

  res.status(201).json(await toThreadDto(chat, meId));
};

// GET /api/chats/:chatId/messages
const getChatMessages = async (req, res) => {
  const meId = getMeId(req);
  if (!meId) return res.status(401).json({ message: "Unauthorized" });

  const { chatId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ message: "Invalid chatId" });
  }

  const check = await isParticipant(chatId, meId);
  if (!check.chat) return res.status(404).json({ message: "Chat not found" });
  if (!check.ok) return res.status(403).json({ message: "Forbidden" });

  const msgs = await Message.find({ chatId }).sort({ createdAt: 1 }).lean();

  res.json(
    msgs.map((m) => ({
      id: String(m._id),
      threadId: String(m.chatId),
      text: m.text,
      createdAt: m.createdAt,
      senderId: m.senderId ? String(m.senderId) : undefined,
    })),
  );
};

// POST /api/chats/:chatId/messages { text }
const sendChatMessage = async (req, res) => {
  const meId = getMeId(req);
  if (!meId) return res.status(401).json({ message: "Unauthorized" });

  const { chatId } = req.params;
  const { text } = req.body ?? {};

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ message: "Invalid chatId" });
  }
  if (!text || !String(text).trim()) {
    return res.status(400).json({ message: "Missing text" });
  }

  const check = await isParticipant(chatId, meId);
  if (!check.chat) return res.status(404).json({ message: "Chat not found" });
  if (!check.ok) return res.status(403).json({ message: "Forbidden" });

  const created = await Message.create({
    chatId,
    senderId: meId,
    text: String(text).trim(),
  });

  await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

  res.status(201).json({
    id: String(created._id),
    threadId: String(created.chatId),
    text: created.text,
    createdAt: created.createdAt,
    senderId: String(created.senderId),
  });
};

module.exports = {
  getChats,
  getOrCreateChat,
  getChatMessages,
  sendChatMessage,
};

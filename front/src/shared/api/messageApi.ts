import { http } from "./http";

import {
  mockChats,
  type MockChat,
  type MockMessage,
  type MockUser,
} from "@/entities/message/mock/messages.mock";

export type Participant = {
  avatar?: string;
  username: string;
  name?: string;
};

export type Thread = {
  id: string;
  participant: Participant;
  lastMessage?: string;
};

export type Message = {
  id: string;
  threadId?: string;
  text: string;
  createdAt: string;
  senderId?: string;
};

const is404 = (err: unknown) => {
  const e = err as { response?: { status?: number } };
  return e?.response?.status === 404;
};

const ME_ID = "me"; // в моках users[0]._id === "me"

const pickPeer = (users?: MockUser[]) => {
  if (!Array.isArray(users) || users.length === 0) return null;
  return users.find((u) => u._id !== ME_ID) ?? users[0] ?? null;
};

const pickLastText = (chat: MockChat) => {
  const fromLastMessage = chat.lastMessage?.text;
  if (fromLastMessage) return fromLastMessage;

  const lastFromArray = chat.messages?.[chat.messages.length - 1]?.text;
  return lastFromArray ?? undefined;
};

const toThreadsFromMock = (): Thread[] => {
  return (mockChats ?? []).map((c: MockChat) => {
    const peer = pickPeer(c.users);

    return {
      id: String(c._id),
      participant: {
        username: String(peer?.username ?? "unknown"),
        name: undefined,
        avatar: peer?.avatar ?? undefined,
      },
      lastMessage: pickLastText(c),
    };
  });
};

const toMessagesFromMock = (threadId: string): Message[] => {
  const chat = (mockChats ?? []).find(
    (c: MockChat) => String(c._id) === String(threadId),
  );

  // если messages нет, но lastMessage есть — показываем его, чтобы чат не был пустым
  const msgs: MockMessage[] = chat?.messages?.length
    ? chat.messages
    : chat?.lastMessage
      ? [chat.lastMessage]
      : [];

  return msgs.map((m: MockMessage, idx: number) => ({
    id: String(m._id ?? `${threadId}-${idx}`),
    threadId,
    text: String(m.text ?? ""),
    createdAt: String(m.createdAt ?? new Date().toISOString()),
    senderId: m.from?._id ?? undefined,
  }));
};

export const messageApi = {
  async getThreads(): Promise<Thread[]> {
    try {
      const res = await http.get("/messages/threads");
      return res.data as Thread[];
    } catch (err) {
      if (is404(err)) return toThreadsFromMock();
      throw err;
    }
  },

  async getMessages(threadId: string): Promise<{ messages: Message[] }> {
    try {
      const res = await http.get(`/messages/${threadId}`);
      return res.data as { messages: Message[] };
    } catch (err) {
      if (is404(err)) return { messages: toMessagesFromMock(threadId) };
      throw err;
    }
  },

  async sendMessage(threadId: string, text: string): Promise<Message> {
    try {
      const res = await http.post(`/messages/${threadId}`, { text });
      return res.data as Message;
    } catch (err) {
      if (is404(err)) {
        // сохраняем в мок-источник, иначе polling (loadMessages) перезатрёт state
        const chat = (mockChats ?? []).find(
          (c: MockChat) => String(c._id) === String(threadId),
        );

        const msgMock: MockMessage = {
          _id: `${threadId}-${Date.now()}`,
          chatId: String(threadId),
          from: {
            _id: ME_ID,
            username: "me",
            avatar: "/avatars/me.jpg",
          } as MockUser,
          text,
          createdAt: new Date().toISOString(),
        };

        if (chat) {
          if (!Array.isArray(chat.messages)) chat.messages = [];
          chat.messages.push(msgMock);
          chat.lastMessage = msgMock;
        }

        return {
          id: String(msgMock._id),
          threadId,
          text,
          createdAt: String(msgMock.createdAt),
          senderId: ME_ID,
        };
      }

      throw err;
    }
  },
};

export default messageApi;

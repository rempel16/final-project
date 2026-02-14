import { http } from "./http";

export type Participant = {
  id?: string;
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

const ensureArray = <T>(v: unknown): T[] =>
  Array.isArray(v) ? (v as T[]) : [];

export const messageApi = {
  getThreads: async (): Promise<Thread[]> => {
    const { data } = await http.get<Thread[]>("/chats");
    return ensureArray<Thread>(data);
  },

  getOrCreateThread: async (userId: string): Promise<Thread> => {
    const { data } = await http.post<Thread>("/chats", { userId });
    return data;
  },

  getMessages: async (threadId: string): Promise<Message[]> => {
    const { data } = await http.get<Message[]>(
      `/chats/${encodeURIComponent(threadId)}/messages`,
    );
    return ensureArray<Message>(data);
  },

  sendMessage: async (
    threadId: string,
    payload: { text: string },
  ): Promise<Message> => {
    const { data } = await http.post<Message>(
      `/chats/${encodeURIComponent(threadId)}/messages`,
      payload,
    );
    return data;
  },
};

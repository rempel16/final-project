import { http } from "./http";

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

export const messageApi = {
  getThreads: async (): Promise<Thread[]> => {
    const { data } = await http.get<Thread[]>("/chats");
    return Array.isArray(data) ? data : [];
  },

  getMessages: async (threadId: string): Promise<Message[]> => {
    const { data } = await http.get<Message[]>(
      `/chats/${encodeURIComponent(threadId)}/messages`,
    );
    return Array.isArray(data) ? data : [];
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

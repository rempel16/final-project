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
  async getThreads(): Promise<Thread[]> {
    const res = await http.get("/messages/threads");
    return res.data as Thread[];
  },

  async getMessages(threadId: string): Promise<{ messages: Message[] }> {
    const res = await http.get(`/messages/${threadId}`);
    return res.data as { messages: Message[] };
  },

  async sendMessage(threadId: string, text: string): Promise<Message> {
    const res = await http.post(`/messages/${threadId}`, { text });
    return res.data as Message;
  },
};

export default messageApi;

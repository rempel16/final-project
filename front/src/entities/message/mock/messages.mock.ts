// Моки для чатов и сообщений (макет)
// Типы рядом с моками, без рефакторинга API

export interface MockUser {
  _id: string;
  username: string;
  avatar: string;
}

export interface MockMessage {
  _id: string;
  chatId: string;
  from: MockUser;
  text?: string;
  image?: string;
  createdAt: string;
}

export interface MockChat {
  _id: string;
  users: MockUser[];
  lastMessage?: MockMessage;
  messages?: MockMessage[];
}

const users: MockUser[] = [
  { _id: "me", username: "me", avatar: "/avatars/me.jpg" },
  { _id: "sashaa", username: "sashaa", avatar: "/avatars/sashaa.jpg" },
  { _id: "ashaa", username: "ashaa", avatar: "/avatars/ashaa.jpg" },
  { _id: "olga", username: "olga", avatar: "/avatars/olga.jpg" },
  { _id: "ivan", username: "ivan", avatar: "/avatars/ivan.jpg" },
];

export const mockChats: MockChat[] = [
  {
    _id: "c1",
    users: [users[0], users[1]],
    lastMessage: {
      _id: "m8",
      chatId: "c1",
      from: users[1],
      text: "See you soon!",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1h
    },
    messages: [
      {
        _id: "m1",
        chatId: "c1",
        from: users[0],
        text: "Hey, how are you?",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2d
      },
      {
        _id: "m2",
        chatId: "c1",
        from: users[1],
        text: "I am good! You?",
        createdAt: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000,
        ).toISOString(),
      },
      {
        _id: "m3",
        chatId: "c1",
        from: users[0],
        text: "All fine, working on the project.",
        createdAt: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000,
        ).toISOString(),
      },
      {
        _id: "m4",
        chatId: "c1",
        from: users[1],
        text: "Cool! Did you see the new post?",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1d
      },
      {
        _id: "m5",
        chatId: "c1",
        from: users[0],
        text: "Yes, looks awesome!",
        createdAt: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000,
        ).toISOString(),
      },
      {
        _id: "m6",
        chatId: "c1",
        from: users[1],
        image: "/posts/p101.jpg",
        createdAt: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000,
        ).toISOString(),
      },
      {
        _id: "m7",
        chatId: "c1",
        from: users[0],
        text: "Nice photo!",
        createdAt: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000,
        ).toISOString(),
      },
      {
        _id: "m8",
        chatId: "c1",
        from: users[1],
        text: "See you soon!",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1h
      },
    ],
  },
  {
    _id: "c2",
    users: [users[0], users[2]],
    lastMessage: {
      _id: "m9",
      chatId: "c2",
      from: users[2],
      text: "Let’s meet tomorrow",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1w
    },
  },
  {
    _id: "c3",
    users: [users[0], users[3]],
    lastMessage: {
      _id: "m10",
      chatId: "c3",
      from: users[3],
      text: "Happy birthday! 🎉",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3d
    },
  },
  {
    _id: "c4",
    users: [users[0], users[4]],
    lastMessage: {
      _id: "m11",
      chatId: "c4",
      from: users[4],
      text: "Check this out",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 1w+
    },
  },
];

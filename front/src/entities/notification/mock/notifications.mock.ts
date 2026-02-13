// Мок-нотификации для NotificationsDrawer (макет)
// Тип рядом с моками, без рефакторинга API

export type NotificationType = "like" | "follow" | "comment";

export interface MockNotification {
  _id: string;
  type: NotificationType;
  createdAt: string;
  fromUser: {
    _id: string;
    username: string;
    avatar?: string;
  };
  post?: {
    _id: string;
    image: string;
  };
}

export const mockNotifications: MockNotification[] = [
  {
    _id: "n1",
    type: "like",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 d
    fromUser: {
      _id: "u_sashaa",
      username: "sashaa",
      avatar: "/avatars/sashaa.jpg",
    },
    post: { _id: "p101", image: "/posts/p101.jpg" },
  },
  {
    _id: "n2",
    type: "follow",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 d
    fromUser: {
      _id: "u_news",
      username: "news",
      avatar: "/avatars/news.jpg",
    },
  },
  {
    _id: "n3",
    type: "comment",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 w
    fromUser: {
      _id: "u_ashaa",
      username: "ashaa",
      avatar: "/avatars/ashaa.jpg",
    },
    post: { _id: "p088", image: "/posts/p088.jpg" },
  },
  {
    _id: "n4",
    type: "like",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 d
    fromUser: {
      _id: "u_olga",
      username: "olga",
      avatar: "/avatars/olga.jpg",
    },
    post: { _id: "p102", image: "/posts/p102.jpg" },
  },
  {
    _id: "n5",
    type: "follow",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 1 w+
    fromUser: {
      _id: "u_ivan",
      username: "ivan",
      avatar: "/avatars/ivan.jpg",
    },
  },
  {
    _id: "n6",
    type: "comment",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 d
    fromUser: {
      _id: "u_maria",
      username: "maria",
      avatar: "/avatars/maria.jpg",
    },
    post: { _id: "p099", image: "/posts/p099.jpg" },
  },
  {
    _id: "n7",
    type: "like",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 1 w+
    fromUser: {
      _id: "u_denis",
      username: "denis",
      avatar: "/avatars/denis.jpg",
    },
    post: { _id: "p100", image: "/posts/p100.jpg" },
  },
  {
    _id: "n8",
    type: "comment",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 d
    fromUser: {
      _id: "u_kate",
      username: "kate",
      avatar: "/avatars/kate.jpg",
    },
    post: { _id: "p103", image: "/posts/p103.jpg" },
  },
];

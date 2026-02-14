import type { NotificationDto } from "../notificationApi";

export const notificationsMock: NotificationDto[] = [
  {
    id: "1",
    username: "anna",
    text: "liked your post",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "mike",
    text: "started following you",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];
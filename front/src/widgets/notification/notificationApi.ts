import { http } from "@/shared/api/http";
import { notificationsMock } from "./mock/notifications.mock";
import { notificationsStore } from "./model/notificationsStore";

export type NotificationDto = {
  id: string;
  username: string;
  avatarUrl?: string;
  text: string;
  createdAt: string;
  isRead?: boolean;
  postPreviewUrl?: string;
};

const dedupeById = <T extends { id: string }>(arr: T[]) => {
  const map = new Map<string, T>();
  for (const x of arr) map.set(x.id, x);
  return Array.from(map.values());
};

export const notificationApi = {
  list: async (): Promise<NotificationDto[]> => {
    const local = notificationsStore.getAll();

    try {
      const res = await http.get<NotificationDto[]>("/notifications");
      return dedupeById([...(res.data ?? []), ...local]).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (e) {
      const err = e as { response?: { status?: number } };
      if (err?.response?.status === 404) {
        return dedupeById([...(notificationsMock ?? []), ...local]).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      }
      throw e;
    }
  },

  markRead: async (id: string): Promise<void> => {
    try {
      await http.post(`/notifications/${id}/read`, {});
    } catch (e) {
      const err = e as { response?: { status?: number } };
      if (err?.response?.status === 404) return;
      throw e;
    }
  },
};

import type { NotificationDto } from "../notificationApi";

const KEY = "ichgram_notifications_v1";

const read = (): NotificationDto[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as NotificationDto[]) : [];
  } catch {
    return [];
  }
};

const write = (items: NotificationDto[]) => {
  localStorage.setItem(KEY, JSON.stringify(items));
};

export const notificationsStore = {
  getAll(): NotificationDto[] {
    return read();
  },

  add(n: Omit<NotificationDto, "id" | "createdAt">) {
    const items = read();
    const item: NotificationDto = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isRead: false,
      ...n,
    };
    write([item, ...items]);
    window.dispatchEvent(new Event("ichgram:notifications"));
  },

  markRead(id: string) {
    const items = read().map((x) => (x.id === id ? { ...x, isRead: true } : x));
    write(items);
    window.dispatchEvent(new Event("ichgram:notifications"));
  },
};

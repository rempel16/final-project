import React, { useCallback, useEffect, useMemo, useState } from "react";
import NotificationsDrawer, {
  type NotificationsDrawerSection,
  type NotificationItem,
} from "./NotificationsDrawer";
import { notificationApi, type NotificationDto } from "./notificationApi";
import { Avatar } from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
};

const toTimeLabel = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
};

const dedupeById = <T extends { id: string }>(arr: T[]) => {
  const map = new Map<string, T>();
  for (const x of arr) map.set(x.id, x);
  return Array.from(map.values());
};

export const NotificationsDrawerContainer: React.FC<Props> = ({
  open,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<NotificationDto[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationApi.list();
      const merged = dedupeById(data).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setItems(merged);
    } catch (e) {
      setError(
        (e as { message?: string })?.message ?? "Failed to load notifications",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const handler = () => load();
    window.addEventListener("ichgram:notifications", handler);
    return () => window.removeEventListener("ichgram:notifications", handler);
  }, [open, load]);

  const markRead = useCallback(async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await notificationApi.markRead(id);
    } catch {
      return;
    }
  }, []);

  const sections: NotificationsDrawerSection[] = useMemo(() => {
    const unread = items.filter((x) => !x.isRead);
    const read = items.filter((x) => x.isRead);

    const mapItem = (n: NotificationDto): NotificationItem => ({
      id: n.id,
      avatar: <Avatar src={n.avatarUrl || undefined} alt={n.username} />,
      username: n.username,
      content: <span>{n.text}</span>,
      time: toTimeLabel(n.createdAt),
      postPreview: n.postPreviewUrl ? (
        <img
          src={n.postPreviewUrl}
          alt=""
          style={{
            width: 40,
            height: 40,
            objectFit: "cover",
            borderRadius: 8,
          }}
        />
      ) : undefined,
      onClick: () => markRead(n.id),
    });

    const out: NotificationsDrawerSection[] = [];
    if (unread.length) out.push({ label: "Новые", items: unread.map(mapItem) });
    if (read.length)
      out.push({ label: "Просмотренные", items: read.map(mapItem) });

    return out;
  }, [items, markRead]);

  const emptyText = loading
    ? "Загрузка…"
    : error
      ? `Ошибка: ${error}`
      : "Нет новых уведомлений";

  return (
    <NotificationsDrawer
      open={open}
      onClose={onClose}
      title="Уведомления"
      sections={sections}
      emptyText={emptyText}
    />
  );
};

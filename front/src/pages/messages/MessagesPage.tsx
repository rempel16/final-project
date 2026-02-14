import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Button,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";

import { getMeId } from "@/shared/lib/me";
import { messageApi, type Message, type Thread } from "@/shared/api/messageApi";
import styles from "./MessagesPage.module.scss";

type LocalMessage = Message & { _status?: "sending" | "failed" };

const mergeUniqueById = (prev: LocalMessage[], next: Message[]) => {
  const map = new Map<string, LocalMessage>();
  for (const m of prev) map.set(m.id, m);

  for (const m of next) {
    const existing = map.get(m.id);
    map.set(m.id, { ...(existing ?? {}), ...m, _status: existing?._status });
  }

  return Array.from(map.values()).sort(
    (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
  );
};

export const MessagesPage = () => {
  const [searchParams] = useSearchParams();
  const requestedUserId = useMemo(
    () => searchParams.get("userId"),
    [searchParams],
  );

  const meId = useMemo(() => getMeId(), []);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [threadsError, setThreadsError] = useState<string | null>(null);

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async () => {
    setThreadsLoading(true);
    setThreadsError(null);

    try {
      const data = await messageApi.getThreads();
      const next = Array.isArray(data) ? data : [];
      setThreads(next);

      if (requestedUserId) {
        const existing = next.find((t) => t.participant.id === requestedUserId);

        if (existing) {
          setSelectedThreadId(existing.id);
          return;
        }

        const created = await messageApi.getOrCreateThread(requestedUserId);

        setThreads((prev) => {
          const exists = prev.some((t) => t.id === created.id);
          return exists ? prev : [created, ...prev];
        });

        setSelectedThreadId(created.id);
        return;
      }

      if (next.length > 0) {
        setSelectedThreadId((prev) => prev ?? next[0].id);
      } else {
        setSelectedThreadId(null);
      }
    } catch (err) {
      console.error("Failed to load threads:", err);
      setThreads([]);
      setSelectedThreadId(null);
      setThreadsError("Failed to load conversations.");
    } finally {
      setThreadsLoading(false);
    }
  }, [requestedUserId]);

  const loadMessages = useCallback(async (threadId: string) => {
    setMessagesLoading(true);
    setMessagesError(null);

    try {
      const data = await messageApi.getMessages(threadId);
      const next = Array.isArray(data) ? data : [];
      setMessages((prev) => mergeUniqueById(prev, next));
    } catch (err) {
      console.error("Failed to load messages:", err);
      setMessages([]);
      setMessagesError("Failed to load conversation messages.");
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!selectedThreadId) {
      setMessages([]);
      setMessagesError(null);
      setMessagesLoading(false);
      return;
    }

    void loadMessages(selectedThreadId);

    const interval = window.setInterval(() => {
      void loadMessages(selectedThreadId);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [selectedThreadId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !selectedThreadId) return;

    setSendingMessage(true);

    try {
      const newMessage = await messageApi.sendMessage(selectedThreadId, {
        text: messageText.trim(),
      });

      setMessages((prev) => mergeUniqueById(prev, [newMessage]));
      setMessageText("");
      setMessagesError(null);

      setThreads((prev) => {
        const idx = prev.findIndex((t) => t.id === selectedThreadId);
        if (idx < 0) return prev;
        const next = [...prev];
        const [picked] = next.splice(idx, 1);
        return [{ ...picked, lastMessage: newMessage.text }, ...next];
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessagesError("Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  }, [messageText, selectedThreadId]);

  const selectedThread = useMemo(
    () => threads.find((t) => t.id === selectedThreadId),
    [threads, selectedThreadId],
  );

  return (
    <Container maxWidth="lg" className={styles.container}>
      <div className={styles.layout}>
        <Paper elevation={0} className={styles.threads}>
          <div className={styles.threadsHeader}>
            <Typography variant="h6">Messages</Typography>
            <div className={styles.threadsHeaderRight}>
              <Button
                type="button"
                variant="text"
                onClick={() => void loadThreads()}
                disabled={threadsLoading}
                className={styles.refreshBtn}
              >
                {threadsLoading ? "Loading…" : "Refresh"}
              </Button>
            </div>
          </div>

          {threadsLoading ? (
            <div className={styles.centerWrap}>
              <CircularProgress />
            </div>
          ) : threadsError ? (
            <div className={styles.centerWrap}>
              <Paper elevation={0} className={styles.errorCard}>
                <Typography variant="h6" gutterBottom>
                  {threadsError}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Unable to load conversations.
                </Typography>
                <Button
                  type="button"
                  variant="contained"
                  onClick={() => void loadThreads()}
                >
                  Retry
                </Button>
              </Paper>
            </div>
          ) : (
            <List className={styles.threadsList}>
              {threads.length === 0 ? (
                <ListItem>
                  <Typography color="text.secondary">
                    {requestedUserId
                      ? "No conversations yet."
                      : "No messages yet"}
                  </Typography>
                </ListItem>
              ) : (
                threads.map((thread) => (
                  <ListItemButton
                    key={thread.id}
                    selected={selectedThreadId === thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={thread.participant.avatar}
                        alt={thread.participant.username}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        thread.participant.name || thread.participant.username
                      }
                      secondary={thread.lastMessage}
                      secondaryTypographyProps={{ noWrap: true }}
                    />
                  </ListItemButton>
                ))
              )}
            </List>
          )}
        </Paper>

        <Paper elevation={0} className={styles.chat}>
          {selectedThread ? (
            <>
              <div className={styles.chatHeader}>
                <Typography variant="h6">
                  {selectedThread.participant.name ||
                    selectedThread.participant.username}
                </Typography>
              </div>

              <div className={styles.chatBody}>
                {messagesLoading ? (
                  <div className={styles.centerWrap}>
                    <CircularProgress />
                  </div>
                ) : messagesError ? (
                  <div className={styles.centerWrap}>
                    <Paper elevation={0} className={styles.errorCard}>
                      <Typography variant="h6" gutterBottom>
                        {messagesError}
                      </Typography>
                      <Button
                        type="button"
                        variant="contained"
                        onClick={() => void loadMessages(selectedThread.id)}
                      >
                        Retry
                      </Button>
                    </Paper>
                  </div>
                ) : (
                  <Stack spacing={1}>
                    {messages.map((msg) => {
                      const isMine = Boolean(meId) && msg.senderId === meId;

                      return (
                        <div
                          key={msg.id}
                          className={
                            isMine
                              ? styles.messageRowMine
                              : styles.messageRowOther
                          }
                        >
                          <Paper
                            className={
                              isMine
                                ? styles.messageBubbleMine
                                : styles.messageBubbleOther
                            }
                          >
                            <Typography variant="body2">{msg.text}</Typography>
                            <Typography
                              variant="caption"
                              className={styles.messageTime}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </Typography>
                          </Paper>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </Stack>
                )}
              </div>

              <Divider />

              <div className={styles.composer}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSendMessage();
                    }
                  }}
                  disabled={sendingMessage}
                />

                <Button
                  variant="contained"
                  onClick={() => void handleSendMessage()}
                  disabled={!messageText.trim() || sendingMessage}
                >
                  {sendingMessage ? <CircularProgress size={24} /> : "Send"}
                </Button>
              </div>
            </>
          ) : (
            <div className={styles.chatEmpty}>
              <Typography color="text.secondary">
                Select a conversation
              </Typography>
            </div>
          )}
        </Paper>
      </div>
    </Container>
  );
};

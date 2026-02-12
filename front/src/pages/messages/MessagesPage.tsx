import { useEffect, useRef, useState } from "react";
import {
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";
import { messageApi, type Thread, type Message } from "@/shared/api/messageApi";
import styles from "./MessagesPage.module.scss";

export const MessagesPage = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadThreads = async () => {
      try {
        const data = await messageApi.getThreads();
        setThreads(data);
        setError(null);
        if (data.length > 0) {
          setSelectedThreadId((prev) => prev ?? data[0].id);
        }
      } catch (err) {
        console.error("Failed to load threads:", err);
        setError("Failed to load conversations.");
      } finally {
        setLoading(false);
      }
    };

    loadThreads();
  }, []);

  useEffect(() => {
    if (!selectedThreadId) return;

    const loadMessages = async () => {
      try {
        const data = await messageApi.getMessages(selectedThreadId);
        setMessages(data.messages);
        setError(null);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setError("Failed to load conversation messages.");
      }
    };

    loadMessages();

    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedThreadId) return;

    setSendingMessage(true);
    try {
      const newMessage = await messageApi.sendMessage(
        selectedThreadId,
        messageText,
      );
      setMessages((prev) => [...prev, newMessage]);
      setMessageText("");
      setError(null);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className={styles.centerWrap}>
          <CircularProgress />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className={styles.centerWrap}>
          <Paper elevation={0} className={styles.errorCard}>
            <Typography variant="h6" gutterBottom>
              {error}
            </Typography>
            <Typography color="text.secondary">
              Unable to load messages.
            </Typography>
          </Paper>
        </div>
      </Container>
    );
  }

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  return (
    <Container maxWidth="lg" className={styles.container}>
      <div className={styles.layout}>
        {/* Threads List */}
        <Paper elevation={0} className={styles.threads}>
          <List className={styles.threadsList}>
            {threads.length === 0 ? (
              <ListItem>
                <Typography color="text.secondary">No messages yet</Typography>
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
        </Paper>

        {/* Chat */}
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
                <Stack spacing={1}>
                  {messages.map((msg) => (
                    <div key={msg.id} className={styles.messageRow}>
                      <Paper className={styles.messageBubble}>
                        <Typography variant="body2">{msg.text}</Typography>
                        <Typography
                          variant="caption"
                          className={styles.messageTime}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </Stack>
              </div>
              <Divider />
              <div className={styles.composer}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={sendingMessage}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
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

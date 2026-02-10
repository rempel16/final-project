import { useEffect, useRef, useState } from "react";
import {
  Container,
  Box,
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
import {
  messageApi,
  type Thread,
  type Message,
} from "../../shared/api/messageApi";

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
        if (data.length > 0 && !selectedThreadId) {
          setSelectedThreadId(data[0].id);
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
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Paper elevation={0} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              {error}
            </Typography>
            <Typography color="text.secondary">
              Unable to load messages.
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "300px 1fr" },
          gap: 2,
          height: "80vh",
        }}
      >
        {/* Threads List */}
        <Paper
          elevation={0}
          sx={{ borderRight: "1px solid #e0e0e0", overflowY: "auto" }}
        >
          <List sx={{ p: 0 }}>
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
        <Paper elevation={0} sx={{ display: "flex", flexDirection: "column" }}>
          {selectedThread ? (
            <>
              <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
                <Typography variant="h6">
                  {selectedThread.participant.name ||
                    selectedThread.participant.username}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                <Stack spacing={1}>
                  {messages.map((msg) => (
                    <Box
                      key={msg.id}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mb: 1,
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1.5,
                          maxWidth: "70%",
                          backgroundColor: "#1976d2",
                          color: "white",
                        }}
                      >
                        <Typography variant="body2">{msg.text}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Stack>
              </Box>
              <Divider />
              <Box sx={{ p: 2, display: "flex", gap: 1 }}>
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
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <Typography color="text.secondary">
                Select a conversation
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Box,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { userApi } from "@/entities/user/api";
import type { UserPreview } from "@/entities/post/types";
import styles from "./SearchPanel.module.scss";

type Props = {
  open: boolean;
  onClose: () => void;
};

type SearchUser = UserPreview & {
  avatarUrl?: string;
  avatar?: string;
  name?: string;
};

const MAX_RECENT_SEARCHES = 8;
const STORAGE_KEY = "ichgram.recent.searches";

const readRecent = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v): v is string => typeof v === "string")
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
};

const writeRecent = (value: string[]) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(value.slice(0, MAX_RECENT_SEARCHES)),
    );
  } catch {
    // ignore
  }
};

export const SearchPanel = ({ open, onClose }: Props) => {
  const isDesktop = useMediaQuery("(min-width:900px)");
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>(() => readRecent());

  const [results, setResults] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const debounceRef = useRef<number | null>(null);

  const addRecent = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      const normalized = trimmed.toLowerCase();
      const next = [
        trimmed,
        ...recent.filter((r) => r.toLowerCase() !== normalized),
      ].slice(0, MAX_RECENT_SEARCHES);

      setRecent(next);
      writeRecent(next);
    },
    [recent],
  );

  const runSearch = useCallback((value: string) => {
    const q = value.trim();
    if (!q) {
      setResults([]);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);

    userApi
      .searchUsers(q)
      .then((users) => {
        setResults(users);
      })
      .catch(() => {
        setIsError(true);
        setResults([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleInput = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => runSearch(value), 300);
    },
    [runSearch],
  );

  const handleEnter = useCallback(() => {
    addRecent(query);
    runSearch(query);
  }, [addRecent, query, runSearch]);

  const handleClose = useCallback(() => {
    setIsError(false);
    setIsLoading(false);
    setResults([]);
    onClose();
  }, [onClose]);

  const emptyText = useMemo(() => {
    if (recent.length > 0) return null;
    return "No recent searches yet";
  }, [recent.length]);

  const handleUserClick = (id: string) => {
    addRecent(query);
    onClose();
    navigate(`/profile/${id}`);
  };

  return (
    <Drawer
      anchor="left"
      variant={isDesktop ? "persistent" : "temporary"}
      open={open}
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{ className: styles.drawerPaper }}
    >
      <div className={styles.root}>
        <div className={styles.header}>
          <Typography className={styles.title}>Search</Typography>
          <IconButton aria-label="Close search" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        <TextField
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleEnter();
          }}
          placeholder="Search"
          fullWidth
        />

        {isLoading ? (
          <Box className={styles.loading}>
            <CircularProgress size={18} />
          </Box>
        ) : null}

        {isError ? (
          <Typography className={styles.empty}>Search failed</Typography>
        ) : null}

        {!isLoading && !isError && results.length > 0 ? (
          <Box className={styles.resultsWrap}>
            {results.map((user) => (
              <Box
                key={user.id}
                className={styles.userRow}
                onClick={() => handleUserClick(user.id)}
                role="button"
                tabIndex={0}
              >
                <Avatar
                  src={user.avatarUrl ?? user.avatar ?? ""}
                  className={styles.avatar}
                />
                <Box className={styles.userInfo}>
                  <Typography className={styles.username}>
                    {user.username}
                  </Typography>
                  {user.name ? (
                    <Typography className={styles.name}>{user.name}</Typography>
                  ) : null}
                </Box>
              </Box>
            ))}
          </Box>
        ) : null}

        <Divider />

        <Typography className={styles.sectionTitle}>Recent</Typography>

        {emptyText ? (
          <Typography className={styles.empty}>{emptyText}</Typography>
        ) : (
          <List className={styles.recentList}>
            {recent.map((item) => (
              <ListItemButton
                key={item}
                onClick={() => {
                  setQuery(item);
                  runSearch(item);
                }}
                className={styles.recentItem}
              >
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{ className: styles.recentText }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </div>
    </Drawer>
  );
};

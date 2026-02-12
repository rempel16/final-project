import { useCallback, useMemo, useState } from "react";
import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import styles from "./SearchPanel.module.scss";

type Props = {
  open: boolean;
  onClose: () => void;
};

const MAX_RECENT_SEARCHES = 8;
const STORAGE_KEY = "ichgram.recent.searches";

const readRecent = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string").slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
};

const writeRecent = (value: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value.slice(0, MAX_RECENT_SEARCHES)));
  } catch {
    // ignore
  }
};

export const SearchPanel = ({ open, onClose }: Props) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>(() => readRecent());

  const addRecent = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      const normalized = trimmed.toLowerCase();
      const next = [trimmed, ...recent.filter((r) => r.toLowerCase() !== normalized)].slice(
        0,
        MAX_RECENT_SEARCHES,
      );

      setRecent(next);
      writeRecent(next);
    },
    [recent],
  );

  const handleEnter = useCallback(() => addRecent(query), [addRecent, query]);

  const emptyText = useMemo(() => {
    if (recent.length > 0) return null;
    return "No recent searches yet";
  }, [recent.length]);

  return (
    <Drawer
      anchor="left"
      variant={isDesktop ? "persistent" : "temporary"}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{ className: styles.drawerPaper }}
    >
      <div className={styles.root}>
        <div className={styles.header}>
          <Typography className={styles.title}>Search</Typography>
          <IconButton aria-label="Close search" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        <TextField
          fullWidth
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleEnter();
            }
          }}
        />

        <Divider />

        <Typography className={styles.sectionTitle}>Recent</Typography>

        {emptyText ? (
          <Typography className={styles.empty}>{emptyText}</Typography>
        ) : (
          <List className={styles.recentList}>
            {recent.map((item) => (
              <ListItemButton
                key={item}
                onClick={() => setQuery(item)}
                className={styles.recentItem}
              >
                <ListItemText primary={item} primaryTypographyProps={{ className: styles.recentText }} />
              </ListItemButton>
            ))}
          </List>
        )}
      </div>
    </Drawer>
  );
};

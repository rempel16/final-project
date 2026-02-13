import { useCallback, useRef, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Avatar,
  CircularProgress,
  Button,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { userApi } from "@/entities/user/api";
import type { UserPreview } from "@/entities/post/types";
import styles from "./SearchPage.module.scss";

export const SearchPage = () => {
  const isDesktop = useMediaQuery("(min-width:900px)");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const debounceRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setTouched(true);
    setIsError(false);
    setErrorMessage(null);

    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    const value = e.target.value;
    debounceRef.current = window.setTimeout(() => {
      if (!value.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      userApi
        .searchUsers(value)
        .then((users) => {
          setResults(users);
          setIsError(false);
          setErrorMessage(null);
        })
        .catch((err) => {
          setIsError(true);
          setErrorMessage(err?.message || "Ошибка поиска");
          setResults([]);
        })
        .finally(() => setIsLoading(false));
    }, 300);
  };

  const handleRetry = useCallback(() => {
    setIsError(false);
    setErrorMessage(null);
    setIsLoading(true);

    userApi
      .searchUsers(query)
      .then((users) => {
        setResults(users);
        setIsError(false);
        setErrorMessage(null);
      })
      .catch((err) => {
        setIsError(true);
        setErrorMessage(err?.message || "Ошибка поиска");
        setResults([]);
      })
      .finally(() => setIsLoading(false));
  }, [query]);

  const handleUserClick = (id: string) => {
    // мобильное поведение: переход на профиль
    navigate(`/profile/${id}`);
  };

  // Десктоп: поиск рисуется SearchPanel-ом поверх. Эта страница не нужна.
  if (isDesktop) return null;

  return (
    <Box className={styles.root}>
      <Typography className={styles.title}>Search</Typography>

      <Paper variant="outlined" className={styles.panel}>
        <TextField
          fullWidth
          placeholder="Search users by name or username"
          value={query}
          onChange={handleInput}
          autoFocus
        />

        {isLoading && (
          <Box className={styles.loading}>
            <CircularProgress size={20} />
          </Box>
        )}

        {isError && (
          <Stack spacing={1} className={styles.emptyWrap}>
            <Typography color="error">
              {errorMessage || "Ошибка поиска"}
            </Typography>
            <Button onClick={handleRetry}>Retry</Button>
          </Stack>
        )}

        {!isLoading &&
          !isError &&
          query.trim() &&
          results.length === 0 &&
          touched && (
            <Stack spacing={1} className={styles.emptyWrap}>
              <Typography className={styles.emptyTitle}>
                Пользователи не найдены
              </Typography>
              <Typography className={styles.emptyText}>
                Попробуйте изменить запрос
              </Typography>
            </Stack>
          )}

        {!isLoading && !isError && results.length > 0 && (
          <Stack spacing={1} className={styles.resultsWrap}>
            {results.map((user) => (
              <Box
                key={user.id}
                className={styles.userRow}
                onClick={() => handleUserClick(user.id)}
              >
                <Avatar src={user.avatarUrl} className={styles.avatar} />
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
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

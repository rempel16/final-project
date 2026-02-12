import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Container, Typography } from "@mui/material";

import { postApi } from "@/entities/post/api/postApi";
import type { Post } from "@/entities/post/model/types";
import { usePostModal } from "@/features/postModal/model/usePostModal";
import { PageState } from "@/shared/ui/PageState/PageState";
import styles from "./ExplorePage.module.scss";

export const ExplorePage = () => {
  const { open } = usePostModal();

  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErrorText(null);
      try {
        const { items: pageItems } = await postApi.getFeedPage(1, 60);
        if (!alive) return;
        setItems(pageItems);
      } catch (err: unknown) {
        if (!alive) return;
        setErrorText((err as { message?: string })?.message ?? String(err));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const isEmpty = useMemo(
    () => !loading && !errorText && items.length === 0,
    [loading, errorText, items.length],
  );

  return (
    <Container className={styles.root}>
      <Typography className={styles.title}>Explore</Typography>

      {loading ? (
        <Box className={styles.loading}>
          <CircularProgress />
        </Box>
      ) : errorText ? (
        <PageState kind="error" description={errorText} />
      ) : isEmpty ? (
        <PageState kind="empty" title="Nothing to explore yet" />
      ) : (
        <Box className={styles.grid}>
          {items.map((post) => (
            <button
              key={post.id}
              type="button"
              className={styles.tile}
              onClick={() => open(post.id)}
              aria-label="Open post"
            >
              <img
                className={styles.image}
                src={post.imageUrl}
                alt=""
                loading="lazy"
              />
            </button>
          ))}
        </Box>
      )}
    </Container>
  );
};

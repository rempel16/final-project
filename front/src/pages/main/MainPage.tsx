import { useCallback, useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Typography, Button } from "@mui/material";

import type { Post } from "@/entities/post/model/types";
import { postApi } from "@/entities/post/api/postApi";
import { PostCard } from "@/entities/post/ui/PostCard/PostCard";
import { usePostModal } from "../../features/postModal/model/usePostModal";
import styles from "./MainPage.module.scss";

const PAGE_SIZE = 10;

export const MainPage = () => {
  const { open } = usePostModal();
  const [items, setItems] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadPage = useCallback(
    async (targetPage: number) => {
      if (isLoading) return;
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);

      try {
        const { items: newItems, total } = await postApi.getFeedPage(
          targetPage,
          PAGE_SIZE,
        );

        // Merge and ensure unique by id
        setItems((prev) => {
          const map = new Map(prev.map((p) => [p.id, p]));
          newItems.forEach((p) => map.set(p.id, p));
          const merged = Array.from(map.values());
          // Sort by createdAt DESC as fallback
          merged.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          return merged;
        });

        const loadedCount = (targetPage - 1) * PAGE_SIZE + newItems.length;
        setHasMore(loadedCount < total);
      } catch (err: unknown) {
        setIsError(true);
        setErrorMessage((err as { message?: string })?.message ?? String(err));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  useEffect(() => {
    loadPage(1);
    setPage(1);
  }, [loadPage]);

  useEffect(() => {
    return postApi.subscribe((feed) => {
      const limit = page * PAGE_SIZE;
      setItems(feed.slice(0, limit));
      setHasMore(limit < feed.length);
    });
  }, [page]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver((entries) => {
      const ent = entries[0];
      if (ent.isIntersecting && !isLoading && hasMore && !isError) {
        const next = page + 1;
        setPage(next);
        loadPage(next);
      }
    });

    observerRef.current.observe(sentinelRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [page, isLoading, hasMore, isError, loadPage]);

  const handleRetry = () => {
    setIsError(false);
    setErrorMessage(null);
    loadPage(page || 1);
  };

  return (
    <Box className={styles.root}>
      <Box className={styles.container}>
        <div className={styles.titleRow}>
          <img src="/icon/Home.svg" alt="Home" className={styles.titleIcon} />
          <Typography className={styles.title}>Home</Typography>
        </div>

        {isLoading && items.length === 0 ? (
          <div className={styles.loader}>
            <CircularProgress />
          </div>
        ) : isError && items.length === 0 ? (
          <div className={styles.error}>
            {errorMessage || "Error loading posts"}
            <Button onClick={handleRetry} className={styles.retryBtn}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>No posts yet</div>
        ) : (
          <>
            <div className={styles.feed}>
              {items.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => open(post.id)}
                />
              ))}
            </div>

            {isLoading && (
              <div className={styles.loader}>
                <CircularProgress size={20} />
              </div>
            )}

            <div ref={sentinelRef} className={styles.sentinel} />

            {!hasMore && items.length > 0 && (
              <div className={styles.endBlock}>
                <img
                  src="/icon/illo-confirm-refresh-light.png"
                  alt="seen all the updates"
                  className={styles.endIcon}
                />
                <div className={styles.endTitle}>
                  You've seen all the updates
                </div>
                <div className={styles.endSubtitle}>
                  You have viewed all new publications
                </div>
              </div>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

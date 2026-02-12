import { useMemo, useState } from "react";
import { Avatar, Box, Card, Typography } from "@mui/material";

import type { Post } from "../../model/types";
import styles from "./PostCard.module.scss";

type Props = {
  post: Post;
  onClick?: () => void;
};

export const PostCard = ({ post, onClick }: Props) => {
  const [imageError, setImageError] = useState(false);

  const initials = useMemo(() => {
    return post.author.username.slice(0, 1).toUpperCase();
  }, [post.author.username]);

  return (
    <Card
      variant="outlined"
      className={`${styles.card} ${onClick ? styles.clickable : ""}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <Box className={styles.header}>
        <Avatar
          src={post.author.avatarUrl ?? undefined}
          className={styles.avatar}
        >
          {initials}
        </Avatar>
        <Typography className={styles.username}>
          {post.author.username}
        </Typography>
      </Box>

      <Box className={styles.imageWrap}>
        {!post.imageUrl || imageError ? (
          <Box className={styles.imagePlaceholder}>No image</Box>
        ) : (
          <Box
            component="img"
            src={post.imageUrl}
            alt={post.text}
            onError={() => setImageError(true)}
            className={styles.image}
          />
        )}
      </Box>

      <Box className={styles.meta}>
        <Typography className={styles.caption}>
          <Box component="span" className={styles.captionUser}>
            {post.author.username}
          </Box>{" "}
          {post.text}
        </Typography>
      </Box>
    </Card>
  );
};

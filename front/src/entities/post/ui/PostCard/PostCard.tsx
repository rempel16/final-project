import { useState } from "react";
import { Box, Card, Typography } from "@mui/material";

import type { Post } from "../../model/types";
import { UserLink } from "../../../user/UserLink/UserLink";
import styles from "./PostCard.module.scss";

type Props = {
  post: Post;
  onClick?: () => void;
};

export const PostCard = ({ post, onClick }: Props) => {
  const [imageError, setImageError] = useState(false);

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
        <UserLink variant="compact" user={post.author} />
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

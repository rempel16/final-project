import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import type { Post } from "../../model/types";
import styles from "./PostCard.module.scss";

type Props = {
  post: Post;
  onClick: () => void;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
};

export const PostCard = ({ post, onClick, onLike, onComment }: Props) => {
  const authorAny = post.author as Record<string, unknown>;
  const avatarUrl =
    (typeof authorAny.avatarUrl === "string" && authorAny.avatarUrl) ||
    (typeof authorAny.photoUrl === "string" && authorAny.photoUrl) ||
    (typeof authorAny.imageUrl === "string" && authorAny.imageUrl) ||
    (typeof authorAny.avatar === "string" && authorAny.avatar) ||
    "";

  const handleLikeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onLike(post.id);
  };

  const handleCommentClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onComment(post.id);
  };

  return (
    <div className={styles.post} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.header}>
        <div className={styles.userBlock}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder} />
          )}

          <span className={styles.username}>{post.author.username}</span>
          <span className={styles.time}>• 2 wk</span>
        </div>

        <button type="button" className={styles.followBtn}>
          follow
        </button>
      </div>

      <div className={styles.imageWrapper}>
        <img src={post.imageUrl} alt="post" className={styles.image} />
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={handleLikeClick}
          aria-label={post.likedByMe ? "Unlike" : "Like"}
        >
          {post.likedByMe ? (
            <FavoriteIcon className={styles.liked} />
          ) : (
            <FavoriteBorderIcon />
          )}
        </button>

        <button
          type="button"
          className={styles.iconButton}
          onClick={handleCommentClick}
          aria-label="Comment"
        >
          <ChatBubbleOutlineIcon />
        </button>
      </div>

      <div className={styles.likes}>
        {post.likesCount.toLocaleString()} likes
      </div>

      <div className={styles.body}>
        <div className={styles.caption}>
          <span className={styles.captionUser}>{post.author.username}</span>{" "}
          {post.text}
        </div>
      </div>
    </div>
  );
};

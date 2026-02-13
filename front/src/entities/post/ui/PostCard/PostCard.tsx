import { useMemo, useState } from "react";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import type { Post } from "../../model/types";
import styles from "./PostCard.module.scss";

type Props = {
  post: Post;
  onClick?: () => void;
};

const formatRelative = (dateLike: string | number | Date) => {
  const date = new Date(dateLike);
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, "second");
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hour");
  const diffDay = Math.round(diffHr / 24);
  if (Math.abs(diffDay) < 7) return rtf.format(diffDay, "day");
  const diffWk = Math.round(diffDay / 7);
  if (Math.abs(diffWk) < 4) return rtf.format(diffWk, "week");
  const diffMo = Math.round(diffDay / 30);
  if (Math.abs(diffMo) < 12) return rtf.format(diffMo, "month");
  const diffYr = Math.round(diffDay / 365);
  return rtf.format(diffYr, "year");
};

export const PostCard = ({ post, onClick }: Props) => {
  const [imageError, setImageError] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const initials = useMemo(
    () => post.author.username.slice(0, 1).toUpperCase(),
    [post.author.username],
  );
  const profileHref = `/profile/${post.author.id}`;
  const timeLabel = useMemo(() => {
    if (!post.createdAt) return "";
    return formatRelative(post.createdAt);
  }, [post.createdAt]);
  const isLongCaption = (post.text ?? "").length > 180;

  return (
    <div
      className={`${styles.card} ${onClick ? styles.clickable : ""}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link
            to={profileHref}
            className={styles.avatar}
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className={styles.avatar}>{initials}</Avatar>
          </Link>
          <div className={styles.userInfo}>
            <span className={styles.username}>{post.author.username}</span>
            {timeLabel && <span className={styles.time}>{timeLabel}</span>}
          </div>
        </div>
      </div>
      <div className={styles.media}>
        {!imageError ? (
          <img
            className={styles.image}
            src={post.imageUrl}
            alt={post.text ?? "Post image"}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={styles.placeholder}>No image</div>
        )}
      </div>
      {post.text ? (
        <div className={styles.body}>
          <div className={styles.caption}>
            <span className={styles.username}>{post.author.username}</span>{" "}
            {isLongCaption && !captionExpanded ? (
              <>
                {post.text.slice(0, 180)}
                <button
                  className={styles.more}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCaptionExpanded(true);
                  }}
                >
                  more
                </button>
              </>
            ) : (
              post.text
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

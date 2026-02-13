import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";

import type { Post } from "../../model/types";
import { postApi } from "../../api/postApi";
import { likeApi } from "@/entities/like/api/likeApi";
import type { Comment } from "@/entities/comment/model/types";
import { commentApi } from "@/entities/comment/api/commentApi";
import { CommentItem } from "@/entities/comment/ui/CommentItem/CommentItem";
import { UserLink } from "@/entities/user/UserLink/UserLink";
import { PostModalMenu } from "./PostModalMenu";

import styles from "./PostModal.module.scss";

type Props = {
  postId: string;
  onClose: () => void;
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

export const PostModal = ({ postId, onClose }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [imageError, setImageError] = useState(false);

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const [captionExpanded, setCaptionExpanded] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  const [likePending, setLikePending] = useState(false);

  const [showAllComments, setShowAllComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState("");
  const [creatingComment, setCreatingComment] = useState(false);
  const [createCommentError, setCreateCommentError] = useState<string | null>(
    null,
  );

  const commentInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setErrorMessage(null);
    setImageError(false);
    setCaptionExpanded(false);
    setEditing(false);
    setShowAllComments(false);
    setNewComment("");
    setCreateCommentError(null);

    postApi
      .getById(postId)
      .then((p) => {
        if (!alive) return;
        setPost(p);
        if (!p) setErrorMessage("Post not found");
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setErrorMessage(
          (err as { message?: string })?.message ?? "Error loading post",
        );
      })
      .finally(() => {
        if (!alive) return;
        setIsLoading(false);
      });

    const unsubscribe = postApi.subscribe((feed) => {
      if (!alive) return;
      const next = feed.find((p) => p.id === postId) ?? null;
      setPost(next);
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, [postId]);

  const timeLabel = useMemo(() => {
    if (!post?.createdAt) return "";
    return formatRelative(post.createdAt);
  }, [post?.createdAt]);

  const dateLabel = useMemo(() => {
    if (!post?.createdAt) return "";
    return new Date(post.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [post?.createdAt]);

  const isLongCaption = useMemo(() => {
    const txt = post?.text ?? "";
    return txt.length > 180;
  }, [post?.text]);

  useEffect(() => {
    let alive = true;
    if (!post) return;

    setCommentsLoading(true);
    setCommentsError(null);

    const limit = showAllComments ? 50 : 2;
    commentApi
      .getByPostId(post.id, { limit, offset: 0 })
      .then((items) => {
        if (!alive) return;
        const sorted = [...items].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        );
        setComments(sorted);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setCommentsError(
          (err as { message?: string })?.message ?? "Error loading comments",
        );
      })
      .finally(() => {
        if (!alive) return;
        setCommentsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [post, showAllComments]);

  const handleToggleLike = useCallback(async () => {
    if (!post || likePending) return;
    setLikePending(true);
    try {
      if (post.likedByMe) {
        await likeApi.unlike(post.id);
      } else {
        await likeApi.like(post.id);
      }
    } catch (err) {
      window.alert((err as { message?: string })?.message ?? "Like failed");
    } finally {
      setLikePending(false);
    }
  }, [likePending, post]);

  const handleStartEdit = useCallback(() => {
    if (!post) return;
    setEditing(true);
    setEditText(post.text ?? "");
    setCreateCommentError(null);
  }, [post]);

  const handleSaveEdit = useCallback(async () => {
    if (!post || saving) return;
    const nextText = editText.trim();
    if (!nextText) return;

    setSaving(true);
    try {
      const updated = await postApi.update(post.id, { text: nextText });
      setPost(updated);
      setEditing(false);
    } catch (err) {
      window.alert((err as { message?: string })?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }, [editText, post, saving]);

  const handleDelete = useCallback(async () => {
    if (!post) return;
    const ok = window.confirm("Delete this post?");
    if (!ok) return;

    try {
      await postApi.delete(post.id);
      onClose();
    } catch (err) {
      window.alert((err as { message?: string })?.message ?? "Delete failed");
    }
  }, [onClose, post]);

  const handleCopyLink = useCallback(async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("postId", postId);
      await navigator.clipboard.writeText(url.toString());
    } catch (err) {
      window.alert((err as { message?: string })?.message ?? "Copy failed");
    }
  }, [postId]);

  const handleGoToPost = useCallback(() => {
    const next = new URLSearchParams(location.search);
    next.set("postId", postId);
    navigate({ pathname: "/", search: `?${next.toString()}` });
  }, [location.search, navigate, postId]);

  const handleCreateComment = useCallback(async () => {
    if (!post || creatingComment) return;
    const txt = newComment.trim();
    if (!txt) return;

    setCreatingComment(true);
    setCreateCommentError(null);
    try {
      const created = await commentApi.create(post.id, txt);
      setNewComment("");
      setShowAllComments(true);
      setComments((prev) =>
        [...prev, created].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      );
    } catch (err: unknown) {
      setCreateCommentError(
        (err as { message?: string })?.message ?? "Comment failed",
      );
    } finally {
      setCreatingComment(false);
    }
  }, [creatingComment, newComment, post]);

  const content = isLoading ? (
    <Box className={styles.stateWrap}>
      <CircularProgress size={20} />
      <Typography className={styles.mutedText}>Loading…</Typography>
    </Box>
  ) : errorMessage || !post ? (
    <Box className={styles.stateWrap}>
      <Typography className={styles.inlineError}>
        {errorMessage ?? "Post not found"}
      </Typography>
      <Button variant="text" onClick={onClose}>
        Close
      </Button>
    </Box>
  ) : (
    <>
      <div className={styles.header}>
        <UserLink
          user={post.author}
          subtitle={timeLabel}
          variant="compact"
          className={styles.authorLink}
        />

        <div className={styles.headerActions}>
          {!post.isMine ? (
            <Button
              variant="text"
              className={styles.followBtn}
              onClick={() => {
                // no-op for mock UI
              }}
            >
              Follow
            </Button>
          ) : null}

          <IconButton
            aria-label="Post actions"
            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
            className={styles.menuBtn}
          >
            <MoreHorizRoundedIcon fontSize="small" />
          </IconButton>
        </div>
      </div>

      <Divider />

      {editing ? (
        <>
          <TextField
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            className={styles.editTextarea}
          />

          <div className={styles.editActions}>
            <Button
              variant="contained"
              onClick={handleSaveEdit}
              disabled={saving || !editText.trim()}
            >
              Save
            </Button>
            <Button
              variant="text"
              onClick={() => {
                setEditing(false);
                setEditText(post.text ?? "");
              }}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <div className={styles.textBlock}>
          <Typography
            className={`${styles.text} ${
              isLongCaption && !captionExpanded ? styles.textCollapsed : ""
            }`}
          >
            <span className={styles.captionUser}>{post.author.username}</span>{" "}
            {post.text}
          </Typography>

          {isLongCaption && !captionExpanded ? (
            <button
              type="button"
              className={styles.moreButton}
              onClick={() => setCaptionExpanded(true)}
            >
              more
            </button>
          ) : null}
        </div>
      )}

      {dateLabel ? <Typography className={styles.date}>{dateLabel}</Typography> : null}

      <div className={styles.actionsRow}>
        <div className={styles.actionGroup}>
          <IconButton
            aria-label={post.likedByMe ? "Unlike" : "Like"}
            onClick={handleToggleLike}
            disabled={likePending}
            className={styles.actionBtn}
          >
            {post.likedByMe ? (
              <FavoriteRoundedIcon className={styles.likedIcon} fontSize="small" />
            ) : (
              <FavoriteBorderRoundedIcon fontSize="small" />
            )}
          </IconButton>

          <IconButton
            aria-label="Comment"
            onClick={() => commentInputRef.current?.focus()}
            className={styles.actionBtn}
          >
            <ChatBubbleOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </div>
      </div>

      {post.likesCount > 0 ? (
        <div className={styles.likesRow}>
          <Typography className={styles.likesCount}>
            {post.likesCount.toLocaleString()} likes
          </Typography>
        </div>
      ) : null}

      <div className={styles.commentsSection}>
        <div className={styles.commentsHeader}>
          <Typography className={styles.sectionTitle}>Comments</Typography>

          {post.commentsCount > 2 ? (
            <button
              type="button"
              className={styles.viewAllBtn}
              onClick={() => setShowAllComments((v) => !v)}
            >
              {showAllComments
                ? "Hide"
                : `View all comments (${post.commentsCount})`}
            </button>
          ) : null}
        </div>

        {commentsLoading ? (
          <div className={styles.commentsState}>
            <CircularProgress size={16} />
            <Typography className={styles.mutedText}>Loading…</Typography>
          </div>
        ) : commentsError ? (
          <Typography className={styles.inlineError}>{commentsError}</Typography>
        ) : comments.length === 0 ? (
          <Typography className={styles.mutedText}>No comments yet</Typography>
        ) : (
          <div className={styles.commentsList}>
            {comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                onUpdated={(updated) =>
                  setComments((prev) =>
                    prev
                      .map((x) => (x.id === updated.id ? updated : x))
                      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
                  )
                }
                onDeleted={(commentId) =>
                  setComments((prev) => prev.filter((x) => x.id !== commentId))
                }
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.addCommentSection}>
        {createCommentError ? (
          <Typography className={styles.inlineError}>
            {createCommentError}
          </Typography>
        ) : null}

        <div className={styles.addCommentRow}>
          <TextField
            inputRef={commentInputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment…"
            size="small"
            fullWidth
            className={styles.addCommentInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleCreateComment();
              }
            }}
          />

          <Button
            variant="text"
            onClick={handleCreateComment}
            disabled={creatingComment || !newComment.trim()}
            className={styles.addCommentBtn}
          >
            Post
          </Button>
        </div>
      </div>

      <PostModalMenu
        open={Boolean(menuAnchorEl)}
        anchorEl={menuAnchorEl}
        isMine={post.isMine}
        onEdit={handleStartEdit}
        onDelete={handleDelete}
        onGoToPost={handleGoToPost}
        onCopyLink={handleCopyLink}
        onClose={() => setMenuAnchorEl(null)}
      />
    </>
  );

  return (
    <Modal
      open
      onClose={() => onClose()}
      className={styles.overlay}
      slotProps={{ backdrop: { className: styles.backdrop } }}
      keepMounted
    >
      <Box className={styles.modal}>
        <div className={styles.modalTopBar}>
          <IconButton
            aria-label="Close post"
            onClick={onClose}
            className={styles.closeBtn}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </div>

        <div className={styles.body}>
          <div className={styles.imageCol}>
            {!post || imageError ? (
              <div className={styles.imagePlaceholder}>No image</div>
            ) : (
              <img
                className={styles.image}
                src={post.imageUrl}
                alt={post.text ?? "Post image"}
                onError={() => setImageError(true)}
              />
            )}
          </div>

          <div className={styles.contentCol}>{content}</div>
        </div>
      </Box>
    </Modal>
  );
};

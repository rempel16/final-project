import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useNavigate } from "react-router-dom";

import type { Post } from "../../model/types";
import { postApi } from "../../api/postApi";
import type { Comment } from "../../../comment/model/types";
import { commentApi } from "../../../comment/api/commentApi";
import { likeApi } from "../../../like/api/likeApi";
import { followApi } from "../../../follow/api/followApi";
import { CommentItem } from "../../../comment/ui/CommentItem/CommentItem";
import { AddCommentForm } from "../../../../features/comments/AddCommentForm/AddCommentForm";
import { PageState } from "@/shared/ui/PageState/PageState";
import { PostModalMenu } from "./PostModalMenu";
import styles from "./PostModal.module.scss";

type Props = {
  postId: string;
  onClose: () => void;
};

const PREVIEW_TEXT_LIMIT = 140;

const getErrorMessage = (err: unknown) =>
  (err as { message?: string })?.message ?? "Something went wrong";

export const PostModal = ({ postId, onClose }: Props) => {
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [postLoading, setPostLoading] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const [postReloadKey, setPostReloadKey] = useState(0);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentsReloadKey, setCommentsReloadKey] = useState(0);

  const [commentsLimit, setCommentsLimit] = useState(3);
  const [expandedText, setExpandedText] = useState(false);
  const prevPostIdRef = useRef<string | null>(null);

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);

  const [editingPost, setEditingPost] = useState(false);
  const [editText, setEditText] = useState("");
  const [savingPost, setSavingPost] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [imageError, setImageError] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);

  const isMenuOpen = Boolean(menuAnchorEl);

  const initials = useMemo(() => {
    if (!post) return "";
    return post.author.username.slice(0, 1).toUpperCase();
  }, [post]);

  const createdAtLabel = useMemo(() => {
    if (!post) return "";
    return new Date(post.createdAt).toLocaleString();
  }, [post]);

  const isLongText = Boolean(post && post.text.length > PREVIEW_TEXT_LIMIT);
  const visibleText =
    post && !editingPost && !expandedText && isLongText
      ? `${post.text.slice(0, PREVIEW_TEXT_LIMIT).trimEnd()}…`
      : (post?.text ?? "");

  const canViewMoreComments = Boolean(
    post && post.commentsCount > comments.length,
  );

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    setPostLoading(true);
    setPostError(null);
    setPost(null);
    setExpandedText(false);
    setEditingPost(false);
    setEditText("");
    setImageError(false);
    setLikeError(null);

    (async () => {
      try {
        const data = await postApi.getById(postId);
        if (cancelled) return;

        setPost(data);
        setEditText(data?.text ?? "");

        if (data && !data.isMine) {
          const following = await followApi.isFollowing(data.author.id);
          if (cancelled) return;
          setIsFollowing(following);
        } else {
          setIsFollowing(false);
        }
      } catch (err) {
        if (cancelled) return;
        setPostError(getErrorMessage(err));
      } finally {
        if (!cancelled) setPostLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postId, postReloadKey]);

  useEffect(() => {
    let cancelled = false;

    if (prevPostIdRef.current !== postId) {
      prevPostIdRef.current = postId;
      if (commentsLimit !== 3) {
        setComments([]);
        setCommentsError(null);
        setCommentsLoading(true);
        setCommentsLimit(3);
        return () => {
          cancelled = true;
        };
      }
    }

    setCommentsLoading(true);
    setCommentsError(null);
    setComments([]);

    (async () => {
      try {
        const data = await commentApi.getByPostId(postId, {
          limit: commentsLimit,
        });
        if (cancelled) return;
        setComments(data);
      } catch (err) {
        if (cancelled) return;
        setCommentsError(getErrorMessage(err));
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [commentsLimit, commentsReloadKey, postId]);

  const handleToggleLike = async () => {
    if (!post) return;

    setLikeError(null);

    const previous = post;
    const nextLiked = !post.likedByMe;
    const nextLikesCount = Math.max(0, post.likesCount + (nextLiked ? 1 : -1));
    setPost({ ...post, likedByMe: nextLiked, likesCount: nextLikesCount });

    try {
      if (nextLiked) await likeApi.like(post.id);
      else await likeApi.unlike(post.id);
    } catch (err) {
      setPost(previous);
      setLikeError(getErrorMessage(err));
      window.alert("Failed to update like");
    }
  };

  const handleToggleFollow = async () => {
    if (!post || post.isMine) return;

    setFollowLoading(true);
    try {
      if (isFollowing) await followApi.unfollow(post.author.id);
      else await followApi.follow(post.author.id);
      setIsFollowing((v) => !v);
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setFollowLoading(false);
    }
  };

  const handleAddComment = async (text: string) => {
    if (!post) return;
    setSubmittingComment(true);
    try {
      const created = await commentApi.create(post.id, text);
      setComments((prev) => [created, ...prev].slice(0, commentsLimit));
      setPost((prev) =>
        prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : prev,
      );
    } catch (err) {
      window.alert(getErrorMessage(err));
      throw err;
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentUpdated = (updated: Comment) => {
    setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setPost((prev) =>
      prev
        ? { ...prev, commentsCount: Math.max(0, prev.commentsCount - 1) }
        : prev,
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      window.alert("Link copied");
    } catch {
      window.prompt("Copy link:", window.location.href);
    }
  };

  const handleGoToPost = () => {
    navigate(
      { pathname: "/", search: `?postId=${encodeURIComponent(postId)}` },
      { replace: true },
    );
  };

  const handleEditFromMenu = () => {
    if (!post?.isMine) return;
    setEditingPost(true);
    setExpandedText(true);
  };

  const handleDeleteFromMenu = async () => {
    if (!post || !post.isMine) return;
    const ok = window.confirm("Delete this post?");
    if (!ok) return;

    setDeletingPost(true);
    try {
      await postApi.delete(post.id);
      onClose();
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setDeletingPost(false);
    }
  };

  const handleSavePost = async () => {
    if (!post || !post.isMine) return;
    setSavingPost(true);
    try {
      const updated = await postApi.update(post.id, { text: editText });
      setPost(updated);
      setEditingPost(false);
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setSavingPost(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.modalTopBar}>
          <IconButton aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>

        <div className={styles.body}>
          <div className={styles.imageCol}>
            {!post?.imageUrl || imageError ? (
              <div className={styles.imagePlaceholder}>No image</div>
            ) : (
              <img
                src={post.imageUrl}
                alt={post.text}
                className={styles.image}
                onError={() => setImageError(true)}
              />
            )}
          </div>

          <div className={styles.contentCol}>
            {postLoading ? (
              <div className={styles.stateWrap}>
                <CircularProgress />
              </div>
            ) : postError ? (
              <div className={styles.stateWrap}>
                <PageState
                  kind="error"
                  description={postError}
                  onRetry={() => setPostReloadKey((v) => v + 1)}
                />
              </div>
            ) : !post ? (
              <div className={styles.stateWrap}>
                <PageState kind="empty" title="Post not found" />
              </div>
            ) : (
              <>
                <div className={styles.header}>
                  <button
                    type="button"
                    className={styles.author}
                    onClick={() => navigate(`/profile/${post.author.id}`)}
                  >
                    <Avatar
                      src={post.author.avatarUrl ?? undefined}
                      className={styles.avatar}
                    >
                      {initials}
                    </Avatar>
                    <Typography className={styles.username}>
                      {post.author.username}
                    </Typography>
                  </button>

                  <div className={styles.headerActions}>
                    {!post.isMine ? (
                      <Button
                        size="small"
                        variant={isFollowing ? "outlined" : "contained"}
                        onClick={handleToggleFollow}
                        disabled={followLoading}
                      >
                        {isFollowing ? "Unfollow" : "Follow"}
                      </Button>
                    ) : null}

                    <IconButton
                      aria-label="Post menu"
                      onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                    >
                      <MoreHorizIcon />
                    </IconButton>

                    <PostModalMenu
                      open={isMenuOpen}
                      anchorEl={menuAnchorEl}
                      isMine={post.isMine}
                      onEdit={handleEditFromMenu}
                      onDelete={handleDeleteFromMenu}
                      onGoToPost={handleGoToPost}
                      onCopyLink={handleCopyLink}
                      onClose={() => setMenuAnchorEl(null)}
                    />
                  </div>
                </div>

                <div className={styles.textBlock}>
                  {editingPost ? (
                    <>
                      <TextField
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
                        inputProps={{ maxLength: 1200 }}
                      />
                      <div className={styles.editActions}>
                        <Button
                          variant="contained"
                          onClick={handleSavePost}
                          disabled={savingPost || !editText.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          variant="text"
                          onClick={() => {
                            setEditingPost(false);
                            setEditText(post.text);
                          }}
                          disabled={savingPost}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Typography className={styles.text}>
                        {visibleText}
                      </Typography>
                      {isLongText && !expandedText ? (
                        <button
                          type="button"
                          className={styles.moreButton}
                          onClick={() => setExpandedText(true)}
                        >
                          More
                        </button>
                      ) : null}
                    </>
                  )}
                </div>

                <Typography className={styles.date}>
                  {createdAtLabel}
                </Typography>

                <div className={styles.likesRow}>
                  {post.likesCount > 0 ? (
                    <Typography className={styles.likesCount}>
                      {post.likesCount} likes
                    </Typography>
                  ) : (
                    <span />
                  )}

                  <IconButton
                    aria-label={post.likedByMe ? "Unlike" : "Like"}
                    onClick={handleToggleLike}
                  >
                    {post.likedByMe ? (
                      <FavoriteIcon color="error" />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                </div>

                {likeError ? (
                  <Typography className={styles.inlineError}>
                    {likeError}
                  </Typography>
                ) : null}

                <div className={styles.commentsSection}>
                  <Typography className={styles.sectionTitle}>
                    Comments
                  </Typography>

                  {commentsLoading ? (
                    <div className={styles.commentsState}>
                      <CircularProgress size={20} />
                    </div>
                  ) : commentsError ? (
                    <div className={styles.commentsState}>
                      <Typography className={styles.inlineError}>
                        {commentsError}
                      </Typography>
                      <Button
                        variant="text"
                        onClick={() => setCommentsReloadKey((v) => v + 1)}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : comments.length === 0 ? (
                    <Typography className={styles.mutedText}>
                      No comments yet
                    </Typography>
                  ) : (
                    <div className={styles.commentsList}>
                      {comments.map((c) => (
                        <CommentItem
                          key={c.id}
                          comment={c}
                          onUpdated={handleCommentUpdated}
                          onDeleted={handleCommentDeleted}
                        />
                      ))}
                    </div>
                  )}

                  {canViewMoreComments ? (
                    <Button
                      variant="text"
                      onClick={() => setCommentsLimit((v) => v + 3)}
                    >
                      View more
                    </Button>
                  ) : null}
                </div>

                <div className={styles.addCommentSection}>
                  <AddCommentForm
                    onSubmit={handleAddComment}
                    disabled={!post}
                    submitting={submittingComment}
                  />
                </div>

                {deletingPost ? (
                  <Typography className={styles.mutedText}>
                    Deleting…
                  </Typography>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

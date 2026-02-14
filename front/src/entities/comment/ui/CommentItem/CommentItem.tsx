import { useMemo, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

import type { Comment as CommentModel } from "../../model/types";
import { commentApi } from "../../api/commentApi";
import { UserRow } from "@/entities/user/UserRow/UserRow";
import styles from "./CommentItem.module.scss";

type Props = {
  comment: CommentModel;
  onUpdated: (comment: CommentModel) => void;
  onDeleted: (commentId: string) => void;
};

const getErrorMessage = (err: unknown) =>
  (err as { message?: string })?.message ?? "Something went wrong";

const formatRelative = (iso: string) => {
  const created = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - created);

  const day = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (day < 1) return "today";
  if (day < 7) return `${day} d`;

  const week = Math.floor(day / 7);
  if (week < 5) return `${week} wk`;

  return new Date(iso).toLocaleDateString();
};

export const CommentItem = ({ comment, onUpdated, onDeleted }: Props) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [text, setText] = useState(comment.text);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const subtitle = useMemo(
    () => formatRelative(comment.createdAt),
    [comment.createdAt],
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await commentApi.update(comment.postId, comment.id, text);
      onUpdated(updated);
      setMode("view");
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm("Delete this comment?");
    if (!ok) return;

    setDeleting(true);
    try {
      await commentApi.delete(comment.postId, comment.id);
      onDeleted(comment.id);
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const actions = comment.isMine ? (
    <Box className={styles.actions}>
      {mode === "edit" ? (
        <>
          <Button
            size="small"
            variant="contained"
            onClick={handleSave}
            disabled={saving || !text.trim()}
          >
            Save
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={() => {
              setMode("view");
              setText(comment.text);
            }}
            disabled={saving}
          >
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button
            size="small"
            variant="text"
            onClick={() => setMode("edit")}
            disabled={deleting}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="text"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
          >
            Delete
          </Button>
        </>
      )}
    </Box>
  ) : null;

  return (
    <Box className={styles.root}>
      <UserRow
        size="sm"
        align="top"
        avatarUrl={comment.author.avatarUrl}
        username={comment.author.username}
        subtitle={subtitle}
        rightSlot={actions}
      />

      {mode === "edit" ? (
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          size="small"
          fullWidth
          multiline
          minRows={2}
          className={styles.textarea}
        />
      ) : (
        <Typography className={styles.text}>{comment.text}</Typography>
      )}
    </Box>
  );
};

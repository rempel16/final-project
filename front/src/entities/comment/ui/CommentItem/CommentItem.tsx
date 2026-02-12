import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

import type { Comment } from "../../model/types";
import { commentApi } from "../../api/commentApi";
import styles from "./CommentItem.module.scss";

type Props = {
  comment: Comment;
  onUpdated: (comment: Comment) => void;
  onDeleted: (commentId: string) => void;
};

const getErrorMessage = (err: unknown) =>
  (err as { message?: string })?.message ?? "Something went wrong";

export const CommentItem = ({ comment, onUpdated, onDeleted }: Props) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [text, setText] = useState(comment.text);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await commentApi.update(comment.id, text);
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
      await commentApi.delete(comment.id);
      onDeleted(comment.id);
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box className={styles.root}>
      <Box className={styles.main}>
        <Typography className={styles.username}>
          {comment.author.username}
        </Typography>

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

      {comment.isMine ? (
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
      ) : null}
    </Box>
  );
};


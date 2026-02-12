import { useState } from "react";
import { Box, Button, TextField } from "@mui/material";

import styles from "./AddCommentForm.module.scss";

type Props = {
  disabled?: boolean;
  submitting?: boolean;
  onSubmit: (text: string) => Promise<void> | void;
};

export const AddCommentForm = ({ disabled, submitting, onSubmit }: Props) => {
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = text.trim();
    if (!next) return;

    try {
      await onSubmit(next);
      setText("");
    } catch {
      // keep text
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className={styles.root}>
      <TextField
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment…"
        size="small"
        fullWidth
        disabled={disabled || submitting}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={disabled || submitting || !text.trim()}
        className={styles.send}
      >
        Send
      </Button>
    </Box>
  );
};

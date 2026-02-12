import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

import styles from "./CreatePostPage.module.scss";

type ModalState = { backgroundLocation?: unknown };

const CAPTION_MAX = 1200;

export const CreatePostPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ModalState | null;

  const isModal = useMemo(() => Boolean(state?.backgroundLocation), [state]);

  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClose = () => {
    if (isModal) navigate(-1);
    else navigate("/");
  };

  const openPicker = () => inputRef.current?.click();

  const setFile = (file: File) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setFile(file);
  };

  const onDrop: React.DragEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setFile(file);
  };

  const onDragOver: React.DragEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
  };

  const canShare = Boolean(imageFile);

  return (
    <Dialog
      open
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ className: styles.paper }}
      BackdropProps={{ className: styles.backdrop }}
    >
      <DialogTitle className={styles.titleRow}>
        <Typography className={styles.title}>Create new post</Typography>

        <Button className={styles.shareBtn} disabled={!canShare}>
          Share
        </Button>
      </DialogTitle>

      <DialogContent className={styles.content}>
        <div className={styles.body}>
          <button
            type="button"
            className={styles.dropzone}
            onClick={openPicker}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            {imageUrl ? (
              <img className={styles.previewImg} src={imageUrl} alt="" />
            ) : (
              <>
                <Box className={styles.dropIcon} />
                <Typography className={styles.dropText}>
                  Drag photos here
                </Typography>
                <Typography className={styles.dropHint}>
                  Click to upload
                </Typography>
              </>
            )}

            <input
              ref={inputRef}
              className={styles.fileInput}
              type="file"
              accept="image/*"
              onChange={onPickFile}
            />
          </button>

          <div className={styles.right}>
            <div className={styles.authorRow}>
              <Box className={styles.authorAvatar} />
              <Typography className={styles.authorName}>skai_laba</Typography>
            </div>

            <TextField
              multiline
              minRows={8}
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              inputProps={{ maxLength: CAPTION_MAX }}
              className={styles.caption}
            />

            <Typography className={styles.counter}>
              {caption.length} / {CAPTION_MAX}
            </Typography>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
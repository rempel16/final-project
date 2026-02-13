import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, CircularProgress, Snackbar } from "@mui/material";

import { postApi } from "@/entities/post/api/postApi";
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
  const [isPosting, setIsPosting] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    severity: "success" | "error";
    message: string;
  }>({ open: false, severity: "success", message: "" });
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClose = () => {
    if (isModal) navigate(-1);
    else navigate("/");
  };
  const openPicker = () => inputRef.current?.click();
  const setFile = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
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
  const canShare = Boolean(imageFile) && Boolean(imageUrl) && !isPosting;

  const postNow = async () => {
    if (!imageUrl || !imageFile || isPosting) return;

    setIsPosting(true);
    try {
      await postApi.create({ imageUrl, text: caption });
      setToast({
        open: true,
        severity: "success",
        message: "Post created",
      });
      navigate("/", { replace: true });
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? "Failed to create";
      setToast({ open: true, severity: "error", message: msg });
      setIsPosting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <button
            className={styles.headerBtn}
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
          <div className={styles.headerTitle}>Create new post</div>
          <Button
            className={styles.headerBtnPrimary}
            disabled={!canShare}
            onClick={postNow}
            size="small"
          >
            {isPosting ? <CircularProgress size={18} /> : "Post"}
          </Button>
        </div>
        <div className={styles.body}>
          <div className={styles.mediaCol}>
            <button
              type="button"
              className={styles.uploadZone}
              onClick={openPicker}
              onDrop={onDrop}
              onDragOver={onDragOver}
              aria-disabled={isPosting}
              disabled={isPosting}
            >
              {imageUrl ? (
                <img className={styles.previewImg} src={imageUrl} alt="" />
              ) : (
                <>
                  <div className={styles.uploadIcon} />
                  <div className={styles.uploadText}>Upload</div>
                  <div className={styles.uploadHint}>Drag & drop or click</div>
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
            {imageUrl ? (
              <div className={styles.previewActions}>
                <button
                  className={styles.secondaryBtn}
                  type="button"
                  onClick={openPicker}
                  disabled={isPosting}
                >
                  Replace
                </button>
                <button
                  className={styles.secondaryBtn}
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImageUrl(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  disabled={isPosting}
                >
                  Remove
                </button>
              </div>
            ) : null}
          </div>
          <div className={styles.detailsCol}>
            <div className={styles.steps}>
              <div className={styles.step} data-active={Boolean(imageUrl)}>
                Upload
              </div>
              <div className={styles.step} data-active={Boolean(imageUrl)}>
                Preview
              </div>
              <div
                className={styles.step}
                data-active={Boolean(imageUrl) && caption.length > 0}
              >
                Caption
              </div>
              <div className={styles.step} data-active={false}>
                Post
              </div>
            </div>
            <div className={styles.userRow}>
              <div className={styles.miniAvatar} />
              <div className={styles.username}>skai_laba</div>
            </div>
            <textarea
              className={styles.textarea}
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={CAPTION_MAX}
              rows={8}
              disabled={isPosting}
            />
            <div className={styles.footer}>
              <button
                className={styles.emojiBtn}
                tabIndex={-1}
                type="button"
                aria-label="Emoji"
                disabled={isPosting}
              >
                😊
              </button>
              <span className={styles.counter}>
                {caption.length} / {CAPTION_MAX}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Snackbar
        open={toast.open}
        autoHideDuration={2400}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

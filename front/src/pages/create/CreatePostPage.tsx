import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
          <button
            className={
              canShare ? styles.headerBtnPrimary : styles.headerBtnDisabled
            }
            disabled={!canShare}
          >
            Share
          </button>
        </div>
        <div className={styles.body}>
          <div className={styles.mediaCol}>
            <button
              type="button"
              className={styles.uploadZone}
              onClick={openPicker}
              onDrop={onDrop}
              onDragOver={onDragOver}
            >
              {imageUrl ? (
                <img className={styles.previewImg} src={imageUrl} alt="" />
              ) : (
                <>
                  <div className={styles.uploadIcon} />
                  <div className={styles.uploadText}>Drag photos here</div>
                  <div className={styles.uploadHint}>Click to upload</div>
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
          </div>
          <div className={styles.detailsCol}>
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
            />
            <div className={styles.footer}>
              <button
                className={styles.emojiBtn}
                tabIndex={-1}
                type="button"
                aria-label="Emoji"
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
    </div>
  );
};

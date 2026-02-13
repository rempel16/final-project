import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import styles from "./OverlayPanel.module.scss";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
  ariaLabel?: string;
};

const SCROLL_LOCK_CLASS = "overlay-scroll-lock";
const TRANSITION_MS = 220;

export const OverlayPanel = ({
  open,
  onClose,
  children,
  panelClassName,
  ariaLabel,
}: Props) => {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      const raf = window.requestAnimationFrame(() => {
        setMounted(true);
        setVisible(true);
      });
      return () => window.cancelAnimationFrame(raf);
    }

    const raf = window.requestAnimationFrame(() => setVisible(false));
    const timer = window.setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    document.documentElement.classList.add(SCROLL_LOCK_CLASS);
    document.body.classList.add(SCROLL_LOCK_CLASS);

    return () => {
      document.documentElement.classList.remove(SCROLL_LOCK_CLASS);
      document.body.classList.remove(SCROLL_LOCK_CLASS);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={[styles.root, visible ? styles.open : styles.closed].join(" ")}
    >
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close overlay"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={[styles.panel, panelClassName ?? ""].join(" ")}
      >
        {children}
      </div>
    </div>
  );
};

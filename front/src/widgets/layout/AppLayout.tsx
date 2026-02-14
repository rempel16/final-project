import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { IconButton, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router-dom";

import { FooterNav } from "../navigation/FooterNav/FooterNav";
import { SidebarMenu } from "../navigation/SidebarMenu/SidebarMenu";
import { SearchPanel } from "../search/SearchPanel";
import {
  NotificationsDrawer,
  type NotificationsDrawerSection,
} from "../notification/NotificationsDrawer";
import { notificationsMock as mockNotifications } from "../notification/mock/notifications.mock";

import { PostModal } from "@/entities/post/ui/PostModal/PostModal";
import { usePostModal } from "../../features/postModal/model/usePostModal";
import styles from "./AppLayout.module.scss";

type Props = {
  children: ReactNode;
};

export const AppLayout = ({ children }: Props) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isDesktop = useMediaQuery("(min-width:900px)");
  const isSearchOpen = location.pathname.startsWith("/search");
  const isNotificationsOpen = location.pathname.startsWith("/notifications");
  const isOverlayOpen = isSearchOpen || isNotificationsOpen;

  const {
    activePostId,
    open: openPostModal,
    close: closePostModal,
  } = usePostModal();

  // Запоминаем, где был пользователь ДО открытия оверлея (/search или /notifications)
  const lastNonOverlayPathRef = useRef<string>("/");
  useEffect(() => {
    if (!isOverlayOpen) {
      lastNonOverlayPathRef.current = location.pathname + location.search;
    }
  }, [isOverlayOpen, location.pathname, location.search]);

  // На десктопе при открытом оверлее НЕ рендерим страницу оверлея,
  // а оставляем "фон" (последнюю не-оверлей страницу)
  const [desktopBackground, setDesktopBackground] =
    useState<ReactNode>(children);

  useEffect(() => {
    if (!isDesktop) return;
    if (!isOverlayOpen) {
      const raf = window.requestAnimationFrame(() =>
        setDesktopBackground(children),
      );
      return () => window.cancelAnimationFrame(raf);
    }
  }, [children, isDesktop, isOverlayOpen]);

  const mainContent = useMemo(() => {
    if (isDesktop && isOverlayOpen) return desktopBackground;
    return children;
  }, [children, desktopBackground, isDesktop, isOverlayOpen]);

  const handleOverlayClose = () => {
    const backTo = lastNonOverlayPathRef.current || "/";
    navigate(backTo);
  };

  const isDimmed = isDesktop && isOverlayOpen;

  // Моки -> секции для NotificationsDrawer
  const notificationSections: NotificationsDrawerSection[] = useMemo(() => {
    const toTime = (iso: string) => {
      const d = new Date(iso);
      const days = Math.floor(
        (Date.now() - d.getTime()) / (24 * 60 * 60 * 1000),
      );
      if (days <= 0) return "today";
      if (days === 1) return "1d";
      if (days < 7) return `${days}d`;
      const weeks = Math.floor(days / 7);
      return weeks === 1 ? "1w" : `${weeks}w`;
    };

    const labelByType: Record<string, string> = {
      like: "Likes",
      comment: "Comments",
      follow: "Follows",
    };

    const makeContent = (type: string) => {
      if (type === "like") return <> liked your post</>;
      if (type === "comment") return <> commented on your post</>;
      return <> started following you</>;
    };

    const grouped = new Map<string, any[]>();
    for (const n of mockNotifications as any[]) {
      const arr = grouped.get(n.type) ?? [];
      arr.push(n);
      grouped.set(n.type, arr);
    }

    return (["like", "comment", "follow"] as const)
      .filter((t) => grouped.has(t))
      .map((type) => ({
        label: labelByType[type],
        items: (grouped.get(type) ?? []).map((n) => ({
          id: String(n._id ?? n.id),
          avatar: (
            <img
              src={n.fromUser?.avatar || "/avatars/default.jpg"}
              alt={n.fromUser?.username || "user"}
              width={32}
              height={32}
              style={{ borderRadius: "50%", objectFit: "cover" }}
              draggable={false}
            />
          ),
          username: String(n.fromUser?.username ?? "unknown"),
          content: makeContent(n.type),
          time: toTime(String(n.createdAt ?? new Date().toISOString())),
          postPreview: n.post?.image ? (
            <img
              src={n.post.image}
              alt=""
              width={44}
              height={44}
              style={{ borderRadius: 10, objectFit: "cover" }}
              draggable={false}
            />
          ) : undefined,
          onClick: () => {
            if (n.type === "follow") {
              const id = n.fromUser?._id ?? n.fromUser?.id;
              if (id) navigate(`/profile/${id}`);
              return;
            }
            const postId = n.post?._id ?? n.post?.id;
            if (postId) openPostModal(String(postId));
          },
        })),
      }));
  }, [navigate, openPostModal]);

  return (
    <div className={styles.root}>
      <SidebarMenu
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {isDesktop && isOverlayOpen ? (
        <div className={styles.searchSpacer} />
      ) : null}

      {isDesktop ? (
        <SearchPanel open={isSearchOpen} onClose={handleOverlayClose} />
      ) : null}

      <NotificationsDrawer
        open={isNotificationsOpen}
        onClose={handleOverlayClose}
        sections={notificationSections}
      />

      {isDimmed ? (
        <div
          className={styles.pageOverlay}
          onClick={handleOverlayClose}
          aria-hidden="true"
        />
      ) : null}

      <main className={styles.main}>
        <div className={styles.mobileTopBar}>
          <IconButton
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <img
            src="/logo.png"
            alt="ICHgram"
            className={styles.mobileLogo}
            draggable={false}
          />
        </div>

        <div className={styles.content}>{mainContent}</div>

        <FooterNav />
      </main>

      {activePostId ? (
        <PostModal postId={activePostId} onClose={closePostModal} />
      ) : null}
    </div>
  );
};

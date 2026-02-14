import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { IconButton, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router-dom";

import { FooterNav } from "../navigation/FooterNav/FooterNav";
import { SidebarMenu } from "../navigation/SidebarMenu/SidebarMenu";
import { SearchPanel } from "../search/SearchPanel";
import { NotificationsDrawerContainer } from "../notification/NotificationsDrawerContainer";
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

  const { activePostId, close: closePostModal } = usePostModal();

  
  const lastNonOverlayPathRef = useRef<string>("/");
  useEffect(() => {
    if (!isOverlayOpen) {
      lastNonOverlayPathRef.current = location.pathname + location.search;
    }
  }, [isOverlayOpen, location.pathname, location.search]);

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

      <NotificationsDrawerContainer
        open={isNotificationsOpen}
        onClose={handleOverlayClose}
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

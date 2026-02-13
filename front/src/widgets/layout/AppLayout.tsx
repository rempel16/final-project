import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { IconButton, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router-dom";

import { FooterNav } from "../navigation/FooterNav/FooterNav";
import { SidebarMenu } from "../navigation/SidebarMenu/SidebarMenu";
import { SearchPanel } from "../search/SearchPanel";
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

  const { activePostId, close: closePostModal } = usePostModal();

  // Запоминаем, где был пользователь ДО открытия поиска
  const lastNonSearchPathRef = useRef<string>("/");
  useEffect(() => {
    if (!isSearchOpen) {
      lastNonSearchPathRef.current = location.pathname + location.search;
    }
  }, [isSearchOpen, location.pathname, location.search]);

  // На десктопе при открытом /search НЕ рендерим SearchPage,
  // а оставляем "фон" (последнюю не-search страницу)
  const [desktopBackground, setDesktopBackground] =
    useState<ReactNode>(children);
  useEffect(() => {
    if (!isDesktop) return;
    if (!isSearchOpen) {
      const raf = window.requestAnimationFrame(() =>
        setDesktopBackground(children),
      );
      return () => window.cancelAnimationFrame(raf);
    }
  }, [children, isDesktop, isSearchOpen]);

  const mainContent = useMemo(() => {
    if (isDesktop && isSearchOpen) return desktopBackground;
    return children;
  }, [children, desktopBackground, isDesktop, isSearchOpen]);

  const handleSearchClose = () => {
    const backTo = lastNonSearchPathRef.current || "/";
    navigate(backTo);
  };

  const isDimmed = isDesktop && isSearchOpen;

  return (
    <div className={styles.root}>
      <SidebarMenu
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {isDesktop && isSearchOpen ? (
        <div className={styles.searchSpacer} />
      ) : null}

      {isDesktop ? (
        <SearchPanel open={isSearchOpen} onClose={handleSearchClose} />
      ) : null}

      {isDimmed ? (
        <div
          className={styles.pageOverlay}
          onClick={handleSearchClose}
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

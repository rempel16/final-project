import type { ReactNode } from "react";
import { useState } from "react";
import { IconButton } from "@mui/material";
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

  const isSearchOpen = location.pathname.startsWith("/search");
  const { activePostId, close: closePostModal } = usePostModal();

  return (
    <div className={styles.root}>
      <SidebarMenu
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {isSearchOpen ? <div className={styles.searchSpacer} /> : null}
      <SearchPanel open={isSearchOpen} onClose={() => navigate("/")} />

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

        <div className={styles.content}>{children}</div>

        <FooterNav />
      </main>

      {activePostId ? (
        <PostModal postId={activePostId} onClose={closePostModal} />
      ) : null}
    </div>
  );
};

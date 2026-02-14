import {
  Avatar,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import { Drawer } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { userApi, type UserProfile } from "@/entities/user/api";
import { NAV_ITEMS, PROFILE_NAV_ITEM } from "@/shared/config/navigation";
import styles from "./SidebarMenu.module.scss";

type Props = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

const getActiveTo = (pathname: string) => {
  const active = NAV_ITEMS.find((item) => item.isActive?.(pathname));
  return active?.to ?? pathname;
};

export const SidebarMenu = ({ mobileOpen, onMobileClose }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [me, setMe] = useState<UserProfile | null>(null);

  useEffect(() => {
    let alive = true;

    userApi
      .getMe()
      .then((data) => {
        if (alive) setMe(data);
      })
      .catch(() => {
        if (alive) setMe(null);
      });

    return () => {
      alive = false;
    };
  }, []);

  const activeTo = getActiveTo(location.pathname);
  const profileSelected =
    PROFILE_NAV_ITEM.isActive?.(location.pathname) ?? false;

  const handleNavigate = (to: string) => {
    if (to === "/create") {
      navigate(to, { state: { backgroundLocation: location } });
    } else {
      navigate(to);
    }
    onMobileClose();
  };

  const navContent = (
    <div className={styles.content}>
      <div className={styles.header}>
        <img
          className={styles.logo}
          src="/logo.png"
          alt="ICHgram"
          draggable={false}
        />
      </div>

      <Divider />

      <List className={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const selected = activeTo === item.to;

          return (
            <ListItemButton
              key={item.to}
              selected={selected}
              disabled={item.disabled}
              onClick={() => handleNavigate(item.to)}
              className={styles.navItem}
            >
              <ListItemIcon className={styles.navIcon}>
                <img className={styles.navIconImg} src={item.iconSrc} alt="" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ className: styles.navItemText }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <div className={styles.profileWrap}>
        <Divider />
        <List className={styles.profileList}>
          <ListItemButton
            selected={profileSelected}
            onClick={() => handleNavigate(PROFILE_NAV_ITEM.to)}
            className={styles.navItem}
          >
            <ListItemIcon className={styles.navIcon}>
              <Avatar
                className={styles.profileAvatar}
                src={me?.avatarUrl ?? undefined}
              />
            </ListItemIcon>
            <ListItemText
              primary={PROFILE_NAV_ITEM.label}
              primaryTypographyProps={{ className: styles.navItemText }}
            />
          </ListItemButton>
        </List>
      </div>

      <div className={styles.logout}>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            window.location.replace("/login");
          }}
          className={styles.logoutItem}
        >
          <span className={styles.logoutIcon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M16 17L21 12M21 12L16 7M21 12H9M13 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44772 3 5 3H13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className={styles.navItemText}>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.desktopRoot}>
        <Paper elevation={0} className={styles.desktopPaper}>
          {navContent}
        </Paper>
      </div>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ className: styles.mobileDrawerPaper }}
      >
        {navContent}
      </Drawer>
    </>
  );
};

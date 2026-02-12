import {
  Avatar,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import Drawer from "@mui/material/Drawer";
import { useLocation, useNavigate } from "react-router-dom";

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
              <Avatar className={styles.profileAvatar}>ME</Avatar>
            </ListItemIcon>
            <ListItemText
              primary={PROFILE_NAV_ITEM.label}
              primaryTypographyProps={{ className: styles.navItemText }}
            />
          </ListItemButton>
        </List>
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

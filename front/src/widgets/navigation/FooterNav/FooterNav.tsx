import { Link, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { NAV_ITEMS } from "@/shared/config/navigation";
import styles from "./FooterNav.module.scss";

const getActiveTo = (pathname: string) => {
  const active = NAV_ITEMS.find((item) => item.isActive?.(pathname));
  return active?.to ?? pathname;
};

export const FooterNav = () => {
  const location = useLocation();
  const activeTo = getActiveTo(location.pathname);

  const year = new Date().getFullYear();

  return (
    <footer className={styles.root}>
      <div className={styles.links}>
        {NAV_ITEMS.map((item) =>
          item.disabled ? (
            <Typography key={item.to} className={styles.disabledLink}>
              {item.label}
            </Typography>
          ) : (
            <Link
              key={item.to}
              component={RouterLink}
              to={item.to}
              state={
                item.to === "/create"
                  ? { backgroundLocation: location }
                  : undefined
              }
              underline="none"
              className={[
                styles.link,
                activeTo === item.to ? styles.linkActive : "",
              ].join(" ")}
              aria-current={activeTo === item.to ? "page" : undefined}
            >
              {item.label}
            </Link>
          ),
        )}
      </div>

      <Typography className={styles.copyright}>© {year} ICHgram</Typography>
    </footer>
  );
};

import { Box, Typography } from "@mui/material";
import styles from "./NotFoundPage.module.scss";

export const NotFoundPage = () => {
  return (
    <Box className={styles.root}>
      <Box className={styles.content}>
        <Box className={styles.illustration} aria-hidden="true">
          <img className={styles.phoneImage} src="/Login.png" alt="Login preview"/>
        </Box>

        <Box className={styles.text}>
          <Typography className={styles.title}>
            Oops! Page Not Found (404 Error)
          </Typography>

          <Typography className={styles.subtitle}>
            We&apos;re sorry, but the page you&apos;re looking for doesn&apos;t
            seem to exist.
            <br />
            If you typed the URL manually, please double-check the spelling.
            <br />
            If you clicked on a link, it may be outdated or broken.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

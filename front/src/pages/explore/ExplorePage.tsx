import { Container, Typography } from "@mui/material";

import { PageState } from "../../shared/ui/PageState/PageState";
import styles from "./ExplorePage.module.scss";

export const ExplorePage = () => {
  return (
    <Container className={styles.root}>
      <Typography className={styles.title}>Explore</Typography>
      <PageState kind="empty" />
    </Container>
  );
};

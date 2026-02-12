import { Container, Typography } from "@mui/material";

import { PageState } from "../../shared/ui/PageState/PageState";
import styles from "./CreatePostPage.module.scss";

export const CreatePostPage = () => {
  return (
    <Container className={styles.root}>
      <Typography className={styles.title}>Create post</Typography>
      <PageState kind="empty" />
    </Container>
  );
};

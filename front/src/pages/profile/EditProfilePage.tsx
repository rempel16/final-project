import { Container, Typography } from "@mui/material";

import { PageState } from "../../shared/ui/PageState/PageState";
import styles from "./EditProfilePage.module.scss";

export const EditProfilePage = () => {
  return (
    <Container className={styles.root}>
      <Typography className={styles.title}>Edit profile</Typography>
      <PageState kind="empty" />
    </Container>
  );
};

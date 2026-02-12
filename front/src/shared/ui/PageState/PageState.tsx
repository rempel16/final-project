import { Button, CircularProgress, Paper, Typography } from "@mui/material";

import styles from "./PageState.module.scss";

type BaseProps = {
  title?: string;
  description?: string;
};

type LoadingProps = BaseProps & {
  kind: "loading";
};

type EmptyProps = BaseProps & {
  kind: "empty";
};

type ErrorProps = BaseProps & {
  kind: "error";
  onRetry?: () => void;
  retryText?: string;
};

export type PageStateProps = LoadingProps | EmptyProps | ErrorProps;

export const PageState = (props: PageStateProps) => {
  const title =
    props.title ??
    (props.kind === "loading"
      ? "Loading…"
      : props.kind === "empty"
        ? "Nothing here yet"
        : "Something went wrong");

  const description =
    props.description ??
    (props.kind === "loading"
      ? "Please wait."
      : props.kind === "empty"
        ? "Try again later."
        : "Please try again.");

  return (
    <div className={styles.root}>
      <Paper variant="outlined" className={styles.card}>
        {props.kind === "loading" ? <CircularProgress /> : null}

        <Typography className={styles.title}>{title}</Typography>
        <Typography className={styles.description}>{description}</Typography>

        {props.kind === "error" && props.onRetry ? (
          <div className={styles.actions}>
            <Button variant="contained" onClick={props.onRetry}>
              {props.retryText ?? "Retry"}
            </Button>
          </div>
        ) : null}
      </Paper>
    </div>
  );
};


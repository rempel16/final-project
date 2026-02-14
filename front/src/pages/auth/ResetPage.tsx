import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { userApi } from "@/entities/user/api";
import { AuthLayout } from "./AuthLayout";
import styles from "./auth.module.scss";

export const ResetPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorText(null);
    setSuccessText(null);

    if (!identifier.trim()) {
      setErrorText("Enter your email or username");
      return;
    }

    setIsLoading(true);
    try {
      const res = await userApi.reset({
        identifier: identifier.trim(),
      });
      setSuccessText(res.message ?? "Reset link sent");
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to send reset link. Please try again.";
      setErrorText(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Stack spacing={2} className={styles.formStack}>
        <Paper variant="outlined" className={styles.card}>
          <Box
            component="img"
            src="/logo.png"
            alt="Logo"
            className={styles.logo}
          />

          <Typography className={styles.title}>Trouble logging in?</Typography>
          <Typography className={styles.description}>
            Enter your email or username and we&apos;ll send you a link to get
            back into your account.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            className={styles.formWrap}
          >
            <Stack spacing={1.5}>
              <TextField
                placeholder="Email or username"
                fullWidth
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                error={Boolean(errorText)}
                helperText={errorText ?? successText ?? " "}
                className={styles.input}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                className={styles.button}
              >
                Reset
              </Button>
            </Stack>
          </Box>
        </Paper>

        <Paper variant="outlined" className={styles.bottomCard}>
          <Link
            component={RouterLink}
            to="/login"
            underline="none"
            className={`${styles.linkPrimary} ${styles.linkStrong}`}
          >
            Back to login
          </Link>
        </Paper>
      </Stack>
    </AuthLayout>
  );
};

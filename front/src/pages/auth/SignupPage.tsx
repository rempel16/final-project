import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useAuth } from "@/app/providers/authContext";
import { userApi } from "@/entities/user/api";
import { AuthLayout } from "./AuthLayout";
import styles from "./auth.module.scss";

export const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    fullName?: string;
    username?: string;
    password?: string;
    server?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: typeof errors = {};
    if (!email.trim()) nextErrors.email = "Enter email";
    if (!fullName.trim()) nextErrors.fullName = "Enter full name";
    if (!username.trim()) nextErrors.username = "Enter username";
    if (!password.trim()) nextErrors.password = "Enter password";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      const { token } = await userApi.signup({
        email: email.trim(),
        password: password.trim(),
        username: username.trim(),
        name: fullName.trim(),
      });
      login(token);
      navigate("/", { replace: true });
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to sign up. Please try again.";

      if (status === 409) {
        setErrors({ username: "Username already taken" });
      } else {
        setErrors({ server: message });
      }
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

          <Box
            component="form"
            onSubmit={handleSubmit}
            className={styles.formWrap}
          >
            <Stack spacing={1.5}>
              <TextField
                placeholder="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email ?? " "}
                className={styles.input}
              />
              <TextField
                placeholder="Full name"
                fullWidth
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={Boolean(errors.fullName)}
                helperText={errors.fullName ?? " "}
                className={styles.input}
              />
              <TextField
                placeholder="Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={Boolean(errors.username)}
                helperText={errors.username ?? " "}
                className={styles.input}
              />
              <TextField
                placeholder="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(errors.password || errors.server)}
                helperText={errors.password ?? errors.server ?? " "}
                className={styles.input}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                className={styles.button}
              >
                Sign up
              </Button>
            </Stack>
          </Box>
        </Paper>

        <Paper variant="outlined" className={styles.bottomCard}>
          <Typography className={styles.bottomCardText}>
            Have an account?{" "}
            <Link
              component={RouterLink}
              to="/login"
              underline="none"
              className={`${styles.linkPrimary} ${styles.linkStrong}`}
            >
              Log in
            </Link>
          </Typography>
        </Paper>
      </Stack>
    </AuthLayout>
  );
};

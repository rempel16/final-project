import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
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

import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    emailOrUsername?: string;
    password?: string;
    server?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: typeof errors = {};
    if (!emailOrUsername.trim())
      nextErrors.emailOrUsername = "Enter email or username";
    if (!password.trim()) nextErrors.password = "Enter password";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      const { token } = await userApi.login({
        email: emailOrUsername.trim(),
        password: password.trim(),
      });
      login(token);
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to log in. Please try again.";
      setErrors({ server: message });
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
                placeholder="Email or username"
                fullWidth
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                error={Boolean(errors.emailOrUsername)}
                helperText={errors.emailOrUsername ?? " "}
                className={styles.input}
              />
              <TextField
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(errors.password || errors.server)}
                helperText={errors.password ?? errors.server ?? " "}
                className={styles.input}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffOutlinedIcon />
                        ) : (
                          <VisibilityOutlinedIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                className={styles.button}
              >
                Log in
              </Button>
            </Stack>
          </Box>

          <Box className={styles.dividerWrap}>
            <Divider className={styles.dividerLine} />
            <Typography className={styles.orText}>OR</Typography>
            <Divider className={styles.dividerLine} />
          </Box>

          <Typography className={styles.links}>
            <Link
              component={RouterLink}
              to="/reset"
              underline="none"
              className={styles.linkPrimary}
            >
              Forgot password?
            </Link>
          </Typography>
        </Paper>

        <Paper variant="outlined" className={styles.bottomCard}>
          <Typography className={styles.bottomCardText}>
            Don&apos;t have an account?{" "}
            <Link
              component={RouterLink}
              to="/signup"
              underline="none"
              className={`${styles.linkPrimary} ${styles.linkStrong}`}
            >
              Sign up
            </Link>
          </Typography>
        </Paper>
      </Stack>
    </AuthLayout>
  );
};

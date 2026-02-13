import type { FC, ReactNode } from "react";
import { Avatar, Box, Typography } from "@mui/material";
import styles from "./UserRow.module.scss";

export type UserRowProps = {
  avatarUrl?: string | null;
  username: string;
  subtitle?: string; 
  rightSlot?: ReactNode; 
  onUserClick?: () => void;
  size?: "sm" | "md" | "lg";
  align?: "center" | "top";
};

export const UserRow: FC<UserRowProps> = ({
  avatarUrl,
  username,
  subtitle,
  rightSlot,
  onUserClick,
  size = "md",
  align = "center",
}) => {
  return (
    <Box
      className={`${styles.root} ${styles[size]} ${
        align === "top" ? styles.alignTop : ""
      }`}
    >
      <button
        type="button"
        className={styles.userButton}
        onClick={onUserClick}
        disabled={!onUserClick}
      >
        <Avatar
          src={avatarUrl ?? undefined}
          alt={username}
          className={styles.avatar}
        />

        <Box className={styles.text}>
          <Typography component="span" className={styles.username}>
            {username}
          </Typography>

          {subtitle ? (
            <Typography component="span" className={styles.subtitle}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </button>

      {rightSlot ? <Box className={styles.right}>{rightSlot}</Box> : null}
    </Box>
  );
};

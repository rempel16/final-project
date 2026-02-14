import { Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

import { StoryRingAvatar } from "@/shared/ui/StoryRingAvatar/StoryRingAvatar";

import styles from "./UserLink.module.scss";

export type UserLike = {
  id?: string;
  username?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
};

type Props = {
  user: UserLike;

  variant?: "compact" | "default" | "profileHeader";

  subtitle?: string;
  showFollowButton?: boolean;

  actions?: React.ReactNode;

  to?: string;
  className?: string;

  onFollowClick?: () => void;
  followLabel?: string;
};

export const UserLink = ({
  user,
  variant = "default",
  subtitle,
  showFollowButton,
  actions,
  to,

  className,
  onFollowClick,
  followLabel = "Follow",
}: Props) => {
  const profileKey = user.id ?? user.username ?? "";
  const href = to ?? `/profile/${profileKey}`;

  const initials = (
    user.username?.slice(0, 1) ||
    user.name?.slice(0, 1) ||
    "?"
  ).toUpperCase();

  return (
    <div className={`${styles.root} ${styles[variant]} ${className ?? ""}`}>
      <Link to={href} className={styles.link}>
        <StoryRingAvatar
          src={user.avatarUrl ?? undefined}
          className={styles.avatar}
        >
          {initials}
        </StoryRingAvatar>

        <span className={styles.text}>
          <Typography className={styles.username}>
            {user.username ?? user.name ?? "unknown"}
          </Typography>

          {subtitle ? (
            <Typography className={styles.subtitle}>{subtitle}</Typography>
          ) : null}
        </span>
      </Link>

      {actions ? <div className={styles.actions}>{actions}</div> : null}

      {showFollowButton ? (
        <Button
          type="button"
          variant="text"
          className={styles.followBtn}
          onClick={onFollowClick}
        >
          {followLabel}
        </Button>
      ) : null}
    </div>
  );
};

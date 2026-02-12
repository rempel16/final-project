import { Avatar, type AvatarProps } from "@mui/material";

import styles from "./StoryRingAvatar.module.scss";

type Props = AvatarProps & {
  className?: string;
  ringClassName?: string;
};

export const StoryRingAvatar = ({
  className,
  ringClassName,
  ...avatarProps
}: Props) => {
  return (
    <span className={`${styles.ring} ${ringClassName ?? ""}`}>
      <Avatar
        {...avatarProps}
        className={`${styles.avatar} ${className ?? ""}`}
      />
    </span>
  );
};
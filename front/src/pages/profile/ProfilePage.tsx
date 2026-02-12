import { useEffect, useMemo, useState } from "react";
import { Avatar, Box, Button, Container, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import type { Post } from "@/entities/post/model/types";
import { postApi } from "@/entities/post/api/postApi";
import { followApi } from "@/entities/follow/api/followApi";
import { userApi, type UserProfile } from "@/entities/user/api";
import { usePostModal } from "../../features/postModal/model/usePostModal";
import { getMeId } from "@/shared/lib/me";
import { PageState } from "@/shared/ui/PageState/PageState";
import styles from "./ProfilePage.module.scss";

const getErrorMessage = (err: unknown) =>
  (err as { message?: string })?.message ?? "Something went wrong";

export const ProfilePage = () => {
  const params = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { open } = usePostModal();

  const meId = useMemo(() => getMeId(), []);
  const rawUserId = params.userId;
  const userId = rawUserId === "me" ? meId : rawUserId;

  const isMyProfile = Boolean(userId && userId === meId);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setProfileLoading(true);
    setProfileError(null);
    setProfile(null);

    setPostsLoading(true);
    setPostsError(null);
    setPosts([]);

    (async () => {
      const [profileRes, postsRes] = await Promise.allSettled([
        userApi.getProfile(userId),
        postApi.getByUserId(userId),
      ]);
      if (cancelled) return;

      if (profileRes.status === "fulfilled") {
        setProfile(profileRes.value);
      } else {
        setProfileError(getErrorMessage(profileRes.reason));
      }

      if (postsRes.status === "fulfilled") {
        setPosts(postsRes.value);
      } else {
        setPostsError(getErrorMessage(postsRes.reason));
      }

      setProfileLoading(false);
      setPostsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, userId]);

  useEffect(() => {
    if (!userId || postsError) return;
    return postApi.subscribe((feed) => {
      setPosts(feed.filter((p) => p.author.id === userId));
    });
  }, [postsError, userId]);

  useEffect(() => {
    if (!userId || isMyProfile) return;
    let cancelled = false;

    (async () => {
      try {
        const following = await followApi.isFollowing(userId);
        if (!cancelled) setIsFollowing(following);
      } catch {
        if (!cancelled) setIsFollowing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isMyProfile, userId]);

  const handleToggleFollow = async () => {
    if (!userId || isMyProfile) return;
    setFollowLoading(true);
    try {
      if (isFollowing) await followApi.unfollow(userId);
      else await followApi.follow(userId);
      setIsFollowing((v) => !v);
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <Container className={styles.root}>
      {profileLoading ? (
        <PageState kind="loading" />
      ) : profileError ? (
        <PageState
          kind="error"
          description={profileError}
          onRetry={() => setReloadKey((v) => v + 1)}
        />
      ) : !userId ? (
        <PageState kind="error" description="Missing userId" />
      ) : !profile ? (
        <PageState kind="empty" title="User not found" />
      ) : (
        <>
          <Box className={styles.header}>
            <Avatar
              src={profile.avatarUrl ?? undefined}
              className={styles.avatar}
            >
              {profile.username.slice(0, 1).toUpperCase()}
            </Avatar>

            <Box className={styles.headerMain}>
              <Box className={styles.usernameRow}>
                <Typography className={styles.username}>
                  {profile.username}
                </Typography>

                <Box className={styles.actions}>
                  {isMyProfile ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate("/profile/edit")}
                    >
                      Edit profile
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant={isFollowing ? "outlined" : "contained"}
                      onClick={handleToggleFollow}
                      disabled={followLoading}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                  )}
                </Box>
              </Box>

              {profile.name ? (
                <Typography className={styles.name}>{profile.name}</Typography>
              ) : null}
              {profile.bio ? (
                <Typography className={styles.bio}>{profile.bio}</Typography>
              ) : null}
            </Box>
          </Box>

          <Typography className={styles.sectionTitle}>Posts</Typography>

          {postsLoading ? (
            <PageState kind="loading" />
          ) : postsError ? (
            <PageState
              kind="error"
              description={postsError}
              onRetry={() => setReloadKey((v) => v + 1)}
            />
          ) : posts.length === 0 ? (
            <Typography className={styles.empty}>No posts yet</Typography>
          ) : (
            <Box className={styles.grid}>
              {posts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  className={styles.postThumb}
                  onClick={() => open(post.id)}
                >
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.text}
                      className={styles.postThumbImg}
                    />
                  ) : (
                    <span className={styles.postThumbPlaceholder}>
                      No image
                    </span>
                  )}
                </button>
              ))}
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

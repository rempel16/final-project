import { useEffect, useMemo, useState } from "react";
import { Avatar, Box, Container, Typography } from "@mui/material";
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

  const postsCount = posts.length;

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
            <div className={styles.avatarWrap}>
              <Avatar
                src={profile.avatarUrl ?? undefined}
                className={styles.avatar}
              >
                {profile.username.slice(0, 1).toUpperCase()}
              </Avatar>
            </div>
            <div className={styles.info}>
              <div className={styles.topRow}>
                <span className={styles.username}>{profile.username}</span>
                <div className={styles.actions}>
                  {isMyProfile ? (
                    <button
                      className={`${styles.button} ${styles.buttonSecondary}`}
                      type="button"
                      onClick={() => navigate("/profile/edit")}
                    >
                      Edit profile
                    </button>
                  ) : (
                    <>
                      <button
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        type="button"
                        onClick={handleToggleFollow}
                        disabled={followLoading}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                      <button
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        type="button"
                        // TODO: add message logic
                        disabled={false}
                      >
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className={styles.stats}>
                <span>
                  <span className={styles.statValue}>{postsCount}</span>
                  <span className={styles.statLabel}> posts</span>
                </span>
                {/* TODO: add followers/following if needed */}
              </div>
              {profile.name && (
                <div className={styles.name}>{profile.name}</div>
              )}
              {profile.bio && <div className={styles.bio}>{profile.bio}</div>}
            </div>
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
                  aria-label={`Open post by ${post.author.username}`}
                >
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt=""
                      className={styles.postThumbImg}
                      loading="lazy"
                      draggable={false}
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

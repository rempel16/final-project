import { getMeId } from "../../../shared/lib/me";
import { mockPosts } from "../mock/posts.mock";
import type { Post, UserPreview } from "../model/types";

type PostRecord = {
  id: string;
  author: UserPreview;
  imageUrl: string;
  text: string;
  createdAt: string;
  likesCount: number;
  likedByMe: boolean;
};

type CommentRecord = {
  id: string;
  postId: string;
  author: UserPreview;
  text: string;
  createdAt: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toUserPreview = (author: {
  id: string;
  username: string;
  avatarUrl?: string | null;
}): UserPreview => ({
  id: author.id,
  username: author.username,
  avatarUrl: author.avatarUrl ?? null,
});

const legacyPosts = mockPosts;

let postsDb: PostRecord[] = legacyPosts.map((post) => ({
  id: post.id,
  author: toUserPreview(post.author),
  imageUrl: post.imageUrl,
  text: post.text,
  createdAt: post.createdAt,
  likesCount: post.likesCount,
  likedByMe: post.isLikedByMe,
}));

let commentsDb: CommentRecord[] = legacyPosts.flatMap((post) =>
  post.comments.map((c) => ({
    id: c.id,
    postId: post.id,
    author: toUserPreview(c.author),
    text: c.text,
    createdAt: c.createdAt,
  })),
);

const listeners = new Set<(posts: Post[]) => void>();

const getCommentsCount = (postId: string) =>
  commentsDb.reduce((acc, c) => (c.postId === postId ? acc + 1 : acc), 0);

const toPost = (record: PostRecord): Post => {
  const meId = getMeId();

  return {
    id: record.id,
    author: record.author,
    imageUrl: record.imageUrl,
    text: record.text,
    createdAt: record.createdAt,
    likesCount: record.likesCount,
    likedByMe: record.likedByMe,
    commentsCount: getCommentsCount(record.id),
    isMine: record.author.id === meId,
  };
};

const getPostRecord = (postId: string) => postsDb.find((p) => p.id === postId);

const getFeedSnapshot = (): Post[] => {
  const sorted = [...postsDb].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return sorted.map(toPost);
};

const notify = () => {
  const snapshot = getFeedSnapshot();
  for (const listener of listeners) listener(snapshot);
};

export const __postModalMockDb = {
  getMeId,

  getPostRecord,
  getCommentRecordsByPostId: (postId: string) =>
    commentsDb.filter((c) => c.postId === postId),
  getCommentRecordById: (commentId: string) =>
    commentsDb.find((c) => c.id === commentId),

  addCommentRecord: (record: CommentRecord) => {
    commentsDb = [...commentsDb, record];
    notify();
  },

  updateCommentText: (commentId: string, text: string) => {
    const nextText = text.trim();
    if (!nextText) throw new Error("Comment text is required");

    const idx = commentsDb.findIndex((c) => c.id === commentId);
    if (idx === -1) throw new Error("Comment not found");

    const updated = { ...commentsDb[idx], text: nextText };
    commentsDb = [
      ...commentsDb.slice(0, idx),
      updated,
      ...commentsDb.slice(idx + 1),
    ];
    notify();
    return updated;
  },

  deleteCommentRecord: (commentId: string) => {
    const exists = commentsDb.some((c) => c.id === commentId);
    if (!exists) return;

    commentsDb = commentsDb.filter((c) => c.id !== commentId);
    notify();
  },

  setPostLikedByMe: (postId: string, liked: boolean) => {
    const idx = postsDb.findIndex((p) => p.id === postId);
    if (idx === -1) throw new Error("Post not found");

    const current = postsDb[idx];
    if (current.likedByMe === liked) return;

    const delta = liked ? 1 : -1;
    const nextLikes = Math.max(0, current.likesCount + delta);
    postsDb = [
      ...postsDb.slice(0, idx),
      { ...current, likedByMe: liked, likesCount: nextLikes },
      ...postsDb.slice(idx + 1),
    ];
    notify();
  },

  deletePostRecord: (postId: string) => {
    postsDb = postsDb.filter((p) => p.id !== postId);
    commentsDb = commentsDb.filter((c) => c.postId !== postId);
    notify();
  },

  updatePostText: (postId: string, text: string) => {
    const nextText = text.trim();
    if (!nextText) throw new Error("Post text is required");
    if (nextText.length > 1200) throw new Error("Post text is too long");

    const idx = postsDb.findIndex((p) => p.id === postId);
    if (idx === -1) throw new Error("Post not found");

    const current = postsDb[idx];
    postsDb = [
      ...postsDb.slice(0, idx),
      { ...current, text: nextText },
      ...postsDb.slice(idx + 1),
    ];
    notify();
  },
};

export const postApi = {
  subscribe: (listener: (posts: Post[]) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getFeed: async (): Promise<Post[]> => {
    await sleep(250);
    return getFeedSnapshot();
  },

  getById: async (postId: string): Promise<Post | null> => {
    await sleep(250);
    const record = getPostRecord(postId);
    return record ? toPost(record) : null;
  },

  getFeedPage: async (
    page: number,
    pageSize: number,
  ): Promise<{ items: Post[]; total: number }> => {
    await sleep(250);

    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);

    const feed = getFeedSnapshot();
    const total = feed.length;

    const start = (safePage - 1) * safePageSize;
    const end = start + safePageSize;
    const items = feed.slice(start, end);

    return { items, total };
  },

  getByUserId: async (userId: string): Promise<Post[]> => {
    await sleep(250);
    if (userId === "error") throw new Error("Posts API error");
    return getFeedSnapshot().filter((p) => p.author.id === userId);
  },

  update: async (postId: string, payload: { text: string }): Promise<Post> => {
    await sleep(250);
    __postModalMockDb.updatePostText(postId, payload.text);
    const record = getPostRecord(postId);
    if (!record) throw new Error("Post not found");
    return toPost(record);
  },

  delete: async (postId: string): Promise<void> => {
    await sleep(250);
    __postModalMockDb.deletePostRecord(postId);
  },
};

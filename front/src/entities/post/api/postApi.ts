import { http } from "@/shared/api/http";
import { API } from "@/shared/api/endpoints";
import type { Post } from "../model/types";

// Light cache so PostModal can subscribe like before.
let feedCache: Post[] = [];
const listeners = new Set<(posts: Post[]) => void>();

const notify = () => {
  for (const l of listeners) l(feedCache);
};

const upsertInCache = (post: Post) => {
  const idx = feedCache.findIndex((p) => p.id === post.id);
  if (idx === -1) {
    feedCache = [post, ...feedCache];
  } else {
    feedCache = [...feedCache.slice(0, idx), post, ...feedCache.slice(idx + 1)];
  }

  feedCache = [...feedCache].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  notify();
};

const removeFromCache = (postId: string) => {
  const next = feedCache.filter((p) => p.id !== postId);
  if (next.length !== feedCache.length) {
    feedCache = next;
    notify();
  }
};

const is404 = (err: unknown) => {
  const e = err as { response?: { status?: number } };
  return e?.response?.status === 404;
};

export const postApi = {
  subscribe: (listener: (posts: Post[]) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener); // важно: cleanup должен возвращать void, не boolean
    };
  },

  getFeed: async (): Promise<Post[]> => {
    const { data } = await http.get<{ items: Post[]; total: number }>(
      API.posts.list,
      {
        params: { page: 1, limit: 30 },
      },
    );

    feedCache = data.items;
    notify();
    return data.items;
  },

  getFeedPage: async (
    page: number,
    pageSize: number,
  ): Promise<{ items: Post[]; total: number }> => {
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);

    const { data } = await http.get<{ items: Post[]; total: number }>(
      API.posts.list,
      {
        params: { page: safePage, limit: safePageSize },
      },
    );

    for (const p of data.items) upsertInCache(p);
    return data;
  },

  getById: async (postId: string): Promise<Post | null> => {
    try {
      const { data } = await http.get<Post>(API.posts.byId(postId));
      upsertInCache(data);
      return data;
    } catch (err: unknown) {
      if (is404(err)) return null;
      throw err;
    }
  },

  getByUserId: async (userId: string): Promise<Post[]> => {
    const { data } = await http.get<{ items: Post[]; total: number }>(
      API.posts.list,
      {
        params: { page: 1, limit: 30, userId },
      },
    );
    return data.items;
  },

  create: async (payload: {
    imageUrl: string;
    text: string;
  }): Promise<Post> => {
    const { data } = await http.post<Post>(API.posts.list, payload);
    upsertInCache(data);
    return data;
  },

  update: async (postId: string, payload: { text: string }): Promise<Post> => {
    const { data } = await http.patch<Post>(API.posts.byId(postId), payload);
    upsertInCache(data);
    return data;
  },

  delete: async (postId: string): Promise<void> => {
    await http.delete(API.posts.byId(postId));
    removeFromCache(postId);
  },
};

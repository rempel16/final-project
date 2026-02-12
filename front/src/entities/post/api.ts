import type { Post } from "./types";
import { mockPosts } from "./mock/posts.mock";

// Временно mock. Потом заменим на http.get(...)
export const postApi = {
  // Returns full feed (compat)
  getFeed: async (): Promise<Post[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPosts), 300);
    });
  },

  // Paginated feed: page - 1-based, pageSize - number
  getFeedPage: async (
    page: number,
    pageSize: number,
  ): Promise<{ items: Post[]; total: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Ensure newest posts first by createdAt DESC
        const sorted = [...mockPosts].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        const total = sorted.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const items = sorted.slice(start, end);

        resolve({ items, total });
      }, 300);
    });
  },
};

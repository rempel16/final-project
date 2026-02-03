import type { Post } from './types';
import { mockPosts } from './mock/posts.mock';

// Временно mock. Потом заменим на http.get(...)
export const postApi = {
  getFeed: async (): Promise<Post[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPosts), 300);
    });
  },
};

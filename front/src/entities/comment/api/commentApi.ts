import { http } from "@/shared/api/http";
import { API } from "@/shared/api/endpoints";
import type { Comment } from "../model/types";

export const commentApi = {
  getByPostId: (postId: string, params?: { limit?: number; offset?: number }) =>
    http
      .get<Comment[]>(API.posts.comments(postId), {
        params: { limit: params?.limit, offset: params?.offset },
      })
      .then((r) => r.data),

  create: (postId: string, text: string): Promise<Comment> =>
    http
      .post<Comment>(API.posts.comments(postId), { text })
      .then((r) => r.data),

  update: (postId: string, commentId: string, text: string): Promise<Comment> =>
    http
      .patch<Comment>(API.posts.commentById(postId, commentId), { text })
      .then((r) => r.data),

  delete: (postId: string, commentId: string): Promise<void> =>
    http.delete(API.posts.commentById(postId, commentId)).then(() => undefined),
};

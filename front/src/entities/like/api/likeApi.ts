import { http } from "@/shared/api/http";
import { API } from "@/shared/api/endpoints";
import { postApi } from "@/entities/post/api/postApi";

export const likeApi = {
  like: async (postId: string) => {
    await http.post(API.posts.like(postId), { liked: true });
    await postApi.getById(postId);
  },

  unlike: async (postId: string) => {
    await http.post(API.posts.like(postId), { liked: false });
    await postApi.getById(postId);
  },
};

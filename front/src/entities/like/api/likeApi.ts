import { __postModalMockDb } from "../../post/api/postApi";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const likeApi = {
  like: async (postId: string) => {
    await sleep(150);
    __postModalMockDb.setPostLikedByMe(postId, true);
  },

  unlike: async (postId: string) => {
    await sleep(150);
    __postModalMockDb.setPostLikedByMe(postId, false);
  },
};


import { http } from "@/shared/api/http";
import { API } from "@/shared/api/endpoints";

type MeDto = { followingIds?: string[] };

export const followApi = {
  isFollowing: async (userId: string): Promise<boolean> => {
    const { data } = await http.get<MeDto>(API.users.me);
    return Boolean(data.followingIds?.includes(userId));
  },

  follow: async (userId: string): Promise<void> => {
    await http.post(API.users.follow(userId));
  },

  unfollow: async (userId: string): Promise<void> => {
    await http.post(API.users.follow(userId));
  },
};

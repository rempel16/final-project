const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const followingByMe = new Set<string>();

export const followApi = {
  isFollowing: async (userId: string): Promise<boolean> => {
    await sleep(150);
    return followingByMe.has(userId);
  },

  follow: async (userId: string): Promise<void> => {
    await sleep(150);
    followingByMe.add(userId);
  },

  unfollow: async (userId: string): Promise<void> => {
    await sleep(150);
    followingByMe.delete(userId);
  },
};


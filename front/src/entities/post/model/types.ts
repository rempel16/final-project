export type UserPreview = {
  id: string;
  username: string;
  avatarUrl?: string | null;
};

export type Post = {
  id: string;
  author: UserPreview;
  imageUrl: string;
  text: string;
  createdAt: string; // ISO
  likesCount: number;
  likedByMe: boolean;
  commentsCount: number;
  isMine: boolean;
};


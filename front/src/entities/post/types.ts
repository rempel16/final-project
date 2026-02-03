export type UserPreview = {
  id: string;
  username: string;
  name?: string;
  avatarUrl?: string;
};

export type Comment = {
  id: string;
  author: UserPreview;
  text: string;
  createdAt: string;
};

export type Post = {
  id: string;
  imageUrl: string;
  text: string;
  createdAt: string;

  author: UserPreview;

  likesCount: number;
  isLikedByMe: boolean;

  comments: Comment[];
};

export type UserPreview = {
  id: string;
  username: string;
  avatarUrl?: string | null;
};

export type Comment = {
  id: string;
  postId: string;
  author: UserPreview;
  text: string;
  createdAt: string;
  isMine: boolean;
};


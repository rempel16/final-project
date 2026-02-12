import type { UserPreview } from "../../post/types";

export type MockUser = UserPreview & {
  bio?: string;
};

export const mockUsers: MockUser[] = [
  {
    id: "user-1",
    username: "alex",
    name: "Alex",
    avatarUrl: "/avatars/pexels-berlinerlights-27333764.jpg",
    bio: "Frontend dev. Coffee lover.",
  },
  {
    id: "user-2",
    username: "maria",
    name: "Maria",
    avatarUrl: "/avatars/pexels-cottonbro-10140276.jpg",
    bio: "Design, cats, and sunsets.",
  },
  {
    id: "user-3",
    username: "john",
    name: "John",
    avatarUrl: "/avatars/pexels-itamar-osorio-385495642-33663845.jpg",
    bio: "Traveling the world one photo at a time.",
  },
];

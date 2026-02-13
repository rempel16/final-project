// front/src/entities/user/mock/users.mock.ts
import type { UserPreview } from "../../post/types";

export type MockUser = UserPreview & {
  bio?: string;
  fullName?: string;
};

export const mockUsers: MockUser[] = [
  {
    id: "user-1",
    username: "alex",
    name: "Alex",
    fullName: "Alex",
    avatarUrl: "/avatars/pexels-berlinerlights-27333764.jpg",
    bio: "Frontend dev. Coffee lover.",
  },
  {
    id: "user-2",
    username: "maria",
    name: "Maria",
    fullName: "Maria",
    avatarUrl: "/avatars/pexels-cottonbro-10140276.jpg",
    bio: "Design, cats, and sunsets.",
  },
  {
    id: "user-3",
    username: "john",
    name: "John",
    fullName: "John",
    avatarUrl: "/avatars/pexels-itamar-osorio-385495642-33663845.jpg",
    bio: "Traveling the world one photo at a time.",
  },
  {
    id: "user-4",
    username: "kate",
    name: "Kate",
    fullName: "Kate",
    avatarUrl: "/avatars/pexels-lepta-studio-333887315-13958652.jpg",
    bio: "Minimalism and big city walks.",
  },
  {
    id: "user-5",
    username: "nina",
    name: "Nina",
    fullName: "Nina",
    avatarUrl: "/avatars/pexels-cottonbro-9142834.jpg",
    bio: "Photos, vibes, and late-night edits.",
  },
];

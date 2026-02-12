import { http } from "../../shared/api/http";
import { API } from "../../shared/api/endpoints";
import type { UserPreview } from "../post/types";
import { mockUsers } from "./mock/users.mock";

export type UserProfile = {
  id: string;
  username: string;
  name?: string;
  avatarUrl?: string | null;
  bio?: string | null;
};

export type AuthResponse = {
  token: string;
  user: { id: string; email: string; username: string; name?: string };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const userApi = {
  signup: (payload: {
    email: string;
    password: string;
    username: string;
    name?: string;
  }) => http.post<AuthResponse>(API.auth.signup, payload).then((r) => r.data),

  login: (payload: { email: string; password: string }) =>
    http.post<AuthResponse>(API.auth.login, payload).then((r) => r.data),

  reset: (payload: { identifier: string }) =>
    http.post<{ message: string }>(API.auth.reset, payload).then((r) => r.data),

  // Mock searchUsers: query by username or name (case-insensitive, contains)
  searchUsers: async (query: string): Promise<UserPreview[]> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (query === "error") {
          reject(new Error("API error"));
          return;
        }
        const q = query.trim().toLowerCase();
        if (!q) return resolve([]);
        resolve(
          mockUsers.filter(
            (u) =>
              u.username.toLowerCase().includes(q) ||
              (u.name && u.name.toLowerCase().includes(q)),
          ),
        );
      }, 300);
    });
  },

  // Mock getProfile: minimal data for ProfilePage
  getProfile: async (userId: string): Promise<UserProfile | null> => {
    await sleep(250);
    if (userId === "error") throw new Error("Profile API error");

    const found = mockUsers.find((u) => u.id === userId);
    if (!found) return null;

    return {
      id: found.id,
      username: found.username,
      name: found.name,
      avatarUrl: found.avatarUrl ?? null,
      bio: found.bio ?? null,
    };
  },
};

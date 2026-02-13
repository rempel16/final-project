import { http } from "@/shared/api/http";
import { API } from "@/shared/api/endpoints";
import type { UserPreview } from "../post/types";

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

const is404 = (err: unknown) => {
  const e = err as { response?: { status?: number } };
  return e?.response?.status === 404;
};

export const userApi = {
  signup: (payload: {
    email: string;
    password: string;
    username: string;
    name?: string;
  }) => http.post<AuthResponse>(API.auth.signup, payload).then((r) => r.data),

  login: (payload: { email: string; password: string }) =>
    http
      .post<AuthResponse>(API.auth.login, {
        identifier: payload.email,
        password: payload.password,
      })
      .then((r) => r.data),

  reset: (payload: { identifier: string }) =>
    http.post<{ message: string }>(API.auth.reset, payload).then((r) => r.data),

  getMe: () => http.get<UserProfile>(API.users.me).then((r) => r.data),

  updateMe: (payload: {
    name?: string;
    bio?: string;
    avatarUrl?: string | null;
  }) => http.patch<UserProfile>(API.users.me, payload).then((r) => r.data),

  searchUsers: (query: string): Promise<UserPreview[]> =>
    http
      .get<UserPreview[]>(API.users.search, { params: { q: query } })
      .then((r) => r.data),

  getProfile: (userId: string): Promise<UserProfile | null> =>
    http
      .get<UserProfile>(API.users.byId(userId))
      .then((r) => r.data)
      .catch((err: unknown) => {
        if (is404(err)) return null;
        throw err;
      }),

  followToggle: (userId: string) =>
    http
      .post<{ following: boolean }>(API.users.follow(userId))
      .then((r) => r.data),
};

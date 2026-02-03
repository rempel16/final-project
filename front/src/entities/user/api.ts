import { http } from '../../shared/api/http';
import { API } from '../../shared/api/endpoints';

export type AuthResponse = {
  token: string;
  user: { id: string; email: string; username: string; name?: string };
};

export const userApi = {
  signup: (payload: { email: string; password: string; username: string; name?: string }) =>
    http.post<AuthResponse>(API.auth.signup, payload).then((r) => r.data),

  login: (payload: { email: string; password: string }) =>
    http.post<AuthResponse>(API.auth.login, payload).then((r) => r.data),
};

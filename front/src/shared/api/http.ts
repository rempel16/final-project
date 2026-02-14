import axios from "axios";
import { tokenStorage } from "@/shared/lib/storage";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const http = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let didLogoutOn401 = false;

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url: string = err?.config?.url ?? "";

    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/signup") ||
      url.includes("/auth/reset");

    if (status === 401 && !isAuthRoute) {
      const hasToken = Boolean(tokenStorage.get());

      if (hasToken && !didLogoutOn401) {
        didLogoutOn401 = true;
        tokenStorage.remove();
        window.dispatchEvent(new Event("auth:logout"));
      }
    }

    if (tokenStorage.get()) didLogoutOn401 = false;

    return Promise.reject(err);
  },
);

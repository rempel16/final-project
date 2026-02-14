export const API = {
  auth: {
    signup: "/auth/signup",
    login: "/auth/login",
    reset: "/auth/reset",
  },

  users: {
    me: "/users/me",
    search: "/users/search",
    byId: (id: string) => `/users/${id}`,
    follow: (id: string) => `/users/${id}/follow`,
  },

  posts: {
    list: "/posts",
    byId: (id: string) => `/posts/${id}`,
    like: (id: string) => `/posts/${id}/like`,
    comments: (postId: string) => `/posts/${postId}/comments`,
    commentById: (postId: string, commentId: string) =>
      `/posts/${postId}/comments/${commentId}`,
  },
} as const;

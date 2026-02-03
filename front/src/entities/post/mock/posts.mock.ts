import type { Post } from '../types';

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    imageUrl: '/demo/posts/post-01.jpg',
    text: 'First demo post. Welcome to the app 👋',
    createdAt: '2026-02-01T10:12:00Z',
    author: {
      id: 'user-1',
      username: 'alex',
      name: 'Alex',
      avatarUrl: '/demo/avatars/user-01.jpg',
    },
    likesCount: 3,
    isLikedByMe: false,
    comments: [
      {
        id: 'c-1',
        text: 'Looks great!',
        createdAt: '2026-02-01T11:00:00Z',
        author: {
          id: 'user-2',
          username: 'maria',
          name: 'Maria',
          avatarUrl: '/demo/avatars/user-02.jpg',
        },
      },
    ],
  },
  {
    id: 'post-2',
    imageUrl: '/demo/posts/post-02.jpg',
    text: 'Another post for Explore grid ✨',
    createdAt: '2026-02-02T08:30:00Z',
    author: {
      id: 'user-3',
      username: 'john',
      name: 'John',
      avatarUrl: '/demo/avatars/user-03.jpg',
    },
    likesCount: 0,
    isLikedByMe: false,
    comments: [],
  },
];

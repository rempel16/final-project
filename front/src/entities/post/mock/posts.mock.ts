import type { Post } from '../types';

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    imageUrl: '/posts/pexels-artyusufpatel-35828709.jpg',
    text: 'First demo post. Welcome to the app 👋',
    createdAt: '2026-02-01T10:12:00Z',
    author: {
      id: 'user-1',
      username: 'alex',
      name: 'Alex',
      avatarUrl: '/avatars/pexels-berlinerlights-27333764.jpg',
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
          avatarUrl: '/avatars/pexels-cottonbro-10140276.jpg',
        },
      },
    ],
  },
  {
    id: 'post-2',
    imageUrl: '/posts/pexels-allen-boguslavsky-1344061-30526164.jpg',
    text: 'Another post for Explore grid ✨',
    createdAt: '2026-02-02T08:30:00Z',
    author: {
      id: 'user-3',
      username: 'john',
      name: 'John',
      avatarUrl: '/avatars/pexels-itamar-osorio-385495642-33663845.jpg',
    },
    likesCount: 0,
    isLikedByMe: false,
    comments: [],
  },
];

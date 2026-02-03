import { useEffect, useState } from 'react';
import type { Post } from '../../entities/post/types';
import { postApi } from '../../entities/post/api';

export const MainPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    postApi.getFeed().then(setPosts);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Main feed</h1>
      <pre>{JSON.stringify(posts, null, 2)}</pre>
    </div>
  );
};

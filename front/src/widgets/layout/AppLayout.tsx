import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  children: ReactNode;
};

export const AppLayout = ({ children }: Props) => {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '240px 1fr' }}>
      <aside style={{ padding: 16, borderRight: '1px solid rgba(255,255,255,0.12)' }}>
        <nav style={{ display: 'grid', gap: 8 }}>
          <Link to="/">Main</Link>
          <Link to="/search">Search</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/messages">Messages</Link>
          <Link to="/create">Create</Link>
          <Link to="/profile/me">Profile</Link>
        </nav>
      </aside>

      <main style={{ padding: 16 }}>{children}</main>
    </div>
  );
};

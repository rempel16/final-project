import { createBrowserRouter } from 'react-router-dom';

import { LoginPage } from '../../pages/auth/LoginPage';
import { SignupPage } from '../../pages/auth/SignupPage';

import { MainPage } from '../../pages/main/MainPage';
import { ExplorePage } from '../../pages/explore/ExplorePage';
import { SearchPage } from '../../pages/search/SearchPage';
import { CreatePostPage } from '../../pages/create/CreatePostPage';
import { ProfilePage } from '../../pages/profile/ProfilePage';
import { EditProfilePage } from '../../pages/profile/EditProfilePage';
import { MessagesPage } from '../../pages/messages/MessagesPage';

import { ProtectedLayout } from '../../widgets/layout/ProtectedLayout';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },

  {
    element: <ProtectedLayout />,
    children: [
      { path: '/', element: <MainPage /> },
      { path: '/explore', element: <ExplorePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/create', element: <CreatePostPage /> },
      { path: '/profile/:userId', element: <ProfilePage /> },
      { path: '/profile/edit', element: <EditProfilePage /> },
      { path: '/messages', element: <MessagesPage /> },
    ],
  },
]);

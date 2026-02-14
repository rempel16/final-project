import { createBrowserRouter } from "react-router-dom";

import { LoginPage } from "@/pages/auth/LoginPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { ResetPage } from "@/pages/auth/ResetPage";

import { MainPage } from "@/pages/main/MainPage";
import { ExplorePage } from "@/pages/explore/ExplorePage";
import { SearchPage } from "@/pages/search/SearchPage";
import { CreatePostPage } from "@/pages/create/CreatePostPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { EditProfilePage } from "@/pages/profile/EditProfilePage";
import { MessagesPage } from "@/pages/messages/MessagesPage";

import { ProtectedLayout } from "@/widgets/layout/ProtectedLayout";
import { RouteFallback } from "./RouteFallback";

import { NotFoundPage } from "@/pages/not-found/NotFoundPage";

const NotificationsRoute = () => null;

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/reset", element: <ResetPage /> },

  {
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <MainPage /> },
      { path: "/explore", element: <ExplorePage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/create", element: <CreatePostPage /> },
      { path: "/profile/:userId", element: <ProfilePage /> },
      { path: "/profile/edit", element: <EditProfilePage /> },
      { path: "/messages", element: <MessagesPage /> },
      { path: "/notifications", element: <NotificationsRoute /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },

  { path: "*", element: <RouteFallback /> },
]);

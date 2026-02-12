export type NavItem = {
  label: string;
  to: string;
  iconSrc: string;
  isActive?: (pathname: string) => boolean;
  disabled?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    to: "/",
    iconSrc: "/icon/Home.svg",
    isActive: (p) => p === "/",
  },
  {
    label: "Search",
    to: "/search",
    iconSrc: "/icon/Search.svg",
    isActive: (p) => p.startsWith("/search"),
  },
  {
    label: "Explore",
    to: "/explore",
    iconSrc: "/icon/Explore.svg",
    isActive: (p) => p.startsWith("/explore"),
  },
  {
    label: "Messages",
    to: "/messages",
    iconSrc: "/icon/Messages.svg",
    isActive: (p) => p.startsWith("/messages"),
  },
  {
    label: "Notifications",
    to: "/notifications",
    iconSrc: "/icon/Notifications.svg",
    isActive: (p) => p.startsWith("/notifications"),
    disabled: true,
  },
  {
    label: "Create",
    to: "/create",
    iconSrc: "/icon/Create.svg",
    isActive: (p) => p.startsWith("/create"),
  },
];

export const PROFILE_NAV_ITEM = {
  label: "Profile",
  to: "/profile/me",
  isActive: (p: string) => p.startsWith("/profile"),
};

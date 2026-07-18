export interface NavItem {
  label: string;
  path: string;
}

export const publicNavigation: NavItem[] = [
  {
    label: "Home",
    path: "/",
  },
];

export const userNavigation: NavItem[] = [
  {
    label: "Home",
    path: "/home",
  },
  {
    label: "Quiz",
    path: "/quiz",
  },
  {
    label: "History",
    path: "/history",
  },
];

export const adminNavigation: NavItem[] = [
  {
    label: "Dashboard",
    path: "/admin",
  },
  {
    label: "Questions",
    path: "/admin/questions",
  },
  {
    label: "Users",
    path: "/admin/users",
  },
  {
    label: "Results",
    path: "/admin/results",
  },
  {
    label: "Stats",
    path: "/admin/stats",
  },
];

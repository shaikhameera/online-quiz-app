import labels from "../config/labels.json";

export interface NavItem {
  label: string;
  path: string;
}

export const publicNavigation: NavItem[] = [
  {
    label: labels.app.navbar.home,
    path: "/",
  },
];

export const userNavigation: NavItem[] = [
  {
    label: labels.app.navbar.home,
    path: "/home",
  },
  {
    label: labels.app.navbar.quiz,
    path: "/quiz",
  },
  {
    label: labels.app.navbar.history,
    path: "/history",
  },
  {
    label: labels.app.navbar.profile,
    path: "/profile",
  },
];

export const adminNavigation: NavItem[] = [
  {
    label: labels.app.navbar.dashboard,
    path: "/admin",
  },
  {
    label: labels.app.navbar.questions,
    path: "/admin/questions",
  },
  {
    label: labels.app.navbar.users,
    path: "/admin/users",
  },
  {
    label: labels.app.navbar.results,
    path: "/admin/results",
  },
  {
    label: labels.app.navbar.stats,
    path: "/admin/stats",
  },
  {
    label: labels.app.navbar.profile,
    path: "/profile",
  },
];

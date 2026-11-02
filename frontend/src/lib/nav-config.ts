import type { NavIconName } from "@/components/dashboard/nav-icons";

export interface NavItem {
  label: string;
  href: string;
  icon: NavIconName;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

/** Sidebar navigation for the merchant dashboard. */
export const merchantNav: NavSection[] = [
  {
    items: [
      { label: "Overview", href: "/dashboard", icon: "dashboard" },
      {
        label: "Payment Accounts",
        href: "/dashboard/accounts",
        icon: "paymentAccounts",
      },
      { label: "Devices", href: "/dashboard/devices", icon: "devices" },
      {
        label: "Transactions",
        href: "/dashboard/transactions",
        icon: "transactions",
      },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Settings", href: "/dashboard/settings", icon: "settings" }],
  },
];

/** Sidebar navigation for the admin dashboard. */
export const adminNav: NavSection[] = [
  {
    items: [
      { label: "Overview", href: "/admin", icon: "dashboard" },
      { label: "Users", href: "/admin/users", icon: "users" },
      {
        label: "Transactions",
        href: "/admin/transactions",
        icon: "transactions",
      },
      { label: "Devices", href: "/admin/devices", icon: "devices" },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Settings", href: "/admin/settings", icon: "settings" }],
  },
];

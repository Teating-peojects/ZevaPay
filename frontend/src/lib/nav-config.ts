import type { NavIconName } from "@/components/dashboard/nav-icons";

export interface NavItem {
  label: string;
  href: string;
  icon: NavIconName;
  /**
   * How the page behind this link gets its data.
   *
   * - `live`   — the backend already covers it; the page calls the real API.
   * - `mock`   — the page reads the mock layer and carries a Demo badge.
   * - `planned` — the page does not exist yet. The link leads to a page that
   *   says so, rather than a 404.
   */
  source?: "live" | "mock" | "planned";
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

/**
 * Sidebar navigation for the merchant dashboard.
 *
 * The groups are the ones a merchant thinks in: what is happening now, what
 * money I am collecting, what runs by itself, what the business looks like,
 * and everything else.
 */
export const merchantNav: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Overview", href: "/dashboard", icon: "dashboard", source: "live" },
      {
        label: "Payments",
        href: "/dashboard/payments",
        icon: "payments",
        source: "mock",
      },
      {
        label: "Transactions",
        href: "/dashboard/transactions",
        icon: "transactions",
        source: "live",
      },
    ],
  },
  {
    title: "Collection",
    items: [
      {
        label: "Payment Accounts",
        href: "/dashboard/accounts",
        icon: "paymentAccounts",
        source: "live",
      },
      {
        label: "Payment Links",
        href: "/dashboard/payment-links",
        icon: "paymentLinks",
        source: "mock",
      },
      {
        label: "Invoices",
        href: "/dashboard/invoices",
        icon: "invoices",
        source: "mock",
      },
      {
        label: "Customers",
        href: "/dashboard/customers",
        icon: "customers",
        source: "mock",
      },
      {
        label: "Brands",
        href: "/dashboard/brands",
        icon: "brands",
        source: "mock",
      },
    ],
  },
  {
    title: "Automation",
    items: [
      {
        label: "Devices",
        href: "/dashboard/devices",
        icon: "devices",
        source: "live",
      },
      {
        label: "Checkout Builder",
        href: "/dashboard/checkout",
        icon: "checkout",
        source: "mock",
      },
      {
        label: "API & Developers",
        href: "/dashboard/developers",
        icon: "api",
        source: "live",
      },
      {
        label: "Webhooks",
        href: "/dashboard/webhooks",
        icon: "webhooks",
        source: "mock",
      },
      {
        label: "Sandbox",
        href: "/dashboard/sandbox",
        icon: "sandbox",
        source: "mock",
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        label: "Reports",
        href: "/dashboard/reports",
        icon: "reports",
        source: "mock",
      },
      {
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: "notifications",
        source: "mock",
      },
      {
        label: "Team",
        href: "/dashboard/team",
        icon: "team",
        source: "mock",
      },
      {
        label: "Billing",
        href: "/dashboard/billing",
        icon: "billing",
        source: "mock",
      },
    ],
  },
  {
    title: "General",
    items: [
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: "settings",
        source: "live",
      },
      {
        label: "Security",
        href: "/dashboard/security",
        icon: "security",
        source: "mock",
      },
      {
        label: "Help & Support",
        href: "/dashboard/support",
        icon: "support",
        source: "mock",
      },
    ],
  },
];

/**
 * Sidebar navigation for the admin console.
 *
 * A separate tree from the merchant's on purpose: an administrator should
 * not have to know a merchant's vocabulary to do their job.
 */
export const adminNav: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Overview", href: "/admin", icon: "dashboard", source: "live" },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Merchants",
        href: "/admin/merchants",
        icon: "merchants",
        source: "live",
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: "users",
        source: "live",
      },
      {
        label: "Payment Reviews",
        href: "/admin/reviews",
        icon: "review",
        source: "live",
      },
      {
        label: "Transactions",
        href: "/admin/transactions",
        icon: "transactions",
        source: "live",
      },
      {
        label: "Devices",
        href: "/admin/devices",
        icon: "devices",
        source: "live",
      },
    ],
  },
  {
    title: "Developers",
    items: [
      {
        label: "Providers & Parsers",
        href: "/admin/providers",
        icon: "providers",
        source: "mock",
      },
      {
        label: "API Logs",
        href: "/admin/api-logs",
        icon: "apiLogs",
        source: "mock",
      },
      {
        label: "Webhook Monitoring",
        href: "/admin/webhooks",
        icon: "webhooks",
        source: "mock",
      },
      {
        label: "Sandbox Monitoring",
        href: "/admin/sandbox",
        icon: "sandbox",
        source: "mock",
      },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Plans", href: "/admin/plans", icon: "plans", source: "mock" },
      { label: "Staff", href: "/admin/staff", icon: "staff", source: "mock" },
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: "notifications",
        source: "mock",
      },
      {
        label: "Audit Logs",
        href: "/admin/audit-logs",
        icon: "auditLogs",
        source: "live",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "System Health",
        href: "/admin/health",
        icon: "health",
        source: "mock",
      },
      {
        label: "Feature Flags",
        href: "/admin/feature-flags",
        icon: "featureFlags",
        source: "mock",
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: "settings",
        source: "live",
      },
      {
        label: "Security",
        href: "/admin/security",
        icon: "security",
        source: "mock",
      },
      {
        label: "System settings",
        href: "/admin/system",
        icon: "settings",
        source: "mock",
      },
    ],
  },
];

"use client";

import {
  CreditCard,
  LayoutDashboard,
  MonitorSmartphone,
  Receipt,
  Settings,
  Users,
} from "lucide-react";

/**
 * Icon registry for dashboard navigation. Nav configuration is authored as
 * plain data (icon names) so it can cross the server/client boundary safely.
 */
export const navIcons = {
  dashboard: LayoutDashboard,
  paymentAccounts: CreditCard,
  devices: MonitorSmartphone,
  transactions: Receipt,
  settings: Settings,
  users: Users,
} as const;

export type NavIconName = keyof typeof navIcons;

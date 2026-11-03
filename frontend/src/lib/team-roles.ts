/**
 * Team role vocabulary.
 *
 * The backend stores five roles, two of which belong to the platform rather
 * than the merchant. The product describes five merchant roles. This module is
 * the single place that reconciles the two, so no screen has to guess which
 * label to show for a role the API returned.
 *
 * The two sets do not line up one to one. The backend has no "Manager" and no
 * "Support" role, so a member with those responsibilities is stored as an
 * operator and the page says what that means rather than pretending the
 * backend is more granular than it is.
 */

import type { UserRole } from "@/types/api";
import type { MockRole } from "@/mock";

/** The product's five merchant roles. */
export const TEAM_ROLES: MockRole[] = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "SUPPORT",
  "VIEWER",
];

/** The label a merchant sees for each role. */
export const ROLE_LABELS: Record<MockRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  SUPPORT: "Support",
  VIEWER: "Viewer",
};

/** One line explaining what the role is for. */
export const ROLE_BLURBS: Record<MockRole, string> = {
  OWNER: "Full access, including billing and deleting the business.",
  ADMIN: "Everything except billing, which stays with the owner.",
  MANAGER: "Runs the day-to-day: payments, links, invoices, customers.",
  SUPPORT: "Answers customers and reviews payments, without moving money out.",
  VIEWER: "Reads payments and reports. Cannot change anything.",
};

/**
 * Backend role → product role.
 *
 * `MERCHANT_OPERATOR` covers two product roles — Manager and Support. The
 * page shows it as Manager, and says in the invite form that the backend
 * currently stores both as the same thing.
 */
export const BACKEND_TO_TEAM_ROLE: Partial<Record<UserRole, MockRole>> = {
  MERCHANT_OWNER: "OWNER",
  MERCHANT_ADMIN: "ADMIN",
  MERCHANT_OPERATOR: "MANAGER",
  MERCHANT_VIEWER: "VIEWER",
  PLATFORM_ADMIN: "OWNER",
};

/** The backend role each product role is invited with. */
export const TEAM_ROLE_TO_BACKEND: Record<MockRole, UserRole> = {
  OWNER: "MERCHANT_OWNER",
  ADMIN: "MERCHANT_ADMIN",
  MANAGER: "MERCHANT_OPERATOR",
  SUPPORT: "MERCHANT_OPERATOR",
  VIEWER: "MERCHANT_VIEWER",
};

/**
 * The product role for a user the API returned.
 *
 * A role the backend has that the product does not describe falls back to
 * Viewer, because the safe reading of an unknown role is the one that can
 * do the least.
 */
export function toTeamRole(role: UserRole): MockRole {
  return BACKEND_TO_TEAM_ROLE[role] ?? "VIEWER";
}

/** The label for a role the API returned. */
export function roleLabel(role: UserRole): string {
  return ROLE_LABELS[toTeamRole(role)];
}

/**
 * The roles a merchant can invite someone as.
 *
 * The backend accepts only admin, operator and viewer when creating a user,
 * so the Owner row is offered in the interface but explained in the note
 * beside it. Offering a role the API would reject would be a broken form.
 */
export const INVITABLE_ROLES: {
  role: MockRole;
  backendRole: UserRole;
  label: string;
  description: string;
  /** Set when the backend stores this differently from the product role. */
  note?: string;
}[] = [
  {
    role: "ADMIN",
    backendRole: "MERCHANT_ADMIN",
    label: "Admin",
    description: ROLE_BLURBS.ADMIN,
  },
  {
    role: "MANAGER",
    backendRole: "MERCHANT_OPERATOR",
    label: "Manager",
    description: ROLE_BLURBS.MANAGER,
  },
  {
    role: "SUPPORT",
    backendRole: "MERCHANT_OPERATOR",
    label: "Support",
    description: ROLE_BLURBS.SUPPORT,
    note: "The backend stores Support and Manager as the same role.",
  },
  {
    role: "VIEWER",
    backendRole: "MERCHANT_VIEWER",
    label: "Viewer",
    description: ROLE_BLURBS.VIEWER,
  },
];

"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MockPermission, MockRole } from "@/mock";

/**
 * The five built-in roles, in the order a merchant thinks about them.
 *
 * The matrix is the reference the merchant reads to decide what a colleague
 * can do, so the labels are the plain words a merchant would use.
 */
export const BUILT_IN_ROLES: { role: MockRole; label: string; blurb: string }[] = [
  {
    role: "OWNER",
    label: "Owner",
    blurb: "Full access, including billing and deleting the business.",
  },
  {
    role: "ADMIN",
    label: "Admin",
    blurb: "Everything except billing, which stays with the owner.",
  },
  {
    role: "MANAGER",
    label: "Manager",
    blurb: "Runs the day-to-day: payments, links, invoices, customers.",
  },
  {
    role: "SUPPORT",
    label: "Support",
    blurb: "Answers customers and reviews payments, without moving money out.",
  },
  {
    role: "VIEWER",
    label: "Viewer",
    blurb: "Reads payments and reports. Cannot change anything.",
  },
];

/**
 * The role permission matrix.
 *
 * One column per built-in role, one row per permission, grouped by area. A
 * tick means the role has the permission; a dash means it does not.
 */
export function RoleMatrix({
  permissions,
  rolePermissions,
}: {
  permissions: MockPermission[];
  rolePermissions: Record<MockRole, string[]>;
}) {
  const groups = React.useMemo(() => {
    const byGroup = new Map<string, MockPermission[]>();
    for (const permission of permissions) {
      const list = byGroup.get(permission.group) ?? [];
      list.push(permission);
      byGroup.set(permission.group, list);
    }
    return [...byGroup.entries()];
  }, [permissions]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 bg-surface px-5 py-3 text-left text-[11px] font-semibold tracking-wide text-ink-muted uppercase"
            >
              Permission
            </th>
            {BUILT_IN_ROLES.map((entry) => (
              <th
                key={entry.role}
                scope="col"
                className="px-3 py-3 text-center text-[11px] font-semibold tracking-wide text-ink-muted uppercase"
              >
                {entry.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map(([group, entries]) => (
            <React.Fragment key={group}>
              <tr>
                <th
                  scope="row"
                  colSpan={BUILT_IN_ROLES.length + 1}
                  className="sticky left-0 bg-elevated px-5 py-2 text-left text-[12px] font-semibold text-ink-soft"
                >
                  {group}
                </th>
              </tr>
              {entries.map((permission) => (
                <tr
                  key={permission.key}
                  className="border-t border-line transition-colors hover:bg-elevated"
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-surface px-5 py-2.5 text-left text-[13px] font-normal text-ink"
                  >
                    <span className="block">{permission.label}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-ink-faint">
                      {permission.key}
                    </span>
                  </th>
                  {BUILT_IN_ROLES.map((entry) => {
                    const granted = rolePermissions[entry.role].includes(
                      permission.key,
                    );

                    return (
                      <td key={entry.role} className="px-3 py-2.5 text-center">
                        <span
                          aria-label={
                            granted
                              ? `${entry.label} can ${permission.label}`
                              : `${entry.label} cannot ${permission.label}`
                          }
                          className={`inline-flex size-6 items-center justify-center rounded-md ${
                            granted
                              ? "bg-success-tint text-success-fg"
                              : "text-ink-faint"
                          }`}
                        >
                          {granted ? (
                            <Check className="size-4" aria-hidden="true" />
                          ) : (
                            <Minus className="size-4" aria-hidden="true" />
                          )}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The permission picker used when a custom role is written.
 *
 * It reuses the same permission catalogue as the matrix, so a custom role
 * can never hold a permission that the built-in roles do not know about.
 */
export function PermissionPicker({
  permissions,
  selected,
  onToggle,
}: {
  permissions: MockPermission[];
  selected: string[];
  onToggle: (key: string) => void;
}) {
  const groups = React.useMemo(() => {
    const byGroup = new Map<string, MockPermission[]>();
    for (const permission of permissions) {
      const list = byGroup.get(permission.group) ?? [];
      list.push(permission);
      byGroup.set(permission.group, list);
    }
    return [...byGroup.entries()];
  }, [permissions]);

  return (
    <div className="flex flex-col gap-4">
      {groups.map(([group, entries]) => (
        <fieldset key={group}>
          <legend className="mb-2 text-[12px] font-semibold tracking-wide text-ink-muted uppercase">
            {group}
          </legend>
          <div className="flex flex-col gap-1.5">
            {entries.map((permission) => {
              const checked = selected.includes(permission.key);

              return (
                <label
                  key={permission.key}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-elevated"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(permission.key)}
                    className="size-4 shrink-0 cursor-pointer rounded border-line-strong accent-brand-solid"
                  />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium text-ink">
                      {permission.label}
                    </span>
                    <span className="block font-mono text-[11px] text-ink-faint">
                      {permission.key}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

/** A small badge showing what a custom role holds. */
export function RoleBadge({ name }: { name: string }) {
  return <Badge tone="brand">{name}</Badge>;
}

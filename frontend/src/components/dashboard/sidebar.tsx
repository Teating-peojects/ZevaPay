"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { navIcons } from "@/components/dashboard/nav-icons";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api-client";
import type { NavSection } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export type { NavItem, NavSection } from "@/lib/nav-config";

export interface SidebarUser {
  name: string;
  email: string;
  /** Merchant or organization name shown under the avatar. */
  organization: string;
}

/**
 * Responsive dashboard sidebar. On mobile it becomes an off-canvas drawer
 * controlled by the parent shell.
 */
export function Sidebar({
  sections,
  variant,
  user,
  workspaceName,
  onNavigate,
  mobile = false,
  open = false,
}: {
  sections: NavSection[];
  variant: "merchant" | "admin";
  user: SidebarUser;
  workspaceName: string;
  onNavigate?: () => void;
  mobile?: boolean;
  open?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const root = variant === "admin" ? "/admin" : "/dashboard";

  function isActive(href: string) {
    if (href === root) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    setMenuOpen(false);
    try {
      await apiFetch("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // The session cookie is cleared by the API. A failed request still
      // means the user should land on the sign-in page.
    }
    toast({
      title: "Signed out",
      description: "Your session has ended.",
      tone: "info",
    });
    router.push("/login");
    router.refresh();
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-neutral-200 bg-white",
        mobile
          ? cn(
              "fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-200",
              open ? "translate-x-0" : "-translate-x-full",
            )
          : "w-64 shrink-0",
      )}
    >
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 px-4">
        <Logo href="/" showTagline={!mobile} />
        {mobile ? (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation"
            className="inline-flex size-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-neutral-100 hover:text-ink"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {/* Workspace */}
      <div className="border-b border-neutral-200 px-3 py-3">
        <div
          className={cn(
            "rounded-lg px-3 py-2",
            variant === "admin" ? "bg-brand-800" : "bg-neutral-50",
          )}
        >
          <p
            className={cn(
              "text-[11px] font-medium tracking-wide uppercase",
              variant === "admin" ? "text-brand-200" : "text-ink-muted",
            )}
          >
            {variant === "admin" ? "Admin console" : "Merchant"}
          </p>
          <p
            className={cn(
              "mt-0.5 truncate text-sm font-semibold",
              variant === "admin" ? "text-white" : "text-ink",
            )}
          >
            {workspaceName}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin"
        aria-label="Dashboard navigation"
      >
        {sections.map((section, sectionIndex) => (
          <div key={section.title ?? sectionIndex} className="mb-6 last:mb-0">
            {section.title ? (
              <p className="mb-2 px-3 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                {section.title}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = navIcons[item.icon];

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-brand-50 text-brand-800"
                          : "text-ink-soft hover:bg-neutral-100 hover:text-ink",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active ? "text-brand-700" : "text-ink-muted",
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-neutral-200 p-3">
        <div className="relative">
          {menuOpen ? (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white p-1 shadow-overlay">
                <div className="border-b border-neutral-200 px-2.5 py-2">
                  <p className="truncate text-[13px] font-semibold text-ink">
                    {user.name}
                  </p>
                  <p className="truncate text-[12px] text-ink-muted">
                    {user.email}
                  </p>
                </div>
                <Link
                  href={
                    variant === "admin"
                      ? "/admin/settings"
                      : "/dashboard/settings"
                  }
                  onClick={() => {
                    setMenuOpen(false);
                    onNavigate?.();
                  }}
                  className="block rounded-md px-2.5 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:bg-neutral-100"
                >
                  Account settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-danger-600 transition-colors hover:bg-danger-50"
                >
                  <LogOut className="size-3.5" aria-hidden="true" />
                  Logout
                </button>
              </div>
            </>
          ) : null}

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-neutral-100"
          >
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink">
                {user.name}
              </p>
              <p className="truncate text-[12px] text-ink-muted">
                {user.organization}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "size-3.5 shrink-0 text-ink-faint transition-transform",
                menuOpen && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

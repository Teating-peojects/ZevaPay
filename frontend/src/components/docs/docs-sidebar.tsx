"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOC_NAV } from "@/lib/docs-content";
import { cn } from "@/lib/utils";

/**
 * The documentation sidebar.
 *
 * It is a plain list of the pages that exist. There is no catch-all route
 * behind it, so every link here resolves to a real page — a link that
 * 404s would be worse than no link at all.
 */
export function DocsSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  function isActive(slug: string) {
    const href = slug ? `/docs/${slug}` : "/docs";
    return pathname === href;
  }

  return (
    <nav className={cn("flex flex-col gap-6", className)} aria-label="Documentation">
      {DOC_NAV.map((group) => (
        <div key={group.title}>
          <p className="mb-2 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item.slug);
              const href = item.slug ? `/docs/${item.slug}` : "/docs";

              return (
                <li key={item.slug}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-2 transition-colors",
                      active
                        ? "bg-brand-tint text-brand-ink"
                        : "text-ink-soft hover:bg-elevated hover:text-ink",
                    )}
                  >
                    <span className="block text-[13px] font-medium">
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-[12px] leading-snug",
                        active ? "text-brand-ink/80" : "text-ink-muted",
                      )}
                    >
                      {item.summary}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

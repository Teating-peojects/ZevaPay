"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  /** Optional count badge rendered after the label. */
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  /** Renders the tabs as a pill row instead of an underline row. */
  variant?: "underline" | "pill";
}

/**
 * Accessible tab list.
 *
 * Implements the WAI-ARIA tabs pattern: arrow keys move between tabs, only
 * the active tab is in the tab order.
 */
export function Tabs({
  items,
  value,
  onChange,
  className,
  variant = "underline",
}: TabsProps) {
  const listRef = React.useRef<HTMLDivElement>(null);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;

    event.preventDefault();

    const enabled = items.filter((item) => !item.disabled);
    const currentIndex = enabled.findIndex((item) => item.id === value);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % enabled.length;
    if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = enabled.length - 1;

    const next = enabled[nextIndex];
    onChange(next.id);
    // Move focus with the selection, as the tabs pattern requires.
    window.requestAnimationFrame(() => {
      listRef.current
        ?.querySelector<HTMLButtonElement>(`[data-tab-id="${next.id}"]`)
        ?.focus();
    });
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={onKeyDown}
      className={cn(
        "flex items-center gap-1 overflow-x-auto scrollbar-thin",
        variant === "underline"
          ? "border-b border-line"
          : "rounded-lg border border-line bg-sunken p-1",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            data-tab-id={item.id}
            aria-selected={active}
            aria-controls={`panel-${item.id}`}
            tabIndex={active ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium whitespace-nowrap transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-50",
              variant === "underline"
                ? cn(
                    "border-b-2 px-3 py-2.5",
                    active
                      ? "border-brand-ink text-ink"
                      : "border-transparent text-ink-muted hover:text-ink-soft",
                  )
                : cn(
                    "rounded-md px-2.5 py-1.5",
                    active
                      ? "bg-surface text-ink shadow-sm"
                      : "text-ink-muted hover:text-ink-soft",
                  ),
            )}
          >
            {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
            {item.label}
            {typeof item.count === "number" ? (
              <span
                className={cn(
                  "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                  active
                    ? "bg-brand-tint text-brand-ink"
                    : "bg-elevated text-ink-muted",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** The content region that belongs to a tab. */
export function TabPanel({
  id,
  value,
  children,
  className,
}: {
  id: string;
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (id !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={cn("focus:outline-none", className)}
    >
      {children}
    </div>
  );
}

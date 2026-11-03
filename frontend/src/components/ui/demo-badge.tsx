import * as React from "react";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Marks a page or panel whose contents come from the mock layer rather than
 * the API. Every mock-backed surface must carry one of these so a reader
 * always knows the numbers are sample data.
 */
export function DemoBadge({
  className,
  label = "Demo data",
  children,
}: {
  className?: string;
  label?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-warning-tint px-2 py-0.5 text-[11px] font-semibold text-warning-fg ring-1 ring-inset ring-warning-line",
        className,
      )}
    >
      <FlaskConical className="size-3 shrink-0" aria-hidden="true" />
      {children ?? label}
    </span>
  );
}

/**
 * A fuller banner for pages that are entirely mock-backed. It explains what
 * the page shows and that nothing is sent or processed.
 */
export function DemoNotice({
  className,
  title = "Demo data",
  children,
}: {
  className?: string;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-warning-line bg-warning-tint px-4 py-3",
        className,
      )}
    >
      <FlaskConical
        className="mt-0.5 size-4 shrink-0 text-warning-fg"
        aria-hidden="true"
      />
      <div className="min-w-0 text-[13px] leading-relaxed">
        <p className="font-semibold text-ink">{title}</p>
        <div className="text-ink-muted">{children}</div>
      </div>
    </div>
  );
}

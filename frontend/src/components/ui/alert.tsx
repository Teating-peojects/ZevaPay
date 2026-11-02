import * as React from "react";
import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "info" | "success" | "warning" | "danger";

const toneStyles: Record<AlertTone, { wrap: string; icon: string }> = {
  info: {
    wrap: "border-info-100 bg-info-50 text-info-700",
    icon: "text-info-600",
  },
  success: {
    wrap: "border-success-100 bg-success-50 text-success-700",
    icon: "text-success-600",
  },
  warning: {
    wrap: "border-warning-100 bg-warning-50 text-warning-700",
    icon: "text-warning-600",
  },
  danger: {
    wrap: "border-danger-100 bg-danger-50 text-danger-700",
    icon: "text-danger-600",
  },
};

const toneIcons = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
};

/** Inline informational banner. */
export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const Icon = toneIcons[tone];
  const styles = toneStyles[tone];

  return (
    <div
      role="status"
      className={cn(
        "flex gap-3 rounded-lg border px-4 py-3",
        styles.wrap,
        className,
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", styles.icon)} aria-hidden="true" />
      <div className="min-w-0 text-[13px] leading-relaxed">
        {title ? (
          <p className="font-semibold text-ink">{title}</p>
        ) : null}
        {children ? <div className="text-current/90">{children}</div> : null}
      </div>
    </div>
  );
}

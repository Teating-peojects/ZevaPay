import { PlugZap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The banner shown on every screen that has no backend endpoint behind it.
 *
 * The PDF is explicit about this: "/reset-password, /verify-email and
 * /two-factor, each labelled as not connected to the backend". Making the
 * gap visible is more honest than a form that silently does nothing.
 */
export function UiOnlyNotice({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-warning-line bg-warning-tint px-4 py-3",
        className,
      )}
    >
      <PlugZap
        className="mt-0.5 size-4 shrink-0 text-warning-fg"
        aria-hidden="true"
      />
      <div className="min-w-0 text-[13px] leading-relaxed">
        <p className="font-semibold text-ink">Not connected to the backend</p>
        <div className="text-ink-muted">
          {children ?? (
            <>
              This screen shows the intended behaviour. The API does not have
              this endpoint yet, so submitting it does nothing.
            </>
          )}
        </div>
      </div>
    </div>
  );
}

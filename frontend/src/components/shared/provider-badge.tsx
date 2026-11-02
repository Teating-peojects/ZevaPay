import { getProvider } from "@/data/providers";
import type { PaymentProvider } from "@/types/api";
import { cn } from "@/lib/utils";

/**
 * Compact provider identifier. Uses a colored chip with the provider's
 * two-letter mark rather than a third-party logo.
 */
export function ProviderBadge({
  provider,
  size = "md",
  className,
}: {
  provider: PaymentProvider;
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = getProvider(provider);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium whitespace-nowrap",
        size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-xs",
        className,
      )}
      style={{ backgroundColor: meta.tint, color: meta.textColor }}
    >
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded font-bold text-white",
          size === "sm" ? "size-4 text-[9px]" : "size-5 text-[10px]",
        )}
        style={{ backgroundColor: meta.color }}
        aria-hidden="true"
      >
        {meta.shortName}
      </span>
      {meta.name}
    </span>
  );
}

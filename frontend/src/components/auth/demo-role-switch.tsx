"use client";

import * as React from "react";
import { Building2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_ROLE_KEY, type DemoRole, isDemoMode } from "@/lib/demo-mode";
import {
  readStored,
  subscribeToStored,
  writeStored,
} from "@/lib/stored-state";

/**
 * Subscribes to the stored demo role.
 *
 * The choice lives in `localStorage`, so it is read through an external
 * store rather than copied into state inside an effect.
 */
function subscribeDemoRole(listener: () => void): () => void {
  return subscribeToStored(DEMO_ROLE_KEY, listener);
}

function getDemoRoleSnapshot(): DemoRole | null {
  const stored = readStored(DEMO_ROLE_KEY, "");
  return stored === "merchant" || stored === "admin" ? stored : null;
}

function getDemoRoleServerSnapshot(): DemoRole | null {
  return null;
}

/**
 * The demo role switch.
 *
 * It is only rendered when `NEXT_PUBLIC_DEMO_MODE=true` and the build is not
 * a production build. It never sets a session cookie and never calls the
 * auth API — it records which seeded account the sign-in form should offer,
 * and the sign-in form performs a normal sign-in with those credentials.
 */
export function DemoRoleSwitch({ className }: { className?: string }) {
  const enabled = isDemoMode();
  const role = React.useSyncExternalStore(
    subscribeDemoRole,
    getDemoRoleSnapshot,
    getDemoRoleServerSnapshot,
  );

  if (!enabled) return null;

  const options: { id: DemoRole; label: string; icon: typeof Building2 }[] = [
    { id: "merchant", label: "Merchant", icon: Building2 },
    { id: "admin", label: "Admin", icon: ShieldCheck },
  ];

  return (
    <div
      className={cn(
        "rounded-lg border border-warning-line bg-warning-tint p-3",
        className,
      )}
    >
      <p className="text-[12px] font-semibold text-ink">Demo role</p>
      <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
        Pick a role to pre-fill the seeded account on the sign-in form. This
        does not sign you in and does not set a session cookie.
      </p>

      <div
        role="radiogroup"
        aria-label="Demo role"
        className="mt-2.5 grid grid-cols-2 gap-2"
      >
        {options.map((option) => {
          const Icon = option.icon;
          const selected = role === option.id;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => writeStored(DEMO_ROLE_KEY, selected ? "" : option.id)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                selected
                  ? "bg-surface text-ink shadow-sm ring-1 ring-line-strong"
                  : "bg-transparent text-ink-soft hover:bg-surface/60",
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

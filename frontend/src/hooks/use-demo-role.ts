"use client";

import * as React from "react";
import { DEMO_ROLE_KEY, type DemoRole } from "@/lib/demo-mode";
import {
  readStored,
  subscribeToStored,
  writeStored,
} from "@/lib/stored-state";

/**
 * Subscribes to the stored demo role.
 *
 * The choice lives in `localStorage`, so it is read through an external store
 * rather than copied into state inside an effect.
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
 * Reads the demo role the visitor picked, if any.
 *
 * `null` means either demo mode is off or nothing has been chosen — the
 * normal case, where the real session decides what is shown.
 */
export function useDemoRole(): DemoRole | null {
  return React.useSyncExternalStore(
    subscribeDemoRole,
    getDemoRoleSnapshot,
    getDemoRoleServerSnapshot,
  );
}

/** Clears the stored demo role. */
export function clearDemoRole(): void {
  writeStored(DEMO_ROLE_KEY, "");
}

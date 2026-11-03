"use client";

import * as React from "react";
import {
  DEMO_ACCOUNT_SETTINGS_KEY,
  readDemoAccountSettings,
  type AccountDemoSettings,
} from "@/lib/demo-account-settings";
import {
  readStored,
  subscribeToStored,
  writeStored,
} from "@/lib/stored-state";

/**
 * The demo settings for every account, kept in `localStorage`.
 *
 * They are read through the external store rather than copied into state
 * inside an effect, which keeps the account list from cascading a render
 * every time the API answers.
 */
function subscribe(listener: () => void): () => void {
  return subscribeToStored(DEMO_ACCOUNT_SETTINGS_KEY, listener);
}

/**
 * The stored settings as JSON.
 *
 * The snapshot is a string rather than an object so it is stable between
 * reads — `useSyncExternalStore` compares snapshots by identity, and a
 * freshly parsed object would never be equal to the last one.
 */
function getSnapshot(): string {
  return readStored(DEMO_ACCOUNT_SETTINGS_KEY, "{}");
}

function getServerSnapshot(): string {
  return "{}";
}

/**
 * Reads and writes the demo settings for the payment accounts.
 */
export function useDemoAccountSettings(): {
  settings: Record<string, AccountDemoSettings>;
  /** Saves the demo settings for one account. */
  save: (id: string, next: AccountDemoSettings) => void;
} {
  const snapshot = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const settings = React.useMemo(() => {
    try {
      const parsed = JSON.parse(snapshot) as Record<string, AccountDemoSettings>;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }, [snapshot]);

  const save = React.useCallback((id: string, next: AccountDemoSettings) => {
    const updated = { ...readDemoAccountSettings(), [id]: next };
    writeStored(DEMO_ACCOUNT_SETTINGS_KEY, JSON.stringify(updated));
  }, []);

  return { settings, save };
}

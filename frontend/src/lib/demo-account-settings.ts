/**
 * The demo fields layered on top of the real payment accounts.
 *
 * The API stores a label, an account type and a status. Priority, the enable
 * toggle, the daily limit and the health score are sample values, so they
 * live in the browser and are clearly labelled as demo fields wherever they
 * appear.
 *
 * They are kept in `localStorage` rather than in the mock layer, because the
 * mock layer's records stand in for the API — and these values are not API
 * values. They belong to the view.
 */
export interface AccountDemoSettings {
  priority: number;
  enabled: boolean;
  dailyLimit: number;
  health: number;
}

/** Where the demo settings are kept between renders. */
export const DEMO_ACCOUNT_SETTINGS_KEY = "zp-demo-account-settings";

/** The settings a new account starts with. */
export const DEFAULT_ACCOUNT_DEMO_SETTINGS: AccountDemoSettings = {
  priority: 1,
  enabled: true,
  dailyLimit: 200_000,
  health: 92,
};

/**
 * Reads the stored demo settings.
 *
 * Kept out of the mock layer on purpose: this page shows the *real* account
 * list, and the demo fields belong to the view, not to the record.
 */
export function readDemoAccountSettings(): Record<string, AccountDemoSettings> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(DEMO_ACCOUNT_SETTINGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, AccountDemoSettings>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

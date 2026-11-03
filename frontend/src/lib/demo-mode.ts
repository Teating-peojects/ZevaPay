/**
 * Demo mode.
 *
 * The PDF's ground rule for Phase 2: the demo role switch is available
 * "only when NEXT_PUBLIC_DEMO_MODE=true, never in a production build, and it
 * must not set real session cookies".
 *
 * Three conditions therefore have to hold before the switch appears:
 *
 * 1. `NEXT_PUBLIC_DEMO_MODE` is exactly `"true"`.
 * 2. The build is not a production build.
 * 3. The call is happening in a browser (the flag is inlined at build time,
 *    so the value is available on the client but not on the server).
 *
 * The switch itself never calls the auth API and never writes a session
 * cookie. It only records a *preference* — which role to preview — which the
 * sign-in form then uses to pre-fill the seeded demo account. Signing in is
 * still a real sign-in against the real API, with the session cookie set by
 * the API itself.
 *
 * The stored value lives under `DEMO_ROLE_KEY` and is read through the
 * `stored-state` external store, so both the switch and the sign-in form
 * stay in sync without an effect.
 */

/** The localStorage key holding the chosen demo role. */
export const DEMO_ROLE_KEY = "zp-demo-role";

/** The roles a visitor can preview. */
export type DemoRole = "merchant" | "admin";

/** Whether demo mode is compiled in at all. */
export const DEMO_MODE_ENABLED =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" &&
  process.env.NODE_ENV !== "production";

/**
 * Whether the demo role switch should be rendered.
 *
 * Safe to call on the server: it simply returns false there, because the
 * switch is a client-only affordance and the build-time flag is not exposed
 * to server components through `NEXT_PUBLIC_` at runtime.
 */
export function isDemoMode(): boolean {
  return DEMO_MODE_ENABLED;
}

/**
 * The seeded accounts the demo sign-in uses.
 *
 * These mirror `db/seed/seed.ts`. The password is the shared demo password
 * the backend seeds, and is only ever shown when demo mode is compiled in.
 */
export const DEMO_ACCOUNTS: Record<
  DemoRole,
  { email: string; password: string; label: string; destination: string }
> = {
  merchant: {
    email: "owner@dhanmondi.test",
    password: "ZevaPay#2026",
    label: "Merchant",
    destination: "/dashboard",
  },
  admin: {
    email: "admin@zevapay.test",
    password: "ZevaPay#2026",
    label: "Admin",
    destination: "/admin",
  },
};

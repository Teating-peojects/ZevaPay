import * as React from "react";
import { ExpiredView } from "./expired-view";

/**
 * The "this link has expired" route.
 *
 * The id is read on the client, and the `Suspense` boundary is required:
 * with cache components on, a client hook that reads a dynamic param
 * suspends during prerendering, and Next.js needs a boundary to render the
 * shell around it.
 */
export default function CheckoutExpiredPage() {
  return (
    <React.Suspense fallback={null}>
      <ExpiredView />
    </React.Suspense>
  );
}

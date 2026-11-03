import * as React from "react";
import { FailedView } from "./failed-view";

/**
 * The "we could not match your payment" route.
 *
 * The id is read on the client, and the `Suspense` boundary is required:
 * with cache components on, a client hook that reads a dynamic param
 * suspends during prerendering, and Next.js needs a boundary to render the
 * shell around it.
 */
export default function CheckoutFailedPage() {
  return (
    <React.Suspense fallback={null}>
      <FailedView />
    </React.Suspense>
  );
}

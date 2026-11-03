import * as React from "react";
import { SuccessView } from "./success-view";

/**
 * The "payment recorded" route.
 *
 * The id and the TrxID are read on the client, and the `Suspense` boundary
 * is required: with cache components on, a client hook that reads a dynamic
 * param suspends during prerendering, and Next.js needs a boundary to render
 * the shell around it.
 */
export default function CheckoutSuccessPage() {
  return (
    <React.Suspense fallback={<OutcomeSkeleton />}>
      <SuccessView />
    </React.Suspense>
  );
}

function OutcomeSkeleton() {
  return (
    <div className="surface rounded-xl p-8 text-center">
      <div className="mx-auto size-12 rounded-xl bg-elevated" />
      <div className="mx-auto mt-5 h-4 w-64 rounded bg-elevated" />
      <div className="mx-auto mt-3 h-3 w-80 rounded bg-elevated" />
    </div>
  );
}

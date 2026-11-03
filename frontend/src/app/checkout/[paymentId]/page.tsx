import * as React from "react";
import { CheckoutView } from "./checkout-view";

/**
 * The checkout page for one payment link.
 *
 * The id is read on the client, because the record comes from the mock layer
 * and the mock layer only exists in the browser. The `Suspense` boundary is
 * required: with cache components on, a client hook that reads a dynamic
 * param suspends during prerendering, and Next.js needs a boundary to render
 * the shell around it.
 */
export default function CheckoutPage() {
  return (
    <React.Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutView />
    </React.Suspense>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="surface rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="size-11 shrink-0 rounded-xl bg-elevated" />
          <div className="flex-1">
            <div className="h-3 w-28 rounded bg-elevated" />
            <div className="mt-2 h-6 w-36 rounded bg-elevated" />
            <div className="mt-2 h-3 w-48 rounded bg-elevated" />
          </div>
        </div>
      </div>
      <div className="surface rounded-xl p-6">
        <div className="h-4 w-32 rounded bg-elevated" />
        <div className="mt-4 h-3 w-full rounded bg-elevated" />
        <div className="mt-2 h-3 w-5/6 rounded bg-elevated" />
        <div className="mt-6 h-24 rounded-lg bg-elevated" />
      </div>
    </div>
  );
}

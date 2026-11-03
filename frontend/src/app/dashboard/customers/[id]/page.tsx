import * as React from "react";
import { CustomerDetailScreen } from "./customer-detail-screen";

/**
 * The customer detail route.
 *
 * The id is read on the client, because the record comes from the mock layer
 * and the mock layer only exists in the browser. The `Suspense` boundary is
 * required: with cache components on, a client hook that reads a dynamic
 * param suspends during prerendering, and Next.js needs a boundary to render
 * the shell around it.
 */
export default function CustomerDetailPage() {
  return (
    <React.Suspense fallback={null}>
      <CustomerDetailScreen />
    </React.Suspense>
  );
}

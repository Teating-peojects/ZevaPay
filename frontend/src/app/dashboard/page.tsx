import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, serverFetch } from "@/lib/server-api";
import type { MerchantOverview } from "@/types/api";
import { MerchantOverviewScreen } from "./overview-screen";

export const metadata: Metadata = {
  title: "Overview",
  description: "Merchant overview — transaction activity, devices, and accounts.",
};

/**
 * The merchant overview.
 *
 * The session and the API's own overview summary are fetched on the server,
 * so the page renders with real data straight away. The charts, the method
 * split and the date filter run against the mock layer, and carry a Demo
 * badge so the two are never confused.
 */
export default async function MerchantOverviewPage() {
  const [session, overview] = await Promise.all([
    getSession(),
    serverFetch<MerchantOverview>("/api/v1/merchant/overview"),
  ]);

  if (!session) redirect("/login");

  return (
    <MerchantOverviewScreen
      merchantName={overview?.merchant.businessName ?? "your business"}
      firstName={session.user.fullName.split(" ")[0]}
      live={overview}
    />
  );
}

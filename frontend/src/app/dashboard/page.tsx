import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CircleCheck,
  Clock,
  CreditCard,
  MonitorSmartphone,
  Receipt,
  Wallet,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityChart } from "@/components/shared/activity-chart";
import { ProviderBadge } from "@/components/shared/provider-badge";
import { TransactionStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBDT, formatDateTimeShort, formatNumber } from "@/lib/format";
import { getSession, serverFetch } from "@/lib/server-api";
import type { MerchantOverview } from "@/types/api";

export const metadata: Metadata = {
  title: "Overview",
  description: "Merchant overview — transaction activity, devices, and accounts.",
};

export default async function MerchantOverviewPage() {
  const [session, overview] = await Promise.all([
    getSession(),
    serverFetch<MerchantOverview>("/api/v1/merchant/overview"),
  ]);

  if (!session || !overview) {
    return (
      <div className="surface rounded-xl p-8 text-center">
        <p className="text-[15px] font-semibold text-ink">
          We couldn&apos;t load your overview
        </p>
        <p className="mt-1.5 text-sm text-ink-muted">
          The API did not return any data for this account. Try refreshing the
          page.
        </p>
      </div>
    );
  }

  const firstName = session.user.fullName.split(" ")[0];
  const onlineDevices = overview.deviceCounts.online;
  const activeAccounts = overview.accounts.filter(
    (account) => account.status === "ACTIVE",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Here is the payment activity for {overview.merchant.businessName}.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total transactions"
          value={formatNumber(overview.stats.totalTransactions)}
          hint="Recorded from device notifications"
          icon={Receipt}
        />
        <StatCard
          label="Successful transactions"
          value={formatNumber(overview.stats.successfulTransactions)}
          hint={`${overview.stats.successRate.toFixed(0)}% of recorded activity`}
          icon={CircleCheck}
          tone="success"
        />
        <StatCard
          label="Pending transactions"
          value={formatNumber(overview.stats.pendingTransactions)}
          hint="Awaiting confirmation or failed"
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Total amount"
          value={formatBDT(overview.stats.totalAmount)}
          hint="Sum of recorded notifications"
          icon={Wallet}
          tone="info"
        />
      </div>

      {/* Chart + summaries */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transaction activity</CardTitle>
            <CardDescription>
              Notifications recorded over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart data={overview.activity} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Connected devices</CardTitle>
                <CardDescription>
                  {onlineDevices} of {overview.devices.length} online
                </CardDescription>
              </div>
              <span className="flex size-9 items-center justify-center rounded-lg bg-neutral-100">
                <MonitorSmartphone
                  className="size-4 text-ink-soft"
                  aria-hidden="true"
                />
              </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {overview.devices.slice(0, 3).map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between gap-3"
                >
                  <p className="min-w-0 truncate text-[13px] text-ink-soft">
                    {device.name}
                  </p>
                  <span className="shrink-0 text-[12px] font-medium text-ink-muted">
                    {device.deviceId.slice(-4)}
                  </span>
                </div>
              ))}
              <Link
                href="/dashboard/devices"
                className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-brand-700 transition-colors hover:text-brand-800"
              >
                Manage devices
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Payment accounts</CardTitle>
                <CardDescription>
                  {activeAccounts} of {overview.accounts.length} active
                </CardDescription>
              </div>
              <span className="flex size-9 items-center justify-center rounded-lg bg-neutral-100">
                <CreditCard
                  className="size-4 text-ink-soft"
                  aria-hidden="true"
                />
              </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {overview.accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between gap-3"
                >
                  <ProviderBadge provider={account.provider} size="sm" />
                  <span className="shrink-0 font-mono text-[12px] text-ink-muted">
                    {account.accountNumber}
                  </span>
                </div>
              ))}
              <Link
                href="/dashboard/accounts"
                className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-brand-700 transition-colors hover:text-brand-800"
              >
                Manage accounts
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>Latest recorded payment notifications</CardDescription>
          </div>
          <Link href="/dashboard/transactions">
            <Button variant="outline" size="sm">
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-[13px] font-medium text-ink">
                    {transaction.reference}
                  </TableCell>
                  <TableCell>
                    <ProviderBadge
                      provider={transaction.provider}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="block text-ink-soft">
                      {transaction.customerName ?? "Unknown sender"}
                    </span>
                    {transaction.customerPhone ? (
                      <span className="block text-[12px] text-ink-muted">
                        {transaction.customerPhone}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right font-medium text-ink">
                    {formatBDT(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <TransactionStatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell className="text-right text-[13px] text-ink-muted">
                    {formatDateTimeShort(transaction.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

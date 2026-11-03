"use client";

import * as React from "react";
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
import {
  MethodSplitChart,
  RevenueChart,
  VolumeChart,
} from "@/components/shared/revenue-chart";
import { ProviderBadge } from "@/components/shared/provider-badge";
import { PaymentStatusBadge } from "@/components/shared/payment-status-badge";
import { DemoBadge } from "@/components/ui/demo-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatBDT,
  formatDateTimeShort,
  formatNumber,
  REFERENCE_NOW,
} from "@/lib/format";
import { dateRangeDays, type DateRange } from "@/lib/date-range";
import {
  MOCK_REVENUE_BY_DAY,
  MOCK_REVENUE_BY_METHOD,
  mockFetchPayments,
  type MockPayment,
} from "@/mock";
import type { MerchantOverview } from "@/types/api";

/** The date windows the overview offers. */
const RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

/**
 * The overview offers the shared relative ranges plus a custom window.
 *
 * The custom window is local to this screen — the shared table filter has no
 * custom option, because the API's date filters are relative only.
 */
type OverviewRange = DateRange | "custom";

/**
 * The custom range the reader picks, as two `YYYY-MM-DD` strings.
 */
interface CustomRange {
  from: string;
  to: string;
}

/**
 * The merchant overview screen.
 *
 * The stat cards, the charts and the date filter are mock-backed and carry a
 * Demo badge. The live figures the API returned are shown alongside them so
 * the reader can see where the sample data comes from.
 */
export function MerchantOverviewScreen({
  merchantName,
  firstName,
  live,
}: {
  merchantName: string;
  firstName: string;
  /** The API's own overview summary, when it was available. */
  live: MerchantOverview | null;
}) {
  const [range, setRange] = React.useState<OverviewRange>("30d");
  const [custom, setCustom] = React.useState<CustomRange | null>(null);
  const [customDraft, setCustomDraft] = React.useState<CustomRange>({
    from: "",
    to: "",
  });

  // The payments recorded in the window, used for the pending-review alert
  // and the recent list.
  const payments = React.useMemo(() => {
    const { rows } = mockFetchPayments({ pageSize: 200 });
    return rows;
  }, []);

  const windowed = React.useMemo(() => {
    if (range === "today") {
      const start = new Date(REFERENCE_NOW);
      start.setHours(0, 0, 0, 0);
      return payments.filter(
        (payment) => new Date(payment.createdAt).getTime() >= start.getTime(),
      );
    }

    if (range === "custom") {
      if (!custom) return payments;

      const from = custom.from ? Date.parse(`${custom.from}T00:00:00`) : null;
      const to = custom.to ? Date.parse(`${custom.to}T23:59:59`) : null;

      return payments.filter((payment) => {
        const at = Date.parse(payment.createdAt);
        if (from !== null && !Number.isNaN(from) && at < from) return false;
        if (to !== null && !Number.isNaN(to) && at > to) return false;
        return true;
      });
    }

    const days = dateRangeDays(range) ?? 30;
    const from = REFERENCE_NOW - days * 86_400_000;

    return payments.filter(
      (payment) => Date.parse(payment.createdAt) >= from,
    );
  }, [payments, range, custom]);

  const totals = React.useMemo(() => {
    const confirmed = windowed.filter(
      (payment) => payment.status === "CONFIRMED",
    );
    const awaiting = windowed.filter(
      (payment) => payment.status === "PENDING" || payment.status === "REVIEW",
    );
    const failed = windowed.filter(
      (payment) => payment.status === "FAILED",
    );

    return {
      count: windowed.length,
      confirmed: confirmed.length,
      awaiting: awaiting.length,
      failed: failed.length,
      volume: confirmed.reduce((sum, payment) => sum + payment.amount, 0),
      successRate:
        windowed.length === 0
          ? 0
          : (confirmed.length / windowed.length) * 100,
    };
  }, [windowed]);

  // The chart series are fixed sample data. The date filter windows them
  // rather than inventing new points, so the chart never lies about its
  // shape.
  const series = React.useMemo(() => {
    if (range === "custom") {
      if (!custom) return MOCK_REVENUE_BY_DAY;

      const from = custom.from ? Date.parse(`${custom.from}T00:00:00`) : null;
      const to = custom.to ? Date.parse(`${custom.to}T23:59:59`) : null;

      return MOCK_REVENUE_BY_DAY.filter((point) => {
        const at = Date.parse(`${point.date}T00:00:00`);
        if (from !== null && !Number.isNaN(from) && at < from) return false;
        if (to !== null && !Number.isNaN(to) && at > to) return false;
        return true;
      });
    }

    const days = dateRangeDays(range) ?? 30;
    const from = REFERENCE_NOW - days * 86_400_000;

    return MOCK_REVENUE_BY_DAY.filter(
      (point) => Date.parse(`${point.date}T00:00:00`) >= from,
    );
  }, [range, custom]);

  const volumeSeries = React.useMemo(
    () =>
      series.map((point) => ({
        label: point.label,
        value: point.transactions,
      })),
    [series],
  );

  const recent = React.useMemo(
    () =>
      [...windowed]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 8),
    [windowed],
  );

  const pendingReview = React.useMemo(
    () =>
      windowed.filter(
        (payment) => payment.status === "REVIEW" || payment.status === "PENDING",
      ),
    [windowed],
  );

  const rangeLabel =
    range === "custom"
      ? custom && custom.from && custom.to
        ? `${custom.from} to ${custom.to}`
        : "Custom range"
      : (RANGE_OPTIONS.find((option) => option.value === range)?.label ?? "");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Here is the payment activity for {merchantName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DemoBadge label="Demo charts and totals" />
        </div>
      </div>

      {/* Date filter */}
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Date range"
        >
          {RANGE_OPTIONS.map((option) => {
            const active = range === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setRange(option.value);
                  setCustom(null);
                }}
                aria-pressed={active}
                className={
                  active
                    ? "rounded-lg bg-brand-solid px-3 py-1.5 text-[13px] font-medium text-white transition-colors"
                    : "rounded-lg px-3 py-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
                }
              >
                {option.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setRange("custom");
              setCustom(null);
            }}
            aria-pressed={range === "custom"}
            className={
              range === "custom"
                ? "rounded-lg bg-brand-solid px-3 py-1.5 text-[13px] font-medium text-white transition-colors"
                : "rounded-lg px-3 py-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
            }
          >
            Custom
          </button>
        </div>

        <p className="text-[13px] text-ink-muted">
          Showing <span className="font-medium text-ink">{rangeLabel}</span>
        </p>
      </div>

      {range === "custom" ? (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-end">
          <div className="w-full sm:w-52">
            <label
              htmlFor="overview-from"
              className="mb-1.5 block text-[13px] font-medium text-ink-soft"
            >
              From
            </label>
            <Input
              id="overview-from"
              type="date"
              value={customDraft.from}
              max={customDraft.to || undefined}
              onChange={(event) =>
                setCustomDraft((draft) => ({ ...draft, from: event.target.value }))
              }
            />
          </div>
          <div className="w-full sm:w-52">
            <label
              htmlFor="overview-to"
              className="mb-1.5 block text-[13px] font-medium text-ink-soft"
            >
              To
            </label>
            <Input
              id="overview-to"
              type="date"
              value={customDraft.to}
              min={customDraft.from || undefined}
              onChange={(event) =>
                setCustomDraft((draft) => ({ ...draft, to: event.target.value }))
              }
            />
          </div>
          <Button
            onClick={() => setCustom(customDraft)}
            disabled={!customDraft.from || !customDraft.to}
          >
            Apply range
          </Button>
          {custom ? (
            <Button
              variant="ghost"
              onClick={() => {
                setCustom(null);
                setCustomDraft({ from: "", to: "" });
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* Pending review alert */}
      <Alert tone="info" title="Live data">
        The totals below come from the API&apos;s own summary of this
        merchant&apos;s recorded notifications. The charts and the method split
        beside them are sample figures.
      </Alert>

      {/* Pending review alert */}
      {pendingReview.length > 0 ? (
        <Alert tone="warning" title="Payments are waiting on a decision">
          {pendingReview.length}{" "}
          {pendingReview.length === 1 ? "payment is" : "payments are"} recorded
          but not yet confirmed from a notification. Review{" "}
          {pendingReview.length === 1 ? "it" : "them"} before counting the money
          as received.
          <span className="mt-2 block">
            <Link
              href="/dashboard/payments"
              className="inline-flex items-center gap-1 font-semibold text-warning-fg underline underline-offset-2"
            >
              Go to payments
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </span>
        </Alert>
      ) : null}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Transactions recorded"
          value={formatNumber(totals.count)}
          hint={`${rangeLabel} · recorded from device notifications`}
          icon={Receipt}
        />
        <StatCard
          label="Confirmed from SMS"
          value={formatNumber(totals.confirmed)}
          hint={`${totals.successRate.toFixed(0)}% of recorded activity`}
          icon={CircleCheck}
          tone="success"
        />
        <StatCard
          label="Awaiting a decision"
          value={formatNumber(totals.awaiting + totals.failed)}
          hint="Not counted as received money"
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Confirmed amount"
          value={formatBDT(totals.volume)}
          hint="Sum of confirmed notifications"
          icon={Wallet}
          tone="info"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>
                Confirmed payment amounts recorded over {rangeLabel.toLowerCase()}
              </CardDescription>
            </div>
            <DemoBadge />
          </CardHeader>
          <CardContent>
            {series.length === 0 ? (
              <p className="py-14 text-center text-[13px] text-ink-muted">
                No revenue was recorded in this range.
              </p>
            ) : (
              <RevenueChart
                data={series.map((point) => ({
                  label: point.label,
                  revenue: point.revenue,
                  transactions: point.transactions,
                }))}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Payment method</CardTitle>
              <CardDescription>How the money arrived</CardDescription>
            </div>
            <DemoBadge />
          </CardHeader>
          <CardContent>
            <MethodSplitChart data={MOCK_REVENUE_BY_METHOD} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Transaction volume</CardTitle>
            <CardDescription>
              How many notifications were recorded over {rangeLabel.toLowerCase()}
            </CardDescription>
          </div>
          <DemoBadge />
        </CardHeader>
        <CardContent>
          {volumeSeries.length === 0 ? (
            <p className="py-14 text-center text-[13px] text-ink-muted">
              No transactions were recorded in this range.
            </p>
          ) : (
            <VolumeChart data={volumeSeries} />
          )}
        </CardContent>
      </Card>

      {/* Devices and accounts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Connected devices</CardTitle>
              <CardDescription>
                {live
                  ? `${live.deviceCounts.online} of ${live.devices.length} online`
                  : "Live from the API"}
              </CardDescription>
            </div>
            <span className="flex size-9 items-center justify-center rounded-lg bg-elevated">
              <MonitorSmartphone
                className="size-4 text-ink-soft"
                aria-hidden="true"
              />
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {(live?.devices ?? []).slice(0, 3).map((device) => (
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
            {live && live.devices.length === 0 ? (
              <p className="text-[13px] text-ink-muted">
                No devices are connected to this merchant yet.
              </p>
            ) : null}
            <Link
              href="/dashboard/devices"
              className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-brand-link transition-colors hover:text-brand-link-hover"
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
                {live
                  ? `${live.accounts.filter((account) => account.status === "ACTIVE").length} of ${live.accounts.length} active`
                  : "Live from the API"}
              </CardDescription>
            </div>
            <span className="flex size-9 items-center justify-center rounded-lg bg-elevated">
              <CreditCard
                className="size-4 text-ink-soft"
                aria-hidden="true"
              />
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {(live?.accounts ?? []).map((account) => (
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
            {live && live.accounts.length === 0 ? (
              <p className="text-[13px] text-ink-muted">
                No payment accounts are connected yet.
              </p>
            ) : null}
            <Link
              href="/dashboard/accounts"
              className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-brand-link transition-colors hover:text-brand-link-hover"
            >
              Manage accounts
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recorded activity</CardTitle>
            <CardDescription>
              The most recent notifications in this range
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recent.length === 0 ? (
              <p className="text-[13px] text-ink-muted">
                Nothing was recorded in this range.
              </p>
            ) : (
              recent.slice(0, 5).map((payment: MockPayment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-[12px] text-ink-soft">
                      {payment.reference}
                    </span>
                    <span className="block text-[12px] text-ink-muted">
                      {payment.customerName ?? "Unknown sender"}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-[13px] font-medium text-ink">
                      {formatBDT(payment.amount)}
                    </span>
                    <PaymentStatusBadge status={payment.status} showTooltip={false} />
                  </span>
                </div>
              ))
            )}
            <Link
              href="/dashboard/payments"
              className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-brand-link transition-colors hover:text-brand-link-hover"
            >
              View all payments
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent payments table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Recent payments</CardTitle>
            <CardDescription>
              The latest recorded notifications in {rangeLabel.toLowerCase()}
            </CardDescription>
          </div>
          <Link href="/dashboard/payments">
            <Button variant="outline" size="sm">
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="px-0 py-0">
          {recent.length === 0 ? (
            <p className="px-5 py-12 text-center text-[13px] text-ink-muted">
              No payments were recorded in this range.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Recorded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-[13px] font-medium text-ink">
                      {payment.reference}
                    </TableCell>
                    <TableCell>
                      <ProviderBadge provider={payment.provider} size="sm" />
                    </TableCell>
                    <TableCell>
                      <span className="block text-ink-soft">
                        {payment.customerName ?? "Unknown sender"}
                      </span>
                      {payment.customerPhone ? (
                        <span className="block text-[12px] text-ink-muted">
                          {payment.customerPhone}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right font-medium text-ink">
                      {formatBDT(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="text-right text-[13px] text-ink-muted">
                      {formatDateTimeShort(payment.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

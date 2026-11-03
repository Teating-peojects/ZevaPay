"use client";

import * as React from "react";
import {
  ArrowDownRight,
  CircleCheck,
  CircleX,
  Download,
  FileSpreadsheet,
  Landmark,
  ListChecks,
  Receipt,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  MethodSplitChart,
  RevenueChart,
  VolumeChart,
} from "@/components/shared/revenue-chart";
import { ProviderBadge } from "@/components/shared/provider-badge";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { Input, Label, Select } from "@/components/ui/form";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dateRangeBounds, type DateRange } from "@/lib/date-range";
import { downloadCsv, exportDateStamp } from "@/lib/download";
import { formatBDT, formatNumber, REFERENCE_NOW } from "@/lib/format";
import {
  mockExportReportCsv,
  mockReportAccounts,
  mockReportFees,
  mockReportMethods,
  mockReportReconciliation,
  mockReportSeries,
  mockReportSummary,
} from "@/mock";

/** The date windows the report offers. */
const RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

type ReportRange = DateRange | "custom";

/** The custom window the reader picks, as two `YYYY-MM-DD` strings. */
interface CustomRange {
  from: string;
  to: string;
}

/**
 * The reports screen.
 *
 * Every figure here comes from the mock layer. The page is careful about one
 * thing in particular: money that ZevaPay has *recorded from a notification*
 * is never presented as money that has been *settled by the provider*, and
 * the difference between the two is shown rather than hidden.
 */
export default function ReportsPage() {
  const { toast } = useToast();
  const [range, setRange] = React.useState<ReportRange>("30d");
  const [custom, setCustom] = React.useState<CustomRange | null>(null);
  const [customDraft, setCustomDraft] = React.useState<CustomRange>({
    from: "",
    to: "",
  });
  const [customError, setCustomError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState("overview");

  // The window the report covers, derived from the range control.
  const window = React.useMemo(() => {
    if (range === "custom") {
      if (!custom) return dateRangeBounds("30d", REFERENCE_NOW);
      return {
        from: custom.from
          ? new Date(`${custom.from}T00:00:00`).toISOString()
          : undefined,
        to: custom.to
          ? new Date(`${custom.to}T23:59:59`).toISOString()
          : undefined,
      };
    }
    return dateRangeBounds(range, REFERENCE_NOW);
  }, [range, custom]);

  const summary = React.useMemo(() => mockReportSummary(window), [window]);
  const series = React.useMemo(() => mockReportSeries(window), [window]);
  const methods = React.useMemo(() => mockReportMethods(window), [window]);
  const accountRows = React.useMemo(
    () => mockReportAccounts(window),
    [window],
  );
  const fees = React.useMemo(() => mockReportFees(), []);
  const reconciliation = React.useMemo(() => mockReportReconciliation(), []);

  const rangeLabel =
    range === "custom" && custom
      ? `${custom.from || "the start"} to ${custom.to || "today"}`
      : (RANGE_OPTIONS.find((option) => option.value === range)?.label ??
        "Last 30 days");

  function handleApplyCustom() {
    const from = customDraft.from.trim();
    const to = customDraft.to.trim();

    if (!from && !to) {
      setCustomError("Choose at least one date.");
      return;
    }
    if (from && to && from > to) {
      setCustomError("The start date must come before the end date.");
      return;
    }

    setCustomError(null);
    setCustom({ from, to });
    setRange("custom");
  }

  function handleExportCsv() {
    const { header, rows } = mockExportReportCsv(window);
    downloadCsv(
      `zevapay-report-${exportDateStamp(REFERENCE_NOW)}.csv`,
      header,
      rows,
    );
    toast({
      title: "CSV downloaded",
      description: `${rows.length} rows were written to the file.`,
      tone: "success",
    });
  }

  function handleExportExcel() {
    toast({
      title: "No Excel file was generated",
      description:
        "The backend has no spreadsheet service, so there is nothing to export to .xlsx. The CSV button writes the same data as a file you can open in a spreadsheet.",
      tone: "warning",
    });
  }

  const totalFees = fees.reduce((sum, row) => sum + row.fee, 0);
  const totalGross = fees.reduce((sum, row) => sum + row.gross, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        description="Revenue, fees and reconciliation for your business."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DemoBadge label="Demo reports" />
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="size-3.5" aria-hidden="true" />
              Export CSV
            </Button>
            <Button size="sm" onClick={handleExportExcel}>
              <FileSpreadsheet className="size-3.5" aria-hidden="true" />
              Export Excel
            </Button>
          </div>
        }
      />

      <DemoNotice title="Sample reports">
        These figures are derived from the demo dataset, not from your real
        account. The backend has no reporting model yet — a merchant&apos;s own
        transaction data would be the source once it does.
      </DemoNotice>

      {/* Date range */}
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-full sm:w-48">
                <Label htmlFor="report-range">Date range</Label>
                <Select
                  id="report-range"
                  value={range}
                  onChange={(event) =>
                    setRange(event.target.value as ReportRange)
                  }
                >
                  {RANGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  <option value="custom">Custom range</option>
                </Select>
              </div>

              {range === "custom" ? (
                <div className="flex flex-wrap items-end gap-2">
                  <div>
                    <Label htmlFor="report-from">From</Label>
                    <Input
                      id="report-from"
                      type="date"
                      value={customDraft.from}
                      onChange={(event) =>
                        setCustomDraft((current) => ({
                          ...current,
                          from: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="report-to">To</Label>
                    <Input
                      id="report-to"
                      type="date"
                      value={customDraft.to}
                      onChange={(event) =>
                        setCustomDraft((current) => ({
                          ...current,
                          to: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button type="button" onClick={handleApplyCustom}>
                    Apply
                  </Button>
                </div>
              ) : null}
            </div>

            <p className="text-[13px] text-ink-muted">
              Showing <span className="font-medium text-ink">{rangeLabel}</span>
            </p>
          </div>

          {customError ? (
            <Alert tone="danger">{customError}</Alert>
          ) : null}
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue confirmed from notifications"
          value={formatBDT(summary.confirmedRevenue)}
          hint={`${formatNumber(summary.confirmedCount)} payments recorded`}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Awaiting a decision"
          value={formatBDT(summary.pendingRevenue)}
          hint={`${formatNumber(summary.pendingCount)} payments not yet decided`}
          icon={RefreshCw}
          tone="warning"
        />
        <StatCard
          label="Transactions"
          value={formatNumber(summary.transactionCount)}
          hint={`Average ${formatBDT(Math.round(summary.averageAmount))} per confirmed payment`}
          icon={Receipt}
        />
        <StatCard
          label="Refunded"
          value={formatBDT(summary.refunded)}
          hint="A refund is not a provider confirmation either"
          icon={ArrowDownRight}
        />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "overview", label: "Overview", icon: TrendingUp },
          { id: "methods", label: "Payment methods", icon: Wallet },
          { id: "accounts", label: "Accounts", icon: Landmark },
          { id: "fees", label: "Fees", icon: Receipt },
          { id: "outcomes", label: "Success and failure", icon: ListChecks },
          { id: "reconciliation", label: "Reconciliation", icon: RefreshCw },
        ]}
      />

      <TabPanel id="overview" value={tab}>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue over time</CardTitle>
              <CardDescription>
                Money recorded from notifications, in BDT.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={series} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction volume</CardTitle>
              <CardDescription>
                How many payments were recorded each day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VolumeChart data={series.map((point) => ({
                label: point.label,
                value: point.transactions,
              }))} />
            </CardContent>
          </Card>
        </div>
      </TabPanel>

      <TabPanel id="methods" value={tab}>
        <Card>
          <CardHeader>
            <CardTitle>Payment methods</CardTitle>
            <CardDescription>
              Where the money came from, by provider.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {methods.length === 0 ? (
              <p className="text-[13px] text-ink-muted">
                No confirmed payments in this period.
              </p>
            ) : (
              <MethodSplitChart
                data={methods.map((row) => ({
                  method: row.method,
                  amount: row.amount,
                  count: row.count,
                }))}
              />
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {methods.map((row) => (
                    <TableRow key={row.method}>
                      <TableCell>
                        <ProviderBadge provider={row.method} />
                      </TableCell>
                      <TableCell className="text-right text-[13px] text-ink-soft">
                        {formatNumber(row.count)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-ink">
                        {formatBDT(row.amount)}
                      </TableCell>
                      <TableCell className="text-right text-[13px] text-ink-soft">
                        {formatBDT(Math.round(row.amount / Math.max(1, row.count)))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel id="accounts" value={tab}>
        <Card>
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>
              Which account each payment landed in. Numbers stay masked.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-10 text-center text-[13px] text-ink-muted"
                      >
                        No confirmed payments in this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    accountRows.map((row) => (
                      <TableRow key={row.accountId}>
                        <TableCell>
                          <span className="block text-[13px] font-medium text-ink">
                            {row.label}
                          </span>
                          <span className="block font-mono text-[12px] text-ink-muted">
                            {row.accountNumber}
                          </span>
                        </TableCell>
                        <TableCell>
                          <ProviderBadge provider={row.provider} />
                        </TableCell>
                        <TableCell className="text-right text-[13px] text-ink-soft">
                          {formatNumber(row.count)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-ink">
                          {formatBDT(row.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel id="fees" value={tab}>
        <Card>
          <CardHeader>
            <CardTitle>Fees</CardTitle>
            <CardDescription>
              What each provider would take out of the money it collected.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Alert tone="warning" title="Demonstration figures">
              The backend has no fee model and the API does not publish provider
              rates. The percentages below are illustrative — check your
              provider agreement for the real numbers.
            </Alert>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell className="text-[13px] font-medium text-ink">
                        {row.label}
                      </TableCell>
                      <TableCell className="text-right text-[13px] text-ink-soft">
                        {formatNumber(row.transactions)}
                      </TableCell>
                      <TableCell className="text-right text-[13px] text-ink-soft">
                        {formatBDT(row.gross)}
                      </TableCell>
                      <TableCell className="text-right text-[13px] text-danger-fg">
                        −{formatBDT(row.fee)}
                      </TableCell>
                      <TableCell className="text-right text-[13px] text-ink-soft">
                        {row.rate.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right font-medium text-ink">
                        {formatBDT(row.net)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-semibold text-ink">Total</TableCell>
                    <TableCell className="text-right text-[13px] text-ink-soft">
                      {formatNumber(
                        fees.reduce((sum, row) => sum + row.transactions, 0),
                      )}
                    </TableCell>
                    <TableCell className="text-right text-[13px] font-medium text-ink">
                      {formatBDT(totalGross)}
                    </TableCell>
                    <TableCell className="text-right text-[13px] font-medium text-danger-fg">
                      −{formatBDT(totalFees)}
                    </TableCell>
                    <TableCell className="text-right text-[13px] text-ink-soft">
                      {totalGross > 0
                        ? ((totalFees / totalGross) * 100).toFixed(2)
                        : "0.00"}
                      %
                    </TableCell>
                    <TableCell className="text-right font-semibold text-ink">
                      {formatBDT(totalGross - totalFees)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel id="outcomes" value={tab}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Success and failure</CardTitle>
              <CardDescription>
                How many payments were decided, and how they went.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-elevated px-4 py-3">
                <span className="flex items-center gap-2 text-[13px] text-ink-soft">
                  <CircleCheck className="size-4 text-success-fg" aria-hidden="true" />
                  Confirmed from a notification
                </span>
                <span className="text-[13px] font-semibold text-ink">
                  {formatNumber(summary.confirmedCount)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-elevated px-4 py-3">
                <span className="flex items-center gap-2 text-[13px] text-ink-soft">
                  <CircleX className="size-4 text-danger-fg" aria-hidden="true" />
                  Verification failed
                </span>
                <span className="text-[13px] font-semibold text-ink">
                  {formatNumber(summary.failedCount)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-elevated px-4 py-3">
                <span className="flex items-center gap-2 text-[13px] text-ink-soft">
                  <RefreshCw className="size-4 text-warning-fg" aria-hidden="true" />
                  Still awaiting a decision
                </span>
                <span className="text-[13px] font-semibold text-ink">
                  {formatNumber(summary.pendingCount)}
                </span>
              </div>

              <div className="mt-2 flex flex-col gap-2.5">
                <div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-ink-muted">Success rate</span>
                    <span className="font-medium text-ink">
                      {summary.successRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-elevated">
                    <div
                      className="h-full rounded-full bg-success-500"
                      style={{ width: `${Math.min(100, summary.successRate)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-ink-muted">Failure rate</span>
                    <span className="font-medium text-ink">
                      {summary.failureRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-elevated">
                    <div
                      className="h-full rounded-full bg-danger-500"
                      style={{ width: `${Math.min(100, summary.failureRate)}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-[12px] leading-relaxed text-ink-muted">
                A payment counts as successful here when ZevaPay recorded a
                notification that matched it. That is not a settlement check
                with the provider — the reconciliation tab is where that
                difference shows up.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Refund and adjustment</CardTitle>
              <CardDescription>
                Money that came back out.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-elevated px-4 py-3">
                <span className="text-[13px] text-ink-soft">
                  Refunded in this period
                </span>
                <span className="text-[13px] font-semibold text-ink">
                  {formatBDT(summary.refunded)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-elevated px-4 py-3">
                <span className="text-[13px] text-ink-soft">
                  Average confirmed payment
                </span>
                <span className="text-[13px] font-semibold text-ink">
                  {formatBDT(Math.round(summary.averageAmount))}
                </span>
              </div>

              <Alert tone="info">
                A refund recorded here is a request ZevaPay logged. It is not
                a confirmation that the provider moved the money back.
              </Alert>
            </CardContent>
          </Card>
        </div>
      </TabPanel>

      <TabPanel id="reconciliation" value={tab}>
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation</CardTitle>
            <CardDescription>
              What ZevaPay recorded against what the provider statement says.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Alert tone="info" title="What a difference means">
              ZevaPay records a payment when it reads a matching notification.
              A provider statement confirms the money from the other side. The
              two do not always line up on the same day — a difference is
              normally money still in flight, not money that was lost.
            </Alert>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Recorded</TableHead>
                    <TableHead className="text-right">Settled</TableHead>
                    <TableHead className="text-right">Difference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciliation.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-[13px] font-medium text-ink">
                        {row.period}
                      </TableCell>
                      <TableCell className="text-right text-[13px] text-ink-soft">
                        {formatBDT(row.recorded)}
                      </TableCell>
                      <TableCell className="text-right text-[13px] text-ink-soft">
                        {formatBDT(row.settled)}
                      </TableCell>
                      <TableCell
                        className={`text-right text-[13px] font-medium ${
                          row.difference > 0 ? "text-warning-fg" : "text-ink-soft"
                        }`}
                      >
                        {row.difference > 0 ? `−${formatBDT(row.difference)}` : formatBDT(0)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          tone={row.status === "BALANCED" ? "success" : "warning"}
                          dot
                        >
                          {row.status === "BALANCED" ? "Balanced" : "Difference"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[280px] text-[12px] text-ink-muted">
                        {row.note}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabPanel>
    </div>
  );
}

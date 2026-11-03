"use client";

import * as React from "react";
import { Activity, Code2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
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
import { Drawer } from "@/components/ui/drawer";
import { useToast } from "@/components/ui/toast";
import { formatDateTime, formatNumber } from "@/lib/format";
import { useMockTable } from "@/hooks/use-mock-table";
import {
  mockFetchApiLogs,
  type MockApiLog,
} from "@/mock";
import { ApiKeysPanel } from "./api-keys-panel";

/**
 * Fixed API usage per day, for the demo chart.
 *
 * The numbers are hard-coded rather than derived from the clock, so the chart
 * looks the same every time the page is opened.
 */
const USAGE_SERIES = [
  { label: "Oct 20", requests: 412, errors: 6 },
  { label: "Oct 22", requests: 508, errors: 3 },
  { label: "Oct 24", requests: 447, errors: 9 },
  { label: "Oct 26", requests: 623, errors: 4 },
  { label: "Oct 28", requests: 581, errors: 2 },
  { label: "Oct 30", requests: 704, errors: 5 },
  { label: "Nov 1", requests: 668, errors: 3 },
  { label: "Nov 2", requests: 739, errors: 4 },
];

/** The request budget shown above the chart. */
const MONTHLY_QUOTA = 10_000;

function statusTone(statusCode: number) {
  if (statusCode >= 500) return "danger" as const;
  if (statusCode >= 400) return "warning" as const;
  if (statusCode >= 200 && statusCode < 300) return "success" as const;
  return "neutral" as const;
}

/**
 * The API and developers screen.
 *
 * The API keys are real — the backend has endpoints for them. The usage
 * chart and the request log are sample data, and the page says so, because
 * the backend records no per-merchant request log yet.
 */
export default function DevelopersPage() {
  const { toast } = useToast();
  const [viewing, setViewing] = React.useState<MockApiLog | null>(null);

  const table = useMockTable<MockApiLog>({
    fetch: (options) => mockFetchApiLogs(options),
    pageSize: 10,
    initialSort: { sort: "createdAt", order: "desc" },
  });

  const totalRequests = USAGE_SERIES.reduce(
    (sum, point) => sum + point.requests,
    0,
  );
  const totalErrors = USAGE_SERIES.reduce(
    (sum, point) => sum + point.errors,
    0,
  );
  const usageShare = Math.round((totalRequests / MONTHLY_QUOTA) * 100);

  function handleCopyExample() {
    const example = `curl https://api.zevapay.test/api/v1/payments \\
  -H "Authorization: Bearer zp_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 2450, "currency": "BDT", "provider": "BKASH"}'`;

    void navigator.clipboard
      ?.writeText(example)
      .then(() => {
        toast({
          title: "Example copied",
          description: "The curl command is on your clipboard.",
          tone: "success",
        });
      })
      .catch(() => {
        toast({
          title: "Could not copy",
          description: "Select the example and copy it manually.",
          tone: "error",
        });
      });
  }

  const columns: Column<MockApiLog>[] = [
    {
      key: "method",
      header: "Method",
      render: (log) => (
        <span className="font-mono text-[12px] font-semibold text-ink">
          {log.method}
        </span>
      ),
      sortValue: (log) => log.method,
    },
    {
      key: "path",
      header: "Path",
      render: (log) => (
        <span className="block max-w-[320px] truncate font-mono text-[12px] text-ink-soft">
          {log.path}
        </span>
      ),
      sortValue: (log) => log.path,
    },
    {
      key: "status",
      header: "Status",
      render: (log) => (
        <Badge tone={statusTone(log.statusCode)} dot>
          {log.statusCode}
        </Badge>
      ),
      sortValue: (log) => log.statusCode,
    },
    {
      key: "duration",
      header: "Duration",
      align: "right",
      render: (log) => (
        <span className="text-[13px] text-ink-soft">
          {log.durationMs} ms
        </span>
      ),
      sortValue: (log) => log.durationMs,
    },
    {
      key: "request",
      header: "Request ID",
      render: (log) => (
        <span className="font-mono text-[12px] text-ink-muted">
          {log.requestId}
        </span>
      ),
      sortValue: (log) => log.requestId,
    },
    {
      key: "when",
      header: "When",
      align: "right",
      render: (log) => (
        <span className="text-[13px] text-ink-muted">
          {formatDateTime(log.createdAt)}
        </span>
      ),
      sortValue: (log) => log.createdAt,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="API & Developers"
        description="Keys, usage and request history for your integration."
        actions={
          <div className="flex items-center gap-2">
            <DemoBadge label="Demo usage" />
          </div>
        }
      />

      <DemoNotice title="Keys are real, usage is a sample">
        API keys come from the live API — creating and revoking a key is a real
        request. The usage chart and the request log below are sample records:
        the backend does not keep a per-merchant request log yet, so nothing
        here is a measurement of your traffic.
      </DemoNotice>

      <Alert tone="info" title="Live data">
        The keys below are issued by the API. Creating one returns the secret
        exactly once; after that only the prefix is ever visible.
      </Alert>

      {/* Keys — the real API */}
      <ApiKeysPanel />

      {/* Usage */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>API usage</CardTitle>
            <CardDescription>
              Requests per day over the last two weeks.
            </CardDescription>
          </div>
          <Badge tone="info">Sample data</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-line bg-elevated px-4 py-3">
              <p className="text-[12px] text-ink-muted">Requests</p>
              <p className="mt-0.5 text-lg font-semibold text-ink">
                {formatNumber(totalRequests)}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-elevated px-4 py-3">
              <p className="text-[12px] text-ink-muted">Errors</p>
              <p className="mt-0.5 text-lg font-semibold text-ink">
                {formatNumber(totalErrors)}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-elevated px-4 py-3">
              <p className="text-[12px] text-ink-muted">Monthly quota used</p>
              <p className="mt-0.5 text-lg font-semibold text-ink">
                {usageShare}%
              </p>
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
                role="img"
                aria-label={`${usageShare}% of the monthly quota used`}
              >
                <div
                  className="h-full rounded-full bg-brand-solid"
                  style={{ width: `${Math.min(100, usageShare)}%` }}
                />
              </div>
            </div>
          </div>

          <div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={USAGE_SERIES}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(15 23 42 / 0.07)",
                    fontSize: 13,
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={32}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: "#475569" }}
                />
                <Bar
                  dataKey="requests"
                  name="Requests"
                  fill="#223b67"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={26}
                />
                <Bar
                  dataKey="errors"
                  name="Errors"
                  fill="#ef4444"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={26}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[12px] leading-relaxed text-ink-muted">
            The chart is a fixed sample series. It does not measure your
            traffic, and the quota figure above is a demonstration of the
            shape rather than a real allowance on your plan.
          </p>
        </CardContent>
      </Card>

      {/* Quick start */}
      <Card>
        <CardHeader>
          <CardTitle>Make your first request</CardTitle>
          <CardDescription>
            Send your API key as a bearer token.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <pre className="overflow-x-auto rounded-lg border border-line bg-elevated px-4 py-3 font-mono text-[12px] leading-relaxed text-ink-soft">
{`curl https://api.zevapay.test/api/v1/payments \\
  -H "Authorization: Bearer zp_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 2450, "currency": "BDT", "provider": "BKASH"}'`}
          </pre>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyExample}>
              <Code2 className="size-3.5" aria-hidden="true" />
              Copy example
            </Button>
            <span className="text-[12px] text-ink-muted">
              The host above is a placeholder — the real base URL is shown in
              your dashboard settings.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Request log */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-ink-muted" aria-hidden="true" />
          <h2 className="text-[15px] font-semibold text-ink">Request log</h2>
          <DemoBadge label="Sample logs" />
        </div>

        <DataTable
          columns={columns}
          rows={table.rows}
          loading={table.loading}
          error={table.error ?? undefined}
          showSearch
          searchPlaceholder="Search by path, request ID or IP"
          filters={[
            {
              id: "method",
              label: "All methods",
              options: [
                { value: "GET", label: "GET" },
                { value: "POST", label: "POST" },
                { value: "PATCH", label: "PATCH" },
                { value: "DELETE", label: "DELETE" },
              ],
            },
          ]}
          emptyTitle="No requests logged"
          emptyDescription="Requests you make with your API key will be listed here."
          emptyIcon={Activity}
          onRowClick={(log) => setViewing(log)}
          hideExport
          server={{
            total: table.total,
            page: table.page,
            pageSize: table.pageSize,
            query: table.query,
            filters: table.filters,
            sort: table.sort,
            onPageChange: table.setPage,
            onQueryChange: table.setQuery,
            onFilterChange: table.setFilter,
            onSortChange: table.setSort,
          }}
        />
      </div>

      {/* Request detail */}
      <Drawer
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing ? `${viewing.method} ${viewing.path}` : "Request"}
        description={viewing?.requestId}
        size="md"
        footer={
          <Button variant="outline" onClick={() => setViewing(null)} type="button">
            Close
          </Button>
        }
      >
        {viewing ? (
          <div className="flex flex-col gap-4">
            <Alert tone="info" title="A sample record">
              This entry is fixed demo data. It is not a log of a request you
              made.
            </Alert>

            <dl className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Status</dt>
                <dd>
                  <Badge tone={statusTone(viewing.statusCode)} dot>
                    {viewing.statusCode}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Duration</dt>
                <dd className="font-medium text-ink">
                  {viewing.durationMs} ms
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">IP address</dt>
                <dd className="font-mono text-[12px] text-ink">
                  {viewing.ipAddress}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Request ID</dt>
                <dd className="font-mono text-[12px] text-ink">
                  {viewing.requestId}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">When</dt>
                <dd className="font-medium text-ink">
                  {formatDateTime(viewing.createdAt)}
                </dd>
              </div>
              {viewing.errorCode ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">Error code</dt>
                  <dd className="font-mono text-[12px] text-danger-fg">
                    {viewing.errorCode}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

"use client";

import * as React from "react";
import { Code2, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { Drawer } from "@/components/ui/drawer";
import { formatDateTime, formatNumber } from "@/lib/format";
import { useMockTable } from "@/hooks/use-mock-table";
import { mockFetchApiLogs, type MockApiLog } from "@/mock";

/**
 * API request logs, across every merchant.
 *
 * The backend has no request log of its own, so this screen reads from the
 * mock layer. It is the platform-wide view — a merchant sees only their own
 * traffic on the developers page.
 */
export default function AdminApiLogsPage() {
  const [selected, setSelected] = React.useState<MockApiLog | null>(null);

  const table = useMockTable<MockApiLog>({
    fetch: (options) => mockFetchApiLogs(options),
    pageSize: 10,
    initialSort: { sort: "createdAt", order: "desc" },
    // The admin console asks for every merchant's traffic at once.
    extra: { merchantId: "*" },
  });

  const columns: Column<MockApiLog>[] = [
    {
      key: "method",
      header: "Method",
      render: (log) => (
        <Badge
          tone={
            log.method === "GET"
              ? "neutral"
              : log.method === "POST"
                ? "info"
                : log.method === "PATCH"
                  ? "warning"
                  : "danger"
          }
        >
          {log.method}
        </Badge>
      ),
      sortValue: (log) => log.method,
    },
    {
      key: "path",
      header: "Path",
      render: (log) => (
        <span className="block max-w-[280px] truncate font-mono text-[12px] font-medium text-ink">
          {log.path}
        </span>
      ),
      sortValue: (log) => log.path,
    },
    {
      key: "merchantId",
      header: "Merchant",
      render: (log) => (
        <span className="font-mono text-[12px] text-ink-soft">
          {log.merchantId}
        </span>
      ),
      sortValue: (log) => log.merchantId,
    },
    {
      key: "statusCode",
      header: "Status",
      align: "right",
      render: (log) => (
        <span
          className={
            log.statusCode >= 500
              ? "text-[13px] font-medium text-danger-fg"
              : log.statusCode >= 400
                ? "text-[13px] font-medium text-warning-fg"
                : "text-[13px] text-ink-soft"
          }
        >
          {log.statusCode}
        </span>
      ),
      sortValue: (log) => log.statusCode,
    },
    {
      key: "duration",
      header: "Duration",
      align: "right",
      render: (log) => (
        <span className="text-[13px] text-ink-muted">{log.durationMs} ms</span>
      ),
      sortValue: (log) => log.durationMs,
    },
    {
      key: "ipAddress",
      header: "IP address",
      align: "right",
      render: (log) => (
        <span className="font-mono text-[12px] text-ink-muted">
          {log.ipAddress}
        </span>
      ),
      sortValue: (log) => log.ipAddress,
    },
    {
      key: "createdAt",
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

  const rows = table.rows;
  const failures = rows.filter((row) => row.statusCode >= 400).length;
  const serverErrors = rows.filter((row) => row.statusCode >= 500).length;
  const averageDuration =
    rows.length > 0
      ? Math.round(
          rows.reduce((sum, row) => sum + row.durationMs, 0) / rows.length,
        )
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="API logs"
        description="Every request made to the ZevaPay API, across all merchants."
        actions={<DemoBadge label="Demo logs" />}
      />

      <DemoNotice title="Sample request log">
        The backend does not keep a request log, so the entries on this page
        are sample records covering every merchant on the platform. Nothing
        here is a live request.
      </DemoNotice>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Requests on this page"
          value={formatNumber(rows.length)}
          hint="Newest first"
          icon={Code2}
        />
        <StatCard
          label="Failed requests"
          value={formatNumber(failures)}
          hint="Status 400 or above"
          icon={Code2}
          tone={failures > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Server errors"
          value={formatNumber(serverErrors)}
          hint="Status 500 or above"
          icon={Code2}
          tone={serverErrors > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Average duration"
          value={`${averageDuration} ms`}
          hint="Across the requests on this page"
          icon={Code2}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={table.loading}
        error={table.error ?? undefined}
        showSearch
        searchPlaceholder="Search by path, request ID, or IP"
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
          {
            id: "statusCode",
            label: "All statuses",
            options: [
              { value: "200", label: "200 OK" },
              { value: "201", label: "201 Created" },
              { value: "400", label: "400 Bad request" },
              { value: "422", label: "422 Unprocessable" },
              { value: "429", label: "429 Rate limited" },
              { value: "500", label: "500 Server error" },
            ],
          },
        ]}
        emptyTitle="No requests logged"
        emptyDescription="Requests appear here once the platform records traffic."
        emptyIcon={Code2}
        actions={(log) => [
          {
            label: "View request",
            icon: Eye,
            onSelect: () => setSelected(log),
          },
        ]}
        onRowClick={(log) => setSelected(log)}
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

      <Drawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Request"
        description={selected ? `${selected.method} ${selected.path}` : undefined}
        size="md"
        footer={
          <Button variant="outline" onClick={() => setSelected(null)} type="button">
            Close
          </Button>
        }
      >
        {selected ? (
          <div className="flex flex-col gap-5">
            <dl className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Request ID</dt>
                <dd className="font-mono font-medium text-ink">
                  {selected.requestId}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Merchant</dt>
                <dd className="font-mono font-medium text-ink">
                  {selected.merchantId}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Status</dt>
                <dd>
                  <Badge
                    tone={
                      selected.statusCode >= 500
                        ? "danger"
                        : selected.statusCode >= 400
                          ? "warning"
                          : "success"
                    }
                    dot
                  >
                    {selected.statusCode}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Duration</dt>
                <dd className="font-medium text-ink">{selected.durationMs} ms</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">IP address</dt>
                <dd className="font-mono font-medium text-ink">
                  {selected.ipAddress}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Error code</dt>
                <dd className="font-mono font-medium text-ink">
                  {selected.errorCode ?? "None"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">When</dt>
                <dd className="font-medium text-ink">
                  {formatDateTime(selected.createdAt)}
                </dd>
              </div>
            </dl>

            <p className="text-[12px] leading-relaxed text-ink-muted">
              The backend keeps no request bodies, so only the metadata above
              is shown. The identifiers are sample values.
            </p>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

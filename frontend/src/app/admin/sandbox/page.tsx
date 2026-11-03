"use client";

import * as React from "react";
import { Eye, FlaskConical, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "@/components/ui/demo-badge";
import { Drawer } from "@/components/ui/drawer";
import { formatBDT, formatDateTime, formatNumber } from "@/lib/format";
import { useMockTable } from "@/hooks/use-mock-table";
import { mockFetchSandboxTransactions, type MockSandboxTransaction } from "@/mock";

const TONES = { success: "success", failed: "danger", pending: "warning" } as const;

export default function AdminSandboxPage() {
  const [selected, setSelected] = React.useState<MockSandboxTransaction | null>(null);
  const table = useMockTable<MockSandboxTransaction>({
    fetch: (options) => mockFetchSandboxTransactions(options),
    pageSize: 10,
    initialSort: { sort: "createdAt", order: "desc" },
  });

  const columns: Column<MockSandboxTransaction>[] = [
    { key: "reference", header: "Reference", render: (row) => <span className="font-mono text-xs text-ink">{row.reference}</span>, sortValue: (row) => row.reference },
    { key: "scenario", header: "Outcome", render: (row) => <Badge tone={TONES[row.scenario]}>{row.scenario}</Badge>, sortValue: (row) => row.scenario },
    { key: "provider", header: "Provider", render: (row) => <span className="text-sm text-ink-soft">{row.provider}</span>, sortValue: (row) => row.provider },
    { key: "amount", header: "Amount", align: "right", render: (row) => <span className="text-sm font-medium text-ink">{formatBDT(row.amount)}</span>, sortValue: (row) => row.amount },
    { key: "createdAt", header: "Created", align: "right", render: (row) => <span className="text-xs text-ink-muted">{formatDateTime(row.createdAt)}</span>, sortValue: (row) => row.createdAt },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Sandbox monitoring" description="Review simulated payment activity across the platform." actions={<Button variant="outline" onClick={table.refresh}><RotateCcw className="size-4" />Refresh sample</Button>} />
      <DemoNotice title="Isolated sample activity">These fixed records are not live merchant payments. No provider or merchant endpoint is contacted.</DemoNotice>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Sample runs" value={formatNumber(table.total)} hint="In the demo dataset" icon={FlaskConical} />
        <StatCard label="Providers" value={formatNumber(new Set(table.rows.map((row) => row.provider)).size)} hint="Represented on this page" icon={FlaskConical} />
        <StatCard label="Outcomes" value={formatNumber(new Set(table.rows.map((row) => row.scenario)).size)} hint="Success, pending, failed" icon={FlaskConical} />
      </div>
      <DataTable
        columns={columns}
        rows={table.rows}
        loading={table.loading}
        error={table.error ?? undefined}
        showSearch
        searchPlaceholder="Search reference, ID, or provider"
        filters={[{ id: "status", label: "All outcomes", options: [{ value: "success", label: "Success" }, { value: "pending", label: "Pending" }, { value: "failed", label: "Failed" }] }]}
        emptyTitle="No sandbox records"
        emptyDescription="Run a demo scenario from a merchant sandbox to add sample activity."
        emptyIcon={FlaskConical}
        actions={(row) => [{ label: "Inspect run", icon: Eye, onSelect: () => setSelected(row) }]}
        onRowClick={setSelected}
        server={{ total: table.total, page: table.page, pageSize: table.pageSize, query: table.query, filters: table.filters, sort: table.sort, onPageChange: table.setPage, onQueryChange: table.setQuery, onFilterChange: table.setFilter, onSortChange: table.setSort }}
      />
      <Drawer open={selected !== null} onClose={() => setSelected(null)} title="Sandbox run" description={selected?.reference} footer={<Button variant="outline" onClick={() => setSelected(null)}>Close</Button>}>
        {selected ? <div className="flex flex-col gap-5"><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-ink-muted">Outcome</p><Badge tone={TONES[selected.scenario]}>{selected.scenario}</Badge></div><div><p className="text-xs text-ink-muted">Amount</p><p className="mt-1 font-medium text-ink">{formatBDT(selected.amount)}</p></div><div><p className="text-xs text-ink-muted">Provider</p><p className="mt-1 text-ink">{selected.provider}</p></div><div><p className="text-xs text-ink-muted">Created</p><p className="mt-1 text-ink">{formatDateTime(selected.createdAt)}</p></div></div><section><h2 className="text-sm font-semibold text-ink">Request</h2><pre className="mt-2 overflow-x-auto rounded-lg bg-sunken p-3 text-xs leading-relaxed text-ink-soft">{selected.request}</pre></section><section><h2 className="text-sm font-semibold text-ink">Response</h2><pre className="mt-2 overflow-x-auto rounded-lg bg-sunken p-3 text-xs leading-relaxed text-ink-soft">{selected.response}</pre></section></div> : null}
      </Drawer>
    </div>
  );
}

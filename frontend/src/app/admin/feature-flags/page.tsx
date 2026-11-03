"use client";

import * as React from "react";
import { Flag, Power, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { Drawer } from "@/components/ui/drawer";
import { useToast } from "@/components/ui/toast";
import { formatNumber, formatPercent } from "@/lib/format";
import { useMockTable } from "@/hooks/use-mock-table";
import {
  mockFetchFeatureFlags,
  mockUpdateFeatureFlag,
  type MockFeatureFlag,
} from "@/mock";

/**
 * The platform's feature flags.
 *
 * The backend has no flag store, so this page reads from the mock layer.
 * Turning a flag on or off changes what this page shows — it does not change
 * what the running platform does, because nothing reads the flag.
 */

export default function AdminFeatureFlagsPage() {
  const { toast } = useToast();
  const [selected, setSelected] = React.useState<MockFeatureFlag | null>(null);

  const table = useMockTable<MockFeatureFlag>({
    fetch: (options) => mockFetchFeatureFlags(options),
    pageSize: 10,
    initialSort: { sort: "name", order: "asc" },
  });

  function handleToggle(flag: MockFeatureFlag, enabled: boolean) {
    mockUpdateFeatureFlag(flag.id, {
      enabled,
      rolloutPercent: enabled ? (flag.rolloutPercent || 100) : 0,
      audience: enabled ? flag.audience : "None",
    });

    toast({
      title: enabled ? `“${flag.name}” turned on` : `“${flag.name}” turned off`,
      description: enabled
        ? "The flag was switched on in the demo layer. Nothing reads it yet, so no merchant behaviour changed."
        : "The flag was switched off in the demo layer. Nothing reads it yet, so no merchant behaviour changed.",
      tone: "warning",
    });

    setSelected(null);
    table.refresh();
  }

  function handleRollout(flag: MockFeatureFlag, rolloutPercent: number) {
    mockUpdateFeatureFlag(flag.id, {
      rolloutPercent,
      enabled: rolloutPercent > 0,
      audience:
        rolloutPercent >= 100
          ? "All merchants"
          : rolloutPercent > 0
            ? `Random ${rolloutPercent}% of merchants`
            : "None",
    });

    toast({
      title: "Rollout updated",
      description: `“${flag.name}” now reaches ${formatPercent(rolloutPercent, 0)} of merchants, in the demo layer only.`,
      tone: "warning",
    });

    setSelected(null);
    table.refresh();
  }

  const columns: Column<MockFeatureFlag>[] = [
    {
      key: "name",
      header: "Feature",
      render: (flag) => (
        <span className="block">
          <span className="block text-[13px] font-medium text-ink">
            {flag.name}
          </span>
          <span className="block text-[12px] text-ink-muted">
            {flag.description}
          </span>
        </span>
      ),
      sortValue: (flag) => flag.name,
    },
    {
      key: "audience",
      header: "Audience",
      render: (flag) => (
        <span className="text-[13px] text-ink-soft">{flag.audience}</span>
      ),
      sortValue: (flag) => flag.audience,
    },
    {
      key: "rolloutPercent",
      header: "Rollout",
      align: "right",
      render: (flag) => (
        <span className="text-[13px] text-ink-soft">
          {formatPercent(flag.rolloutPercent, 0)}
        </span>
      ),
      sortValue: (flag) => flag.rolloutPercent,
    },
    {
      key: "enabled",
      header: "Status",
      render: (flag) => (
        <Badge tone={flag.enabled ? "success" : "neutral"} dot>
          {flag.enabled ? "On" : "Off"}
        </Badge>
      ),
      sortValue: (flag) => (flag.enabled ? 1 : 0),
    },
  ];

  const rows = table.rows;
  const enabled = rows.filter((row) => row.enabled).length;
  const partial = rows.filter(
    (row) => row.enabled && row.rolloutPercent < 100,
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Feature flags"
        description="Which parts of ZevaPay are switched on, and for whom."
        actions={<DemoBadge label="Demo flags" />}
      />

      <DemoNotice title="Sample feature flags">
        The backend has no flag store, so these flags live in the demo layer.
        Flipping one changes what this page shows. Nothing on the running
        platform reads a flag, so no merchant sees a behaviour change.
      </DemoNotice>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Flags defined"
          value={formatNumber(rows.length)}
          hint="On this page"
          icon={Flag}
        />
        <StatCard
          label="Switched on"
          value={formatNumber(enabled)}
          hint="On this page"
          icon={Power}
          tone={enabled > 0 ? "success" : "neutral"}
        />
        <StatCard
          label="Partial rollout"
          value={formatNumber(partial)}
          hint="Reaching fewer than all merchants"
          icon={SlidersHorizontal}
          tone={partial > 0 ? "warning" : "neutral"}
        />
        <StatCard
          label="Flags in total"
          value={formatNumber(table.total)}
          hint="Across the platform"
          icon={Flag}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={table.loading}
        error={table.error ?? undefined}
        showSearch
        searchPlaceholder="Search by name, description, or audience"
        filters={[
          {
            id: "enabled",
            label: "All states",
            options: [
              { value: "true", label: "On" },
              { value: "false", label: "Off" },
            ],
          },
        ]}
        emptyTitle="No feature flags"
        emptyDescription="Flags appear here once they are defined."
        emptyIcon={Flag}
        actions={(flag) => [
          {
            label: flag.enabled ? "Turn off" : "Turn on",
            icon: Power,
            onSelect: () => handleToggle(flag, !flag.enabled),
          },
        ]}
        onRowClick={(flag) => setSelected(flag)}
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
        title={selected?.name ?? "Feature flag"}
        description="Feature flag"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)} type="button">
              Close
            </Button>
            {selected ? (
              <Button
                type="button"
                variant={selected.enabled ? "danger" : "primary"}
                onClick={() => handleToggle(selected, !selected.enabled)}
              >
                <Power className="size-4" aria-hidden="true" />
                {selected.enabled ? "Turn off" : "Turn on"}
              </Button>
            ) : null}
          </>
        }
      >
        {selected ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1 rounded-lg border border-line bg-elevated px-4 py-4">
              <span className="text-[13px] text-ink-muted">Feature</span>
              <span className="text-lg font-semibold tracking-tight text-ink">
                {selected.name}
              </span>
              <span className="text-[13px] text-ink-muted">
                {selected.description}
              </span>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge tone={selected.enabled ? "success" : "neutral"} dot>
                  {selected.enabled ? "On" : "Off"}
                </Badge>
                <Badge tone="neutral">{selected.audience}</Badge>
              </div>
            </div>

            <dl className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Flag ID</dt>
                <dd className="font-mono font-medium text-ink">{selected.id}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Rollout</dt>
                <dd className="font-medium text-ink">
                  {formatPercent(selected.rolloutPercent, 0)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Audience</dt>
                <dd className="font-medium text-ink">{selected.audience}</dd>
              </div>
            </dl>

            <div>
              <p className="mb-2 text-[12px] font-semibold tracking-wide uppercase text-ink-muted">
                Adjust rollout
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={selected.rolloutPercent}
                  onChange={(event) =>
                    handleRollout(selected, Number(event.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line-strong accent-brand-solid"
                  aria-label={`Rollout percentage for ${selected.name}`}
                />
                <span className="w-12 shrink-0 text-right text-[13px] font-medium text-ink">
                  {formatPercent(selected.rolloutPercent, 0)}
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
                Moving the slider changes the rollout in the demo layer and
                updates the audience label to match.
              </p>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

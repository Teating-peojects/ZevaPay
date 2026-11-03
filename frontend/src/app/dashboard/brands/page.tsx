"use client";

import * as React from "react";
import { Pencil, Plus, Store, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { Drawer } from "@/components/ui/drawer";
import { useToast } from "@/components/ui/toast";
import { formatBDT, formatDate, formatNumber } from "@/lib/format";
import { useMockTable } from "@/hooks/use-mock-table";
import {
  mockCreateBrand,
  mockDeleteBrand,
  mockFetchAccounts,
  mockFetchBrands,
  mockUpdateBrand,
  type MockBrand,
  type MockPaymentAccount,
} from "@/mock";
import { BrandForm, type BrandValues } from "./brand-form";

/**
 * The brands screen.
 *
 * One merchant can run several storefronts under the same account. Each brand
 * has its own look, its own accounts and its own webhook.
 */
export default function BrandsPage() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MockBrand | null>(null);
  const [viewing, setViewing] = React.useState<MockBrand | null>(null);
  const [pendingRemoval, setPendingRemoval] =
    React.useState<MockBrand | null>(null);
  const [removing, setRemoving] = React.useState(false);

  const table = useMockTable<MockBrand>({
    fetch: (options) => mockFetchBrands(options),
    pageSize: 10,
    initialSort: { sort: "createdAt", order: "desc" },
  });

  // The accounts a brand can be assigned. These are sample records too, so
  // the account numbers shown are already masked.
  const accounts = React.useMemo(() => brandsAccountOptions(), []);

  function handleSave(values: BrandValues) {
    if (editing) {
      mockUpdateBrand(editing.id, {
        name: values.name,
        websiteUrl: values.websiteUrl,
        color: values.color,
        logoText: values.logoText,
        logoColor: values.logoColor,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        checkoutTheme: values.checkoutTheme,
        status: values.status,
        webhookUrl: values.webhookUrl,
        accountIds: values.accountIds,
      });
    } else {
      mockCreateBrand({
        merchantId: "mer_001",
        name: values.name,
        websiteUrl: values.websiteUrl,
        color: values.color,
        logoText: values.logoText,
        logoColor: values.logoColor,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        accountIds: values.accountIds,
        checkoutTheme: values.checkoutTheme,
        status: values.status,
        webhookUrl: values.webhookUrl,
        apiKeyName: null,
      });
    }

    setEditing(null);
    table.refresh();
  }

  async function handleRemove() {
    if (!pendingRemoval) return;
    setRemoving(true);

    mockDeleteBrand(pendingRemoval.id);
    toast({
      title: "Brand deleted",
      description: `${pendingRemoval.name} was removed.`,
      tone: "success",
    });
    setPendingRemoval(null);
    setRemoving(false);
    table.refresh();
  }

  const columns: Column<MockBrand>[] = [
    {
      key: "name",
      header: "Brand",
      render: (brand) => (
        <span className="flex items-center gap-2.5">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white"
            style={{ backgroundColor: brand.logoColor }}
            aria-hidden="true"
          >
            {brand.logoText}
          </span>
          <span className="block">
            <span className="block text-[13px] font-medium text-ink">
              {brand.name}
            </span>
            <span className="block text-[12px] text-ink-muted">
              {brand.websiteUrl || "No website set"}
            </span>
          </span>
        </span>
      ),
      sortValue: (brand) => brand.name,
    },
    {
      key: "accounts",
      header: "Accounts",
      align: "right",
      render: (brand) => (
        <span className="text-[13px] text-ink-soft">
          {brand.accountIds.length}
        </span>
      ),
      sortValue: (brand) => brand.accountIds.length,
    },
    {
      key: "transactions",
      header: "Transactions",
      align: "right",
      render: (brand) => (
        <span className="text-[13px] text-ink-soft">
          {formatNumber(brand.transactionCount)}
        </span>
      ),
      sortValue: (brand) => brand.transactionCount,
    },
    {
      key: "revenue",
      header: "Revenue",
      align: "right",
      render: (brand) => (
        <span className="font-medium text-ink">{formatBDT(brand.revenue)}</span>
      ),
      sortValue: (brand) => brand.revenue,
    },
    {
      key: "status",
      header: "Status",
      render: (brand) => (
        <Badge
          tone={brand.status === "ACTIVE" ? "success" : "neutral"}
          dot
        >
          {brand.status === "ACTIVE" ? "Active" : "Inactive"}
        </Badge>
      ),
      sortValue: (brand) => brand.status,
    },
    {
      key: "created",
      header: "Added",
      align: "right",
      render: (brand) => (
        <span className="text-[13px] text-ink-muted">
          {formatDate(brand.createdAt)}
        </span>
      ),
      sortValue: (brand) => brand.createdAt,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Brands"
        description="Separate storefronts under the same merchant account."
        actions={
          <div className="flex items-center gap-2">
            <DemoBadge label="Demo brands" />
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add brand
            </Button>
          </div>
        }
      />

      <DemoNotice title="Sample brands">
        The backend has no brand model yet, so these brands are sample records.
        They are created, edited and deleted in this browser session only.
      </DemoNotice>

      <DataTable
        columns={columns}
        rows={table.rows}
        loading={table.loading}
        error={table.error ?? undefined}
        showSearch
        searchPlaceholder="Search by name or website"
        filters={[
          {
            id: "status",
            label: "All statuses",
            options: [
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ],
          },
        ]}
        emptyTitle="No brands yet"
        emptyDescription="Add a brand to run a second storefront with its own look and accounts."
        emptyIcon={Store}
        actions={(brand) => [
          {
            label: "View brand",
            onSelect: () => setViewing(brand),
          },
          {
            label: "Edit brand",
            icon: Pencil,
            onSelect: () => {
              setEditing(brand);
              setFormOpen(true);
            },
          },
          {
            label: "Delete brand",
            icon: Trash2,
            variant: "danger",
            onSelect: () => setPendingRemoval(brand),
          },
        ]}
        onRowClick={(brand) => setViewing(brand)}
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

      <BrandForm
        open={formOpen}
        brand={editing}
        accounts={accounts}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />

      <Drawer
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.name ?? "Brand"}
        description={viewing?.websiteUrl || "Brand details"}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setViewing(null)} type="button">
              Close
            </Button>
            <Button
              onClick={() => {
                if (!viewing) return;
                setEditing(viewing);
                setViewing(null);
                setFormOpen(true);
              }}
              type="button"
            >
              <Pencil className="size-4" aria-hidden="true" />
              Edit brand
            </Button>
          </>
        }
      >
        {viewing ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 rounded-lg border border-line bg-elevated px-4 py-4">
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: viewing.logoColor }}
                aria-hidden="true"
              >
                {viewing.logoText}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink">
                  {viewing.name}
                </p>
                <p className="text-[12px] text-ink-muted">
                  Accent {viewing.color} · {viewing.checkoutTheme.toLowerCase()}{" "}
                  theme
                </p>
              </div>
            </div>

            <dl className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Revenue</dt>
                <dd className="font-medium text-ink">
                  {formatBDT(viewing.revenue)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Transactions</dt>
                <dd className="font-medium text-ink">
                  {formatNumber(viewing.transactionCount)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Assigned accounts</dt>
                <dd className="font-medium text-ink">
                  {viewing.accountIds.length}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Contact email</dt>
                <dd className="font-medium text-ink">
                  {viewing.contactEmail || "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Contact phone</dt>
                <dd className="font-medium text-ink">
                  {viewing.contactPhone || "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Webhook</dt>
                <dd className="max-w-[60%] truncate font-mono text-[12px] text-ink">
                  {viewing.webhookUrl || "None"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Added</dt>
                <dd className="font-medium text-ink">
                  {formatDate(viewing.createdAt)}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={pendingRemoval !== null}
        title="Delete brand?"
        description={`"${pendingRemoval?.name}" will be removed. Payments already recorded through it are kept.`}
        confirmLabel="Delete brand"
        loading={removing}
        onConfirm={handleRemove}
        onCancel={() => setPendingRemoval(null)}
      />
    </div>
  );
}

/**
 * The accounts a brand can be assigned.
 *
 * Read through the mock layer's account list so the merchant scope applies,
 * exactly as it does for every other screen.
 */
function brandsAccountOptions(): MockPaymentAccount[] {
  return mockFetchAccounts({ pageSize: 200 }).rows;
}

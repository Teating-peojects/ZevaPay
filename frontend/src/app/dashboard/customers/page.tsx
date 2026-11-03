"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Download, Upload, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ProviderBadge } from "@/components/shared/provider-badge";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { useToast } from "@/components/ui/toast";
import { formatBDT, formatDate, formatNumber } from "@/lib/format";
import { downloadTextFile, exportDateStamp } from "@/lib/download";
import { useMockTable } from "@/hooks/use-mock-table";
import {
  mockExportCustomersCsv,
  mockFetchCustomers,
  type MockCustomer,
} from "@/mock";
import { CustomerImportModal } from "./customer-import-modal";

/**
 * The customer directory.
 *
 * The backend has no customer model yet, so this page reads from the mock
 * layer and carries a Demo badge. The CSV import and export run against the
 * same mock layer, so a file imported here shows up in the list.
 */
export default function CustomersPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [importOpen, setImportOpen] = React.useState(false);

  const table = useMockTable<MockCustomer>({
    fetch: (options) => mockFetchCustomers(options),
    pageSize: 10,
    initialSort: { sort: "totalSpent", order: "desc" },
  });

  function handleExport() {
    const csv = mockExportCustomersCsv({
      q: table.query,
      sort: table.sort.sort,
      order: table.sort.order,
    });

    downloadTextFile(
      `zevapay-customers-${exportDateStamp()}.csv`,
      csv,
    );

    toast({
      title: "Export downloaded",
      description:
        "The customer directory was written to a CSV file in your browser.",
      tone: "success",
    });
  }

  const columns: Column<MockCustomer>[] = [
    {
      key: "name",
      header: "Customer",
      render: (customer) => (
        <span className="block">
          <span className="block text-[13px] font-medium text-ink">
            {customer.name}
          </span>
          <span className="block text-[12px] text-ink-muted">
            {customer.email}
          </span>
        </span>
      ),
      sortValue: (customer) => customer.name,
    },
    {
      key: "phone",
      header: "Phone",
      render: (customer) => (
        <span className="font-mono text-[13px] text-ink-soft">
          {customer.phone}
        </span>
      ),
      sortValue: (customer) => customer.phone,
    },
    {
      key: "tags",
      header: "Tags",
      render: (customer) => (
        <span className="flex flex-wrap gap-1">
          {customer.tags.length === 0 ? (
            <span className="text-[13px] text-ink-faint">No tags</span>
          ) : (
            customer.tags.map((tag) => (
              <Badge key={tag} tone="neutral">
                {tag}
              </Badge>
            ))
          )}
        </span>
      ),
    },
    {
      key: "payments",
      header: "Payments",
      align: "right",
      render: (customer) => (
        <span className="text-[13px] text-ink-soft">
          {formatNumber(customer.paymentCount)}
        </span>
      ),
      sortValue: (customer) => customer.paymentCount,
    },
    {
      key: "spent",
      header: "Total spent",
      align: "right",
      render: (customer) => (
        <span className="font-medium text-ink">
          {formatBDT(customer.totalSpent)}
        </span>
      ),
      sortValue: (customer) => customer.totalSpent,
    },
    {
      key: "provider",
      header: "Usual method",
      render: (customer) =>
        customer.favouriteProvider ? (
          <ProviderBadge provider={customer.favouriteProvider} size="sm" />
        ) : (
          <span className="text-[13px] text-ink-faint">—</span>
        ),
    },
    {
      key: "last",
      header: "Last payment",
      align: "right",
      render: (customer) => (
        <span className="text-[13px] text-ink-muted">
          {customer.lastPaymentAt ? formatDate(customer.lastPaymentAt) : "—"}
        </span>
      ),
      sortValue: (customer) => customer.lastPaymentAt ?? "",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description="The people who have paid you, and what you know about them."
        actions={
          <div className="flex items-center gap-2">
            <DemoBadge label="Demo directory" />
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="size-4" aria-hidden="true" />
              Import CSV
            </Button>
            <Button onClick={handleExport}>
              <Download className="size-4" aria-hidden="true" />
              Export CSV
            </Button>
          </div>
        }
      />

      <DemoNotice title="Sample customer directory">
        The backend has no customer model yet, so this directory is sample
        data. Notes, tags and CSV imports change the sample records in this
        browser session — nothing is uploaded anywhere.
      </DemoNotice>

      <DataTable
        columns={columns}
        rows={table.rows}
        loading={table.loading}
        error={table.error ?? undefined}
        showSearch
        searchPlaceholder="Search by name, email, phone, or tag"
        emptyTitle="No customers yet"
        emptyDescription="Customers appear here once someone pays you, or you import them from a CSV file."
        emptyIcon={Users}
        onRowClick={(customer) => router.push(`/dashboard/customers/${customer.id}`)}
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
          onExport: handleExport,
        }}
      />

      <CustomerImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => table.refresh()}
      />
    </div>
  );
}

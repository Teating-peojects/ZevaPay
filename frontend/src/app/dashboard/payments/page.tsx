"use client";

import * as React from "react";
import { Eye, Receipt } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ProviderBadge } from "@/components/shared/provider-badge";
import { PaymentStatusBadge } from "@/components/shared/payment-status-badge";
import { DataTable, type Column } from "@/components/shared/data-table";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { formatBDT, formatDateTimeShort } from "@/lib/format";
import { useMockTable } from "@/hooks/use-mock-table";
import { mockFetchPayment, mockFetchPayments, type MockPayment } from "@/mock";
import { PaymentDetailsDrawer } from "./payment-details-drawer";

/**
 * The payments list.
 *
 * The backend has no payment model yet, so this screen shows the recorded
 * transactions the merchant already has. It reads from the mock layer, which
 * means the whole page carries a Demo badge and every action on it is a
 * labelled demo action.
 */
export default function PaymentsPage() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const table = useMockTable<MockPayment>({
    fetch: (options) => mockFetchPayments(options),
    pageSize: 10,
    initialSort: { sort: "createdAt", order: "desc" },
  });

  const selected = React.useMemo(
    () => (selectedId ? mockFetchPayment(selectedId) : undefined),
    [selectedId],
  );

  const columns: Column<MockPayment>[] = [
    {
      key: "reference",
      header: "Payment",
      render: (payment) => (
        <span className="font-mono text-[13px] font-medium text-ink">
          {payment.reference}
        </span>
      ),
      sortValue: (payment) => payment.reference,
    },
    {
      key: "provider",
      header: "Method",
      render: (payment) => (
        <ProviderBadge provider={payment.provider} size="sm" />
      ),
      sortValue: (payment) => payment.provider,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (payment) => (
        <span className="font-medium text-ink">{formatBDT(payment.amount)}</span>
      ),
      sortValue: (payment) => payment.amount,
    },
    {
      key: "customer",
      header: "Customer",
      render: (payment) => (
        <span className="block">
          <span className="block text-[13px] text-ink-soft">
            {payment.customerName ?? "Unknown sender"}
          </span>
          {payment.customerPhone ? (
            <span className="block text-[12px] text-ink-muted">
              {payment.customerPhone}
            </span>
          ) : null}
        </span>
      ),
      sortValue: (payment) => payment.customerName ?? "",
    },
    {
      key: "status",
      header: "Status",
      render: (payment) => <PaymentStatusBadge status={payment.status} />,
      sortValue: (payment) => payment.status,
    },
    {
      key: "created",
      header: "Recorded",
      align: "right",
      render: (payment) => (
        <span className="text-[13px] text-ink-muted">
          {formatDateTimeShort(payment.createdAt)}
        </span>
      ),
      sortValue: (payment) => payment.createdAt,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description="Payments raised through your payment links and checkout."
        actions={<DemoBadge label="Demo payments" />}
      />

      <DemoNotice title="Sample payment records">
        The backend does not have a payment model yet, so this screen shows the
        recorded transactions as payments. Approving, rejecting or refunding
        here is a labelled demo action — it changes the sample record on
        screen and nothing else.
      </DemoNotice>

      <DataTable
        columns={columns}
        rows={table.rows}
        loading={table.loading}
        error={table.error ?? undefined}
        showSearch
        searchPlaceholder="Search by reference, customer, or order"
        filters={[
          {
            id: "status",
            label: "All statuses",
            options: [
              { value: "CREATED", label: "Created" },
              { value: "PENDING", label: "Awaiting verification" },
              { value: "REVIEW", label: "Needs review" },
              { value: "CONFIRMED", label: "Confirmed from SMS" },
              { value: "FAILED", label: "Verification failed" },
              { value: "EXPIRED", label: "Expired" },
              { value: "CANCELLED", label: "Cancelled" },
              { value: "REFUNDED", label: "Refunded" },
            ],
          },
          {
            id: "provider",
            label: "All providers",
            options: [
              { value: "BKASH", label: "bKash" },
              { value: "NAGAD", label: "Nagad" },
              { value: "ROCKET", label: "Rocket" },
              { value: "UPAY", label: "Upay" },
            ],
          },
        ]}
        amountFilter={{
          min: table.amount.min,
          max: table.amount.max,
          onChange: table.setAmount,
          match: (payment, min, max) => {
            if (min !== null && payment.amount < min) return false;
            if (max !== null && payment.amount > max) return false;
            return true;
          },
        }}
        initialSort={table.sort}
        emptyTitle="No payments yet"
        emptyDescription="Payments appear here once a customer opens one of your payment links."
        emptyIcon={Receipt}
        actions={(payment) => [
          {
            label: "View details",
            icon: Eye,
            onSelect: () => setSelectedId(payment.id),
          },
        ]}
        onRowClick={(payment) => setSelectedId(payment.id)}
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

      <PaymentDetailsDrawer
        payment={selected ?? null}
        onClose={() => setSelectedId(null)}
        onChanged={() => table.refresh()}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { Bell, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { Drawer } from "@/components/ui/drawer";
import { useToast } from "@/components/ui/toast";
import { formatBDT, formatDate } from "@/lib/format";
import { useMockTable } from "@/hooks/use-mock-table";
import {
  invoiceTotals,
  mockCreateInvoice,
  mockDeleteInvoice,
  mockFetchInvoices,
  mockSendInvoiceReminder,
  mockUpdateInvoice,
  type MockInvoice,
} from "@/mock";
import { InvoiceForm, type InvoiceValues } from "./invoice-form";
import { InvoicePreview } from "./invoice-preview";

const STATUS_LABELS: Record<MockInvoice["status"], string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

const STATUS_TONES: Record<
  MockInvoice["status"],
  "neutral" | "info" | "success" | "danger" | "warning"
> = {
  DRAFT: "neutral",
  SENT: "info",
  PAID: "success",
  OVERDUE: "danger",
  CANCELLED: "warning",
};

/**
 * The invoices screen.
 *
 * Every invoice here is a sample record — the backend has no invoice model.
 * The list, the create form, the preview and the reminder action all work
 * against the mock layer, and the page says so.
 */
export default function InvoicesPage() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MockInvoice | null>(null);
  const [viewing, setViewing] = React.useState<MockInvoice | null>(null);
  const [pendingRemoval, setPendingRemoval] =
    React.useState<MockInvoice | null>(null);
  const [removing, setRemoving] = React.useState(false);
  const [reminding, setReminding] = React.useState(false);

  const table = useMockTable<MockInvoice>({
    fetch: (options) => mockFetchInvoices(options),
    pageSize: 10,
    initialSort: { sort: "createdAt", order: "desc" },
  });

  function handleSave(values: InvoiceValues) {
    if (editing) {
      mockUpdateInvoice(editing.id, {
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        dueDate: values.dueDate,
        items: values.items,
        taxRate: values.taxRate,
        discount: values.discount,
        notes: values.notes,
        status: values.status,
        issuedAt:
          values.status === "SENT" && !editing.issuedAt
            ? new Date().toISOString()
            : editing.issuedAt,
        paidAt:
          values.status === "PAID" && !editing.paidAt
            ? new Date().toISOString()
            : values.status === "PAID"
              ? editing.paidAt
              : null,
      });
    } else {
      mockCreateInvoice({
        merchantId: "mer_001",
        number: nextInvoiceNumber(),
        customerId: null,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        status: values.status,
        items: values.items,
        taxRate: values.taxRate,
        discount: values.discount,
        currency: "BDT",
        dueDate: values.dueDate,
        notes: values.notes,
      });
    }

    setEditing(null);
    table.refresh();
  }

  function handleReminder(invoice: MockInvoice) {
    setReminding(true);
    mockSendInvoiceReminder(invoice.id);
    setViewing(
      mockFetchInvoices({ pageSize: 200 }).rows.find(
        (row) => row.id === invoice.id,
      ) ?? invoice,
    );
    toast({
      title: "Reminder recorded",
      description:
        "Nothing was actually sent — the backend has no email service yet. The reminder count went up so the demo shows the state change.",
      tone: "warning",
    });
    setReminding(false);
    table.refresh();
  }

  async function handleRemove() {
    if (!pendingRemoval) return;
    setRemoving(true);

    mockDeleteInvoice(pendingRemoval.id);
    toast({
      title: "Invoice deleted",
      description: `${pendingRemoval.number} was removed.`,
      tone: "success",
    });
    setPendingRemoval(null);
    setRemoving(false);
    table.refresh();
  }

  const columns: Column<MockInvoice>[] = [
    {
      key: "number",
      header: "Invoice",
      render: (invoice) => (
        <span className="block">
          <span className="block font-mono text-[13px] font-medium text-ink">
            {invoice.number}
          </span>
          <span className="block text-[12px] text-ink-muted">
            {invoice.customerName}
          </span>
        </span>
      ),
      sortValue: (invoice) => invoice.number,
    },
    {
      key: "items",
      header: "Items",
      align: "right",
      render: (invoice) => (
        <span className="text-[13px] text-ink-soft">
          {invoice.items.length}
        </span>
      ),
      sortValue: (invoice) => invoice.items.length,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (invoice) => (
        <span className="font-medium text-ink">
          {formatBDT(invoiceTotals(invoice).total)}
        </span>
      ),
      sortValue: (invoice) => invoiceTotals(invoice).total,
    },
    {
      key: "due",
      header: "Due",
      align: "right",
      render: (invoice) => (
        <span className="text-[13px] text-ink-muted">
          {formatDate(invoice.dueDate)}
        </span>
      ),
      sortValue: (invoice) => invoice.dueDate,
    },
    {
      key: "status",
      header: "Status",
      render: (invoice) => (
        <Badge tone={STATUS_TONES[invoice.status]} dot>
          {STATUS_LABELS[invoice.status]}
        </Badge>
      ),
      sortValue: (invoice) => invoice.status,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="Bills you raise for a customer to pay."
        actions={
          <div className="flex items-center gap-2">
            <DemoBadge label="Demo invoices" />
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" aria-hidden="true" />
              Create invoice
            </Button>
          </div>
        }
      />

      <DemoNotice title="Sample invoices">
        The backend has no invoice model yet, so these invoices are sample
        records. They are created, edited and deleted in this browser session
        only — no email is sent and no PDF is generated.
      </DemoNotice>

      <DataTable
        columns={columns}
        rows={table.rows}
        loading={table.loading}
        error={table.error ?? undefined}
        showSearch
        searchPlaceholder="Search by number, customer or email"
        filters={[
          {
            id: "status",
            label: "All statuses",
            options: [
              { value: "DRAFT", label: "Draft" },
              { value: "SENT", label: "Sent" },
              { value: "PAID", label: "Paid" },
              { value: "OVERDUE", label: "Overdue" },
              { value: "CANCELLED", label: "Cancelled" },
            ],
          },
        ]}
        emptyTitle="No invoices yet"
        emptyDescription="Raise an invoice when a customer should pay you on an agreed date."
        emptyIcon={FileText}
        actions={(invoice) => [
          {
            label: "Preview invoice",
            onSelect: () => setViewing(invoice),
          },
          {
            label: "Edit invoice",
            icon: Pencil,
            onSelect: () => {
              setEditing(invoice);
              setFormOpen(true);
            },
          },
          {
            label: "Send reminder",
            icon: Bell,
            onSelect: () => handleReminder(invoice),
          },
          {
            label: "Delete invoice",
            icon: Trash2,
            variant: "danger",
            onSelect: () => setPendingRemoval(invoice),
          },
        ]}
        onRowClick={(invoice) => setViewing(invoice)}
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

      <InvoiceForm
        open={formOpen}
        invoice={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />

      <Drawer
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.number ?? "Invoice"}
        description={viewing?.customerName}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setViewing(null)} type="button">
            Close
          </Button>
        }
      >
        {viewing ? (
          <InvoicePreview
            invoice={viewing}
            onReminder={handleReminder}
            reminding={reminding}
          />
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={pendingRemoval !== null}
        title="Delete invoice?"
        description={`${pendingRemoval?.number} will be removed. Payments already recorded against it are kept.`}
        confirmLabel="Delete invoice"
        loading={removing}
        onConfirm={handleRemove}
        onCancel={() => setPendingRemoval(null)}
      />
    </div>
  );
}

/**
 * The next invoice number.
 *
 * The count comes from the existing records, so the numbers stay in step
 * with what is on screen rather than drifting from a stored counter.
 */
function nextInvoiceNumber(): string {
  const { rows } = mockFetchInvoices({ pageSize: 200 });
  const highest = rows.reduce((max, invoice) => {
    const match = /(\d+)$/.exec(invoice.number);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `INV-2026-${String(highest + 1).padStart(4, "0")}`;
}

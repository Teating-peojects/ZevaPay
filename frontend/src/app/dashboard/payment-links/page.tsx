"use client";

import * as React from "react";
import { Link2, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ProviderBadge } from "@/components/shared/provider-badge";
import { CopyableValue } from "@/components/shared/copyable-value";
import { QrPreview } from "@/components/shared/qr-preview";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { Drawer } from "@/components/ui/drawer";
import { useToast } from "@/components/ui/toast";
import { formatBDT, formatDate, formatDateTime } from "@/lib/format";
import { useMockTable } from "@/hooks/use-mock-table";
import {
  mockCreatePaymentLink,
  mockDeletePaymentLink,
  mockFetchPaymentLinks,
  mockUpdatePaymentLink,
  type MockPaymentLink,
} from "@/mock";
import { PaymentLinkForm, type PaymentLinkValues } from "./payment-link-form";

/**
 * The public URL for a payment link.
 *
 * The host is a placeholder: the backend has no payment-link model, so
 * nothing is really hosted at this address.
 */
function publicUrl(link: MockPaymentLink): string {
  return `https://pay.zevapay.test/${link.code}`;
}

/**
 * The payment-links screen.
 *
 * A link is the merchant's shareable way to ask for money. The list shows
 * what each one is worth and how much it has taken; the drawer shows the
 * link itself, its QR code and its limits.
 */
export default function PaymentLinksPage() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MockPaymentLink | null>(null);
  const [viewing, setViewing] = React.useState<MockPaymentLink | null>(null);
  const [pendingRemoval, setPendingRemoval] =
    React.useState<MockPaymentLink | null>(null);
  const [removing, setRemoving] = React.useState(false);

  const table = useMockTable<MockPaymentLink>({
    fetch: (options) => mockFetchPaymentLinks(options),
    pageSize: 10,
    initialSort: { sort: "createdAt", order: "desc" },
  });

  function handleSave(values: PaymentLinkValues) {
    if (editing) {
      // The expiry is stored as an absolute instant. Editing a link keeps the
      // original date when the reader did not change the window, so editing a
      // title does not silently extend a link's life.
      const expiresAt = new Date(
        Date.now() + values.expiresInDays * 24 * 60 * 60 * 1000,
      ).toISOString();

      mockUpdatePaymentLink(editing.id, {
        title: values.title,
        description: values.description,
        amount: values.amount,
        flexible: values.flexible,
        provider: values.provider,
        usageLimit: values.usageLimit,
        expiresAt,
        redirectUrl: values.redirectUrl,
        customerFields: values.customerFields,
      });
    } else {
      mockCreatePaymentLink({
        merchantId: "mer_001",
        code: randomCode(),
        title: values.title,
        description: values.description,
        amount: values.amount,
        flexible: values.flexible,
        status: "ACTIVE",
        provider: values.provider,
        customerFields: values.customerFields,
        usageLimit: values.usageLimit,
        expiresAt: new Date(
          Date.now() + values.expiresInDays * 24 * 60 * 60 * 1000,
        ).toISOString(),
        redirectUrl: values.redirectUrl,
      });
    }

    setEditing(null);
    table.refresh();
  }

  function handleToggle(link: MockPaymentLink) {
    const next = link.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    mockUpdatePaymentLink(link.id, { status: next });
    toast({
      title: next === "ACTIVE" ? "Link enabled" : "Link disabled",
      description:
        next === "ACTIVE"
          ? `${link.title} can accept payments again.`
          : `${link.title} no longer accepts payments.`,
      tone: "success",
    });
    table.refresh();
  }

  async function handleRemove() {
    if (!pendingRemoval) return;
    setRemoving(true);

    mockDeletePaymentLink(pendingRemoval.id);
    toast({
      title: "Link deleted",
      description: `${pendingRemoval.title} was removed.`,
      tone: "success",
    });
    setPendingRemoval(null);
    setRemoving(false);
    table.refresh();
  }

  const columns: Column<MockPaymentLink>[] = [
    {
      key: "title",
      header: "Link",
      render: (link) => (
        <span className="block">
          <span className="block text-[13px] font-medium text-ink">
            {link.title}
          </span>
          <span className="block font-mono text-[12px] text-ink-muted">
            /{link.code}
          </span>
        </span>
      ),
      sortValue: (link) => link.title,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (link) =>
        link.flexible ? (
          <span className="text-[13px] text-ink-faint">Any amount</span>
        ) : (
          <span className="font-medium text-ink">{formatBDT(link.amount ?? 0)}</span>
        ),
      sortValue: (link) => link.amount ?? 0,
    },
    {
      key: "provider",
      header: "Method",
      render: (link) =>
        link.provider === "ANY" ? (
          <span className="text-[13px] text-ink-muted">Any</span>
        ) : (
          <ProviderBadge provider={link.provider} size="sm" />
        ),
      sortValue: (link) => link.provider,
    },
    {
      key: "usage",
      header: "Used",
      align: "right",
      render: (link) => (
        <span className="text-[13px] text-ink-soft">
          {link.usageCount}
          {link.usageLimit ? ` / ${link.usageLimit}` : ""}
        </span>
      ),
      sortValue: (link) => link.usageCount,
    },
    {
      key: "revenue",
      header: "Revenue",
      align: "right",
      render: (link) => (
        <span className="font-medium text-ink">{formatBDT(link.revenue)}</span>
      ),
      sortValue: (link) => link.revenue,
    },
    {
      key: "expires",
      header: "Expires",
      align: "right",
      render: (link) =>
        link.expiresAt ? (
          <span className="text-[13px] text-ink-muted">
            {formatDate(link.expiresAt)}
          </span>
        ) : (
          <span className="text-[13px] text-ink-faint">Never</span>
        ),
      sortValue: (link) => link.expiresAt ?? "",
    },
    {
      key: "status",
      header: "Status",
      render: (link) => (
        <Badge
          tone={
            link.status === "ACTIVE"
              ? "success"
              : link.status === "EXPIRED"
                ? "neutral"
                : "warning"
          }
          dot
        >
          {link.status === "ACTIVE"
            ? "Active"
            : link.status === "EXPIRED"
              ? "Expired"
              : "Disabled"}
        </Badge>
      ),
      sortValue: (link) => link.status,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payment Links"
        description="Shareable links that ask a customer for a payment."
        actions={
          <div className="flex items-center gap-2">
            <DemoBadge label="Demo links" />
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" aria-hidden="true" />
              Create link
            </Button>
          </div>
        }
      />

      <DemoNotice title="Sample payment links">
        The backend has no payment-link model yet, so these links are sample
        records. They are created, edited and deleted in this browser session
        only — nothing is published and no customer can pay through them.
      </DemoNotice>

      <DataTable
        columns={columns}
        rows={table.rows}
        loading={table.loading}
        error={table.error ?? undefined}
        showSearch
        searchPlaceholder="Search by title, code or description"
        filters={[
          {
            id: "status",
            label: "All statuses",
            options: [
              { value: "ACTIVE", label: "Active" },
              { value: "DISABLED", label: "Disabled" },
              { value: "EXPIRED", label: "Expired" },
            ],
          },
          {
            id: "provider",
            label: "Any method",
            options: [
              { value: "BKASH", label: "bKash" },
              { value: "NAGAD", label: "Nagad" },
              { value: "ROCKET", label: "Rocket" },
              { value: "UPAY", label: "Upay" },
            ],
          },
        ]}
        emptyTitle="No payment links yet"
        emptyDescription="Create a link to share with a customer instead of sending them an account number."
        emptyIcon={Link2}
        actions={(link) => [
          {
            label: "View link",
            onSelect: () => setViewing(link),
          },
          {
            label: "Edit link",
            icon: Pencil,
            onSelect: () => {
              setEditing(link);
              setFormOpen(true);
            },
          },
          {
            label: link.status === "ACTIVE" ? "Disable link" : "Enable link",
            onSelect: () => handleToggle(link),
          },
          {
            label: "Delete link",
            icon: Trash2,
            variant: "danger",
            onSelect: () => setPendingRemoval(link),
          },
        ]}
        onRowClick={(link) => setViewing(link)}
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

      <PaymentLinkForm
        open={formOpen}
        link={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />

      <PaymentLinkDrawer
        link={viewing}
        onClose={() => setViewing(null)}
        onToggle={handleToggle}
        onEdit={(link) => {
          setViewing(null);
          setEditing(link);
          setFormOpen(true);
        }}
      />

      <ConfirmDialog
        open={pendingRemoval !== null}
        title="Delete payment link?"
        description={`"${pendingRemoval?.title}" will stop working immediately. Payments already recorded through it are kept.`}
        confirmLabel="Delete link"
        loading={removing}
        onConfirm={handleRemove}
        onCancel={() => setPendingRemoval(null)}
      />
    </div>
  );
}

/**
 * A short, readable code for a new link.
 *
 * The alphabet omits the characters that are easy to confuse when a code is
 * read aloud or copied from a screen — 0/O, 1/I/L.
 */
function randomCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 6; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

/**
 * The detail drawer for one link.
 */
function PaymentLinkDrawer({
  link,
  onClose,
  onToggle,
  onEdit,
}: {
  link: MockPaymentLink | null;
  onClose: () => void;
  onToggle: (link: MockPaymentLink) => void;
  onEdit: (link: MockPaymentLink) => void;
}) {
  if (!link) return null;

  const url = publicUrl(link);
  const limitReached =
    link.usageLimit !== null && link.usageCount >= link.usageLimit;

  return (
    <Drawer
      open
      onClose={onClose}
      title={link.title}
      description={link.description || "Payment link"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Close
          </Button>
          <Button variant="outline" onClick={() => onToggle(link)} type="button">
            {link.status === "ACTIVE" ? "Disable" : "Enable"}
          </Button>
          <Button onClick={() => onEdit(link)} type="button">
            <Pencil className="size-4" aria-hidden="true" />
            Edit link
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-medium text-ink-soft">Link</p>
          <CopyableValue value={url} label="The payment link" />
          <p className="text-[12px] leading-relaxed text-ink-muted">
            This address is a placeholder. The link records what it would do,
            but no customer page is served from it yet.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-line bg-elevated px-4 py-4">
          <p className="text-[13px] font-medium text-ink-soft">
            QR code
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <QrPreview value={url} title={`QR code for ${link.title}`} />
            <div className="min-w-0 text-[13px] leading-relaxed text-ink-muted">
              <p>
                The code is drawn in your browser from the link above. Print it
                on a card or put it on a counter display.
              </p>
              <p className="mt-2">
                Nothing is uploaded — the image never leaves this page.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-medium text-ink-soft">Details</p>
          <dl className="flex flex-col gap-2.5 text-[13px]">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-muted">Amount</dt>
              <dd className="font-medium text-ink">
                {link.flexible ? "Customer chooses" : formatBDT(link.amount ?? 0)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-muted">Method</dt>
              <dd className="font-medium text-ink">
                {link.provider === "ANY"
                  ? "Any method"
                  : link.provider.charAt(0) + link.provider.slice(1).toLowerCase()}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-muted">Used</dt>
              <dd className="font-medium text-ink">
                {link.usageCount}
                {link.usageLimit ? ` of ${link.usageLimit}` : " payments"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-muted">Expires</dt>
              <dd className="font-medium text-ink">
                {link.expiresAt ? formatDateTime(link.expiresAt) : "Never"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-muted">Created</dt>
              <dd className="font-medium text-ink">
                {formatDate(link.createdAt)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-muted">Revenue</dt>
              <dd className="font-medium text-ink">{formatBDT(link.revenue)}</dd>
            </div>
          </dl>
        </div>

        {link.customerFields.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-medium text-ink-soft">
              Customer fields
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {link.customerFields.map((field) => (
                <li key={field.name}>
                  <Badge tone="neutral">
                    {field.name}
                    {field.required ? " *" : ""}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {limitReached ? (
          <p className="rounded-lg border border-warning-line bg-warning-tint px-4 py-3 text-[13px] text-ink-soft">
            This link has reached its usage limit of {link.usageLimit}. It is no
            longer accepting payments.
          </p>
        ) : null}
      </div>
    </Drawer>
  );
}

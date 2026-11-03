"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Plus,
  Receipt,
  Tag,
  Trash2,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Label, Textarea } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/states";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { ProviderBadge } from "@/components/shared/provider-badge";
import { PaymentStatusBadge } from "@/components/shared/payment-status-badge";
import { useToast } from "@/components/ui/toast";
import { formatBDT, formatDate, formatDateTime } from "@/lib/format";
import {
  mockFetchCustomerInvoices,
  mockFetchCustomerPayments,
  mockFetchCustomers,
  mockUpdateCustomer,
  type MockCustomer,
  type MockInvoice,
  type MockPayment,
} from "@/mock";

/**
 * The tags offered in the tag picker.
 *
 * They are suggestions rather than a closed list — a merchant can type any
 * tag they like, and this list simply makes the common ones one click away.
 */
const SUGGESTED_TAGS = [
  "repeat",
  "new",
  "vip",
  "wholesale",
  "first-time",
  "credit",
];

/**
 * Splits a tag string into a clean list.
 *
 * Commas, semicolons and pipes all separate tags, and an empty fragment is
 * dropped, so a stray comma never creates a blank tag.
 */
function parseTags(value: string): string[] {
  return value
    .split(/[,;|]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, all) => all.indexOf(tag) === index);
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line py-2.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className="text-[13px] font-medium text-ink sm:text-right">
        {children}
      </span>
    </div>
  );
}

/**
 * Reads a customer that belongs to this merchant.
 *
 * The lookup goes through the list function rather than the single-record
 * one, because the list function applies the merchant scope. A link to a
 * customer from another merchant therefore reads as "not found" rather than
 * leaking a record that is not this merchant's.
 */
function findCustomer(id: string): MockCustomer | undefined {
  const { rows } = mockFetchCustomers({ pageSize: 200 });
  return rows.find((customer) => customer.id === id);
}

/**
 * The customer detail screen.
 *
 * Everything on it comes from the mock layer, so it carries a Demo badge:
 * the backend has no customer model yet. Notes and tags are editable and are
 * saved back into the same mock record the directory reads, so a change here
 * shows up in the list.
 */
export function CustomerDetailScreen() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  // The record is read during the render rather than in an effect, so the
  // screen is never painted with a half-loaded customer.
  const customer = findCustomer(id);

  if (!customer) {
    return <CustomerNotFound onBack={() => router.push("/dashboard/customers")} />;
  }

  return (
    <CustomerDetailPanel
      key={customer.id}
      customer={customer}
      payments={mockFetchCustomerPayments(customer.id, { pageSize: 50 }).rows}
      invoices={mockFetchCustomerInvoices(customer.id, { pageSize: 50 }).rows}
      onBack={() => router.push("/dashboard/customers")}
    />
  );
}

/**
 * Shown when the id does not belong to a customer of this merchant.
 */
function CustomerNotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customer not found"
        description="This customer is not in the directory."
        actions={
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to customers
          </Button>
        }
      />
      <div className="surface overflow-hidden rounded-xl">
        <EmptyState
          title="Nothing here"
          description="The record may have been removed, or the link may point at a customer from another merchant."
          icon={UserRound}
          action={
            <Button variant="outline" onClick={onBack}>
              Back to customers
            </Button>
          }
        />
      </div>
    </div>
  );
}

/**
 * The panel for one customer.
 *
 * It is keyed by the customer id, so the notes box and the tag list start
 * from that customer's values.
 */
function CustomerDetailPanel({
  customer: initialCustomer,
  payments,
  invoices,
  onBack,
}: {
  customer: MockCustomer;
  payments: MockPayment[];
  invoices: MockInvoice[];
  onBack: () => void;
}) {
  const { toast } = useToast();

  const [customer, setCustomer] = React.useState(initialCustomer);
  const [notes, setNotes] = React.useState(initialCustomer.notes);
  const [notesDirty, setNotesDirty] = React.useState(false);
  const [savingNotes, setSavingNotes] = React.useState(false);

  const [tagInput, setTagInput] = React.useState("");
  const [savingTags, setSavingTags] = React.useState(false);

  function handleSaveNotes() {
    setSavingNotes(true);
    const updated = mockUpdateCustomer(customer.id, { notes: notes.trim() });

    if (!updated) {
      setSavingNotes(false);
      toast({
        title: "The note was not saved",
        description: "The sample record could not be updated.",
        tone: "error",
      });
      return;
    }

    setCustomer(updated);
    setNotes(updated.notes);
    setNotesDirty(false);
    setSavingNotes(false);

    toast({
      title: "Note saved",
      description:
        "The note was saved to this sample record. It is not stored on a server.",
      tone: "success",
    });
  }

  function applyTags(next: string[]) {
    setSavingTags(true);
    const updated = mockUpdateCustomer(customer.id, { tags: next });

    if (!updated) {
      setSavingTags(false);
      toast({
        title: "The tags were not saved",
        description: "The sample record could not be updated.",
        tone: "error",
      });
      return;
    }

    setCustomer(updated);
    setTagInput("");
    setSavingTags(false);

    toast({
      title: "Tags updated",
      description:
        "The tags were saved to this sample record. They are not stored on a server.",
      tone: "success",
    });
  }

  function handleAddTag(tag: string) {
    // A comma-separated string adds several tags at once.
    const additions = parseTags(tag);
    if (additions.length === 0) return;

    const next = [...customer.tags];

    for (const addition of additions) {
      const known = next.some(
        (existing) => existing.toLowerCase() === addition.toLowerCase(),
      );
      if (known) continue;
      next.push(addition);
    }

    if (next.length === customer.tags.length) return;
    applyTags(next);
  }

  function handleRemoveTag(tag: string) {
    applyTags(customer.tags.filter((existing) => existing !== tag));
  }

  const suggested = SUGGESTED_TAGS.filter(
    (tag) =>
      !customer.tags.some(
        (existing) => existing.toLowerCase() === tag.toLowerCase(),
      ),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={customer.name}
        description={`${customer.paymentCount} recorded payment${customer.paymentCount === 1 ? "" : "s"}, ${formatBDT(customer.totalSpent)} in total.`}
        actions={
          <div className="flex items-center gap-2">
            <DemoBadge label="Demo customer" />
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Button>
          </div>
        }
      />

      <DemoNotice title="Sample customer record">
        The backend has no customer model yet, so this record comes from the
        mock layer. Notes and tags are saved in this browser session — nothing
        is uploaded anywhere, and the payment history below is the same
        sample data the payments screen shows.
      </DemoNotice>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Payment history</CardTitle>
              <CardDescription>
                Every payment recorded against this customer.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {payments.length === 0 ? (
                <EmptyState
                  title="No payments yet"
                  description="Payments appear here once a recorded notification is matched to this customer."
                  icon={Receipt}
                />
              ) : (
                <div className="flex flex-col">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex flex-col gap-1.5 border-b border-line px-5 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[13px] font-medium text-ink">
                            {payment.reference}
                          </span>
                          <ProviderBadge provider={payment.provider} size="sm" />
                          <PaymentStatusBadge status={payment.status} />
                        </div>
                        <p className="mt-1 text-[12px] text-ink-muted">
                          {formatDateTime(payment.createdAt)}
                          {payment.orderReference
                            ? ` · ${payment.orderReference}`
                            : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-[13px] font-semibold text-ink">
                        {formatBDT(payment.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                Invoices raised for this customer.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {invoices.length === 0 ? (
                <EmptyState
                  title="No invoices"
                  description="Invoices raised for this customer will appear here."
                  icon={Receipt}
                />
              ) : (
                <div className="flex flex-col">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex flex-col gap-1.5 border-b border-line px-5 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-[13px] font-medium text-ink">
                          {invoice.number}
                        </span>
                        <p className="mt-1 text-[12px] text-ink-muted">
                          Due {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                      <Badge
                        tone={
                          invoice.status === "PAID"
                            ? "success"
                            : invoice.status === "OVERDUE"
                              ? "danger"
                              : "neutral"
                        }
                      >
                        {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={customer.name} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-ink">
                      {customer.name}
                    </p>
                    <p className="truncate text-[12px] text-ink-muted">
                      Customer since {customer.firstPaymentAt ? formatDate(customer.firstPaymentAt) : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col">
                  <DetailRow label="Email">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="size-3.5 text-ink-faint" aria-hidden="true" />
                      {customer.email}
                    </span>
                  </DetailRow>
                  <DetailRow label="Phone">
                    <span className="inline-flex items-center gap-1.5 font-mono">
                      <Phone className="size-3.5 text-ink-faint" aria-hidden="true" />
                      {customer.phone}
                    </span>
                  </DetailRow>
                  <DetailRow label="Total spent">
                    {formatBDT(customer.totalSpent)}
                  </DetailRow>
                  <DetailRow label="Payments">
                    {customer.paymentCount}
                  </DetailRow>
                  <DetailRow label="Usual method">
                    {customer.favouriteProvider ? (
                      <ProviderBadge provider={customer.favouriteProvider} size="sm" />
                    ) : (
                      "Not known yet"
                    )}
                  </DetailRow>
                  <DetailRow label="Last payment">
                    {customer.lastPaymentAt
                      ? formatDate(customer.lastPaymentAt)
                      : "—"}
                  </DetailRow>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Tags are how you group customers in the directory.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {customer.tags.length === 0 ? (
                  <p className="text-[13px] text-ink-muted">
                    This customer has no tags yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-md bg-elevated py-1 pr-1 pl-2 text-xs font-medium text-ink-soft ring-1 ring-inset ring-line"
                      >
                        <Tag className="size-3 text-ink-faint" aria-hidden="true" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          disabled={savingTags}
                          aria-label={`Remove the tag ${tag}`}
                          className="rounded p-0.5 text-ink-faint transition-colors hover:bg-sunken hover:text-danger-fg disabled:opacity-50"
                        >
                          <Trash2 className="size-3" aria-hidden="true" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <Label htmlFor="customer-tag">Add a tag</Label>
                    <input
                      id="customer-tag"
                      value={tagInput}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return;
                        event.preventDefault();
                        handleAddTag(tagInput);
                      }}
                      placeholder="e.g. vip"
                      className="h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand-link focus:ring-2 focus:ring-brand-solid/15 focus:outline-none"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleAddTag(tagInput)}
                    disabled={savingTags || tagInput.trim().length === 0}
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Add
                  </Button>
                </div>

                {suggested.length > 0 ? (
                  <div>
                    <p className="mb-2 text-[12px] font-medium text-ink-muted">
                      Suggested tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggested.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddTag(tag)}
                          disabled={savingTags}
                          className="rounded-md border border-line-strong bg-surface px-2 py-1 text-[12px] font-medium text-ink-soft transition-colors hover:bg-elevated disabled:opacity-50"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                Internal notes. Only your team sees these.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Alert tone="info">
                  Notes are saved to this sample record in your browser. They are
                  not uploaded anywhere.
                </Alert>

                <div>
                  <Label htmlFor="customer-notes" className="sr-only">
                    Notes about this customer
                  </Label>
                  <Textarea
                    id="customer-notes"
                    value={notes}
                    onChange={(event) => {
                      setNotes(event.target.value);
                      setNotesDirty(true);
                    }}
                    placeholder="Add a note about this customer…"
                    className="min-h-32"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  {notesDirty ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNotes(customer.notes);
                        setNotesDirty(false);
                      }}
                    >
                      Discard
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    loading={savingNotes}
                    disabled={!notesDirty}
                  >
                    Save note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-3 text-[13px]">
            <Link
              href="/dashboard/customers"
              className="text-ink-muted transition-colors hover:text-ink"
            >
              Back to the directory
            </Link>
            <span className="font-mono text-[12px] text-ink-faint">
              {customer.id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

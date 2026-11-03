"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBDT, formatDate } from "@/lib/format";
import { invoiceTotals, type MockInvoice } from "@/mock";
import { computeTotals } from "./invoice-form";

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
 * A preview of the invoice as a document.
 *
 * This is a screen, not a file: no PDF is generated and nothing is
 * downloaded. The preview is drawn from the same totals the list shows, so
 * the two never disagree.
 */
export function InvoicePreview({
  invoice,
  onReminder,
  reminding,
}: {
  invoice: MockInvoice | null;
  /** Called when the reader asks for a reminder. */
  onReminder?: (invoice: MockInvoice) => void;
  /** True while a reminder is being recorded. */
  reminding?: boolean;
}) {
  if (!invoice) return null;

  const totals = computeTotals(
    invoice.items,
    invoice.taxRate,
    invoice.discount,
  );
  // The mock layer's own helper is the source of truth for a stored
  // invoice; the form's helper covers a draft being edited.
  const stored = invoiceTotals(invoice);
  const grand = stored.total > 0 || totals.subtotal === 0 ? stored.total : totals.total;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge tone={STATUS_TONES[invoice.status]} dot>
            {STATUS_LABELS[invoice.status]}
          </Badge>
          {invoice.remindersSent > 0 ? (
            <span className="text-[12px] text-ink-muted">
              {invoice.remindersSent} reminder
              {invoice.remindersSent === 1 ? "" : "s"} sent
            </span>
          ) : null}
        </div>

        {onReminder ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onReminder(invoice)}
            loading={reminding}
          >
            Send reminder
          </Button>
        ) : null}
      </div>

      {/* The document */}
      <div className="rounded-lg border border-line bg-surface px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <p className="text-base font-semibold tracking-tight text-ink">
              Dhanmondi Electronics
            </p>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              House 42, Road 11, Dhanmondi, Dhaka 1209
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[13px] font-medium text-ink">
              {invoice.number}
            </p>
            <p className="mt-0.5 text-[12px] text-ink-muted">
              Due {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        <div className="grid gap-4 py-4 sm:grid-cols-2">
          <div>
            <p className="text-[12px] font-semibold tracking-wide text-ink-muted uppercase">
              Billed to
            </p>
            <p className="mt-1 text-[13px] font-medium text-ink">
              {invoice.customerName}
            </p>
            {invoice.customerEmail ? (
              <p className="text-[13px] text-ink-muted">{invoice.customerEmail}</p>
            ) : null}
            {invoice.customerPhone ? (
              <p className="font-mono text-[13px] text-ink-muted">
                {invoice.customerPhone}
              </p>
            ) : null}
          </div>
          <div className="sm:text-right">
            <p className="text-[12px] font-semibold tracking-wide text-ink-muted uppercase">
              Issued
            </p>
            <p className="mt-1 text-[13px] text-ink">
              {invoice.issuedAt ? formatDate(invoice.issuedAt) : "Not sent yet"}
            </p>
            {invoice.paidAt ? (
              <p className="text-[13px] text-success-fg">
                Paid {formatDate(invoice.paidAt)}
              </p>
            ) : null}
          </div>
        </div>

        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-line">
              <th className="py-2 text-left font-semibold text-ink-muted">
                Description
              </th>
              <th className="py-2 text-right font-semibold text-ink-muted">
                Qty
              </th>
              <th className="py-2 text-right font-semibold text-ink-muted">
                Unit price
              </th>
              <th className="py-2 text-right font-semibold text-ink-muted">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-line last:border-b-0">
                <td className="py-2.5 text-ink">{item.description}</td>
                <td className="py-2.5 text-right text-ink-soft">
                  {item.quantity}
                </td>
                <td className="py-2.5 text-right text-ink-soft">
                  {formatBDT(item.unitPrice)}
                </td>
                <td className="py-2.5 text-right font-medium text-ink">
                  {formatBDT(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <dl className="flex w-full max-w-xs flex-col gap-1.5 text-[13px]">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd className="font-medium text-ink">
                {formatBDT(totals.subtotal)}
              </dd>
            </div>
            {totals.discount > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Discount</dt>
                <dd className="font-medium text-ink">
                  −{formatBDT(totals.discount)}
                </dd>
              </div>
            ) : null}
            {totals.taxRate > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Tax ({totals.taxRate}%)</dt>
                <dd className="font-medium text-ink">{formatBDT(totals.tax)}</dd>
              </div>
            ) : null}
            <div className="mt-1 flex items-center justify-between gap-4 border-t border-line pt-2">
              <dt className="font-semibold text-ink">Total due</dt>
              <dd className="text-base font-semibold text-ink">
                {formatBDT(grand)}
              </dd>
            </div>
          </dl>
        </div>

        {invoice.notes ? (
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-[12px] font-semibold tracking-wide text-ink-muted uppercase">
              Notes
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
              {invoice.notes}
            </p>
          </div>
        ) : null}
      </div>

      <p className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-muted">
        <FileText
          className="mt-0.5 size-3.5 shrink-0 text-ink-faint"
          aria-hidden="true"
        />
        This is a preview rendered in your browser. No PDF file is generated and
        nothing is sent to the customer.
      </p>
    </div>
  );
}

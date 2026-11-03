"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { formatBDT } from "@/lib/format";
import type { MockInvoice, MockInvoiceLine } from "@/mock";

/**
 * The invoice form.
 *
 * Line items are edited in place — add a row, change a quantity or a price,
 * remove a row — and the totals recompute as the reader types. The totals
 * shown here are the same ones the list and the preview use, so the three
 * never disagree.
 */
export function InvoiceForm({
  open,
  onClose,
  onSave,
  /** The invoice being edited, or null when creating a new one. */
  invoice,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (values: InvoiceValues) => void;
  invoice: MockInvoice | null;
}) {
  const [customerName, setCustomerName] = React.useState(
    invoice?.customerName ?? "",
  );
  const [customerEmail, setCustomerEmail] = React.useState(
    invoice?.customerEmail ?? "",
  );
  const [customerPhone, setCustomerPhone] = React.useState(
    invoice?.customerPhone ?? "",
  );
  const [dueDate, setDueDate] = React.useState(invoice?.dueDate ?? "");
  const [taxRate, setTaxRate] = React.useState(String(invoice?.taxRate ?? 0));
  const [discount, setDiscount] = React.useState(
    String(invoice?.discount ?? 0),
  );
  const [notes, setNotes] = React.useState(invoice?.notes ?? "");
  const [status, setStatus] = React.useState(invoice?.status ?? "DRAFT");
  const [items, setItems] = React.useState<MockInvoiceLine[]>(
    invoice?.items ?? [{ id: "li_1", description: "", quantity: 1, unitPrice: 0 }],
  );
  const [error, setError] = React.useState<string | null>(null);

  function updateItem(id: string, patch: Partial<MockInvoiceLine>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        id: `li_${current.length + 1}_${Date.now()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  const totals = computeTotals(items, Number(taxRate) || 0, Number(discount) || 0);

  function handleSubmit() {
    setError(null);

    const name = customerName.trim();
    if (name.length < 2) {
      setError("Enter the customer's name.");
      return;
    }

    const email = customerEmail.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address, or leave it empty.");
      return;
    }

    const phone = customerPhone.trim();
    if (phone && !/^01[3-9]\d{8}$/.test(phone)) {
      setError("Enter a valid 11-digit mobile number, or leave it empty.");
      return;
    }

    if (!dueDate) {
      setError("Choose a due date.");
      return;
    }

    const cleanItems = items
      .map((item) => ({
        ...item,
        description: item.description.trim(),
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
      }))
      .filter((item) => item.description.length > 0);

    if (cleanItems.length === 0) {
      setError("Add at least one line item with a description.");
      return;
    }

    const rate = Number(taxRate) || 0;
    if (rate < 0 || rate > 100) {
      setError("The tax rate must be between 0 and 100 percent.");
      return;
    }

    const discountValue = Number(discount) || 0;
    if (discountValue < 0) {
      setError("The discount cannot be negative.");
      return;
    }

    onSave({
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      dueDate: new Date(dueDate).toISOString(),
      items: cleanItems,
      taxRate: rate,
      discount: discountValue,
      notes: notes.trim(),
      status,
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={invoice ? "Edit invoice" : "Create invoice"}
      description={
        invoice
          ? `${invoice.number} — change the customer, the items or the totals.`
          : "Raise an invoice for a customer to pay."
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={handleSubmit} type="button">
            {invoice ? "Save changes" : "Create invoice"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Alert tone="info">
          This invoice is a sample. Nothing is emailed to the customer and no
          PDF is generated — the preview below shows what the document would
          look like.
        </Alert>

        {error ? <Alert tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="invoice-customer" required>
              Customer name
            </Label>
            <Input
              id="invoice-customer"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="e.g. Imran Chowdhury"
              maxLength={80}
            />
          </div>

          <div>
            <Label htmlFor="invoice-status">Status</Label>
            <Select
              id="invoice-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as MockInvoice["status"])
              }
            >
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="invoice-email">Customer email</Label>
            <Input
              id="invoice-email"
              type="email"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              placeholder="customer@example.test"
            />
          </div>

          <div>
            <Label htmlFor="invoice-phone">Customer phone</Label>
            <Input
              id="invoice-phone"
              type="tel"
              inputMode="numeric"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="01712345678"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="invoice-due" required>
              Due date
            </Label>
            <Input
              id="invoice-due"
              type="date"
              value={dueDate ? dueDate.slice(0, 10) : ""}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="invoice-tax">Tax rate (%)</Label>
            <Input
              id="invoice-tax"
              type="number"
              min={0}
              max={100}
              inputMode="decimal"
              value={taxRate}
              onChange={(event) => setTaxRate(event.target.value)}
            />
          </div>
        </div>

        {/* Line items */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold text-ink">Line items</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Add line
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line-strong bg-elevated px-4 py-6 text-center text-[13px] text-ink-muted">
              No line items yet. Add one to describe what the customer is
              paying for.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="grid gap-2 rounded-lg border border-line bg-elevated px-3 py-3 sm:grid-cols-[minmax(0,1fr)_84px_110px_36px] sm:items-end"
                >
                  <div>
                    <Label htmlFor={`item-${item.id}-description`}>
                      Description
                    </Label>
                    <Input
                      id={`item-${item.id}-description`}
                      value={item.description}
                      onChange={(event) =>
                        updateItem(item.id, { description: event.target.value })
                      }
                      placeholder={`Line ${index + 1}`}
                      maxLength={120}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`item-${item.id}-quantity`}>Qty</Label>
                    <Input
                      id={`item-${item.id}-quantity`}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(item.id, {
                          quantity: Number(event.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor={`item-${item.id}-price`}>Unit price</Label>
                    <Input
                      id={`item-${item.id}-price`}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={item.unitPrice}
                      onChange={(event) =>
                        updateItem(item.id, {
                          unitPrice: Number(event.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove line ${index + 1}`}
                    className="mb-0.5 rounded-md p-2 text-ink-muted transition-colors hover:bg-danger-tint hover:text-danger-fg"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="invoice-discount">Discount (BDT)</Label>
            <Input
              id="invoice-discount"
              type="number"
              min={0}
              inputMode="numeric"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
            />
          </div>

          <div className="flex flex-col justify-end">
            <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-elevated px-4 py-3 text-[13px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-ink-muted">Subtotal</span>
                <span className="font-medium text-ink">
                  {formatBDT(totals.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-ink-muted">Discount</span>
                <span className="font-medium text-ink">
                  −{formatBDT(totals.discount)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-ink-muted">Tax ({totals.taxRate}%)</span>
                <span className="font-medium text-ink">
                  {formatBDT(totals.tax)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-4 border-t border-line pt-1.5">
                <span className="font-semibold text-ink">Total</span>
                <span className="text-base font-semibold text-ink">
                  {formatBDT(totals.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="invoice-notes">Notes</Label>
          <Textarea
            id="invoice-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Payment instructions, delivery terms, anything else"
            maxLength={500}
          />
        </div>
      </div>
    </Modal>
  );
}

/**
 * The money totals for a set of line items.
 *
 * Kept here rather than in the mock layer so the form can show a running
 * total before the invoice exists. The same rule applies: a discount can
 * never make the taxable amount negative.
 */
export function computeTotals(
  items: MockInvoiceLine[],
  taxRate: number,
  discount: number,
) {
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0,
  );
  const appliedDiscount = Math.min(Math.max(discount, 0), subtotal);
  const taxable = Math.max(0, subtotal - appliedDiscount);
  const tax = Math.round((taxable * taxRate) / 100);

  return {
    subtotal,
    discount: appliedDiscount,
    tax,
    total: taxable + tax,
    taxRate,
  };
}

/** The fields the invoice form collects. */
export interface InvoiceValues {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  dueDate: string;
  items: MockInvoiceLine[];
  taxRate: number;
  discount: number;
  notes: string;
  status: MockInvoice["status"];
}

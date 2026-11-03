"use client";

import * as React from "react";
import { Link2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Label, Select } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { PROVIDER_LIST } from "@/data/providers";
import type { MockPaymentLink } from "@/mock";

/**
 * The payment-link form.
 *
 * A link is either a fixed amount or a flexible one where the customer
 * chooses. The two are mutually exclusive, so the amount field is disabled
 * rather than hidden when the link is flexible — the reader can see why.
 */
export function PaymentLinkForm({
  open,
  onClose,
  onSave,
  /** The link being edited, or null when creating a new one. */
  link,
}: {
  open: boolean;
  onClose: () => void;
  /** Called with the fields the reader entered. */
  onSave: (values: PaymentLinkValues) => void;
  link: MockPaymentLink | null;
}) {
  const { toast } = useToast();

  const [title, setTitle] = React.useState(link?.title ?? "");
  const [description, setDescription] = React.useState(link?.description ?? "");
  const [amount, setAmount] = React.useState(
    link?.amount === null || link?.amount === undefined
      ? ""
      : String(link.amount),
  );
  const [flexible, setFlexible] = React.useState(link?.flexible ?? false);
  const [provider, setProvider] = React.useState<string>(
    link?.provider ?? "ANY",
  );
  const [usageLimit, setUsageLimit] = React.useState(
    link?.usageLimit === null || link?.usageLimit === undefined
      ? ""
      : String(link.usageLimit),
  );
  const [expiryDays, setExpiryDays] = React.useState("30");
  const [redirectUrl, setRedirectUrl] = React.useState(link?.redirectUrl ?? "");
  const [collectName, setCollectName] = React.useState(
    link?.customerFields.some((field) => field.name === "Full name") ?? true,
  );
  const [collectPhone, setCollectPhone] = React.useState(
    link?.customerFields.some((field) => field.name === "Phone number") ?? true,
  );
  const [error, setError] = React.useState<string | null>(null);

  function handleSubmit() {
    setError(null);

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3) {
      setError("Give the link a title of at least 3 characters.");
      return;
    }

    let parsedAmount: number | null = null;
    if (!flexible) {
      parsedAmount = Number(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        setError("Enter the amount customers will pay, in BDT.");
        return;
      }
    }

    if (!collectName && !collectPhone) {
      setError("Collect at least one customer field, or the payment cannot be matched.");
      return;
    }

    const days = Number(expiryDays);
    if (!Number.isFinite(days) || days <= 0 || days > 365) {
      setError("Choose an expiry between 1 and 365 days.");
      return;
    }

    const customerFields: MockPaymentLink["customerFields"] = [];
    if (collectName) {
      customerFields.push({ name: "Full name", type: "text", required: true });
    }
    if (collectPhone) {
      customerFields.push({
        name: "Phone number",
        type: "phone",
        required: true,
      });
    }

    const limit = usageLimit.trim();
    const parsedLimit = limit === "" ? null : Number(limit);
    if (parsedLimit !== null && (!Number.isFinite(parsedLimit) || parsedLimit <= 0)) {
      setError("The usage limit must be a positive whole number, or left empty.");
      return;
    }

    const redirect = redirectUrl.trim();
    if (redirect && !/^https?:\/\/.+/.test(redirect)) {
      setError("The redirect must be a full http or https URL.");
      return;
    }

    onSave({
      title: trimmedTitle,
      description: description.trim(),
      amount: parsedAmount,
      flexible,
      provider: provider as MockPaymentLink["provider"],
      usageLimit: parsedLimit,
      expiresInDays: days,
      redirectUrl: redirect || null,
      customerFields,
    });

    toast({
      title: link ? "Link updated" : "Link created",
      description: link
        ? `${trimmedTitle} was updated.`
        : `${trimmedTitle} is ready to share.`,
      tone: "success",
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={link ? "Edit payment link" : "Create payment link"}
      description={
        link
          ? "Change what the customer sees and what the link accepts."
          : "A link you can share with a customer instead of sending an account number."
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={handleSubmit} type="button">
            {link ? "Save changes" : "Create link"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Alert tone="info">
          This link is a sample. Nothing is published and no customer can pay
          through it — the backend has no payment-link model yet.
        </Alert>

        {error ? <Alert tone="danger">{error}</Alert> : null}

        <div>
          <Label htmlFor="link-title" required>
            Title
          </Label>
          <Input
            id="link-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Order #4417 — Wireless keyboard"
            maxLength={120}
          />
          <p className="mt-1.5 text-[12px] text-ink-muted">
            This is what the customer sees at the top of the payment page.
          </p>
        </div>

        <div>
          <Label htmlFor="link-description">Description</Label>
          <Input
            id="link-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What the customer is paying for"
            maxLength={200}
          />
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-line bg-elevated px-4 py-4">
          <Checkbox
            id="link-flexible"
            checked={flexible}
            onChange={(event) => setFlexible(event.target.checked)}
            label="Let the customer choose the amount"
            description="Use this for deposits, tips and open-ended amounts."
          />

          <div>
            <Label htmlFor="link-amount" required={!flexible}>
              Amount (BDT)
            </Label>
            <Input
              id="link-amount"
              type="number"
              min={0}
              inputMode="numeric"
              value={amount}
              disabled={flexible}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
            />
            {flexible ? (
              <p className="mt-1.5 text-[12px] text-ink-muted">
                The customer sets the amount, so there is nothing to fix here.
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="link-provider">Payment method</Label>
            <Select
              id="link-provider"
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
            >
              <option value="ANY">Any method</option>
              {PROVIDER_LIST.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="link-expiry">Expires after</Label>
            <Select
              id="link-expiry"
              value={expiryDays}
              onChange={(event) => setExpiryDays(event.target.value)}
            >
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="link-limit">Usage limit</Label>
          <Input
            id="link-limit"
            type="number"
            min={0}
            inputMode="numeric"
            value={usageLimit}
            onChange={(event) => setUsageLimit(event.target.value)}
            placeholder="Unlimited"
          />
          <p className="mt-1.5 text-[12px] text-ink-muted">
            Leave this empty for no limit. When the limit is reached the link
            stops accepting payments.
          </p>
        </div>

        <div>
          <Label htmlFor="link-redirect">Redirect after payment</Label>
          <Input
            id="link-redirect"
            value={redirectUrl}
            onChange={(event) => setRedirectUrl(event.target.value)}
            placeholder="https://your-store.test/order/4417"
          />
          <p className="mt-1.5 text-[12px] text-ink-muted">
            Where the customer lands once the payment is recorded.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-line bg-elevated px-4 py-4">
          <p className="text-[13px] font-semibold text-ink">Customer fields</p>
          <Checkbox
            id="link-collect-name"
            checked={collectName}
            onChange={(event) => setCollectName(event.target.checked)}
            label="Full name"
            description="Helps you recognise who paid."
          />
          <Checkbox
            id="link-collect-phone"
            checked={collectPhone}
            onChange={(event) => setCollectPhone(event.target.checked)}
            label="Phone number"
            description="Used to match the notification to the order."
          />
          <p className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-muted">
            <Link2
              className="mt-0.5 size-3.5 shrink-0 text-ink-faint"
              aria-hidden="true"
            />
            ZevaPay never asks for a PIN or an OTP — only the fields you tick
            here.
          </p>
        </div>
      </div>
    </Modal>
  );
}

/** The fields the payment-link form collects. */
export interface PaymentLinkValues {
  title: string;
  description: string;
  amount: number | null;
  flexible: boolean;
  provider: MockPaymentLink["provider"];
  usageLimit: number | null;
  expiresInDays: number;
  redirectUrl: string | null;
  customerFields: MockPaymentLink["customerFields"];
}

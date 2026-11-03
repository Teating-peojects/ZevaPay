"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Label, Select } from "@/components/ui/form";
import { PROVIDER_LIST } from "@/data/providers";
import type { MockBrand, MockPaymentAccount } from "@/mock";

/**
 * The brand form.
 *
 * A brand is one storefront: its name, its colours, the accounts it takes
 * money through and the webhook it calls. One merchant can run several.
 */
export function BrandForm({
  open,
  onClose,
  onSave,
  brand,
  accounts,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (values: BrandValues) => void;
  /** The brand being edited, or null when creating a new one. */
  brand: MockBrand | null;
  /** The accounts that can be assigned to a brand. */
  accounts: MockPaymentAccount[];
}) {
  const [name, setName] = React.useState(brand?.name ?? "");
  const [websiteUrl, setWebsiteUrl] = React.useState(brand?.websiteUrl ?? "");
  const [color, setColor] = React.useState(brand?.color ?? "#223b67");
  const [logoText, setLogoText] = React.useState(brand?.logoText ?? "");
  const [logoColor, setLogoColor] = React.useState(
    brand?.logoColor ?? brand?.color ?? "#223b67",
  );
  const [contactEmail, setContactEmail] = React.useState(
    brand?.contactEmail ?? "",
  );
  const [contactPhone, setContactPhone] = React.useState(
    brand?.contactPhone ?? "",
  );
  const [checkoutTheme, setCheckoutTheme] = React.useState(
    brand?.checkoutTheme ?? "LIGHT",
  );
  const [status, setStatus] = React.useState(brand?.status ?? "ACTIVE");
  const [webhookUrl, setWebhookUrl] = React.useState(brand?.webhookUrl ?? "");
  const [accountIds, setAccountIds] = React.useState<string[]>(
    brand?.accountIds ?? [],
  );
  const [error, setError] = React.useState<string | null>(null);

  function toggleAccount(id: string) {
    setAccountIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function handleSubmit() {
    setError(null);

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("Give the brand a name of at least 2 characters.");
      return;
    }

    const site = websiteUrl.trim();
    if (site && !/^https?:\/\/.+/.test(site)) {
      setError("The website must be a full http or https URL.");
      return;
    }

    const email = contactEmail.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address, or leave it empty.");
      return;
    }

    const phone = contactPhone.trim();
    if (phone && !/^01[3-9]\d{8}$/.test(phone)) {
      setError("Enter a valid 11-digit mobile number, or leave it empty.");
      return;
    }

    const hook = webhookUrl.trim();
    if (hook && !/^https?:\/\/.+/.test(hook)) {
      setError("The webhook must be a full http or https URL.");
      return;
    }

    const initials = logoText.trim() || trimmedName.slice(0, 2).toUpperCase();

    onSave({
      name: trimmedName,
      websiteUrl: site,
      color,
      logoText: initials.slice(0, 3),
      logoColor,
      contactEmail: email,
      contactPhone: phone,
      checkoutTheme,
      status,
      webhookUrl: hook || null,
      accountIds,
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={brand ? "Edit brand" : "Create brand"}
      description={
        brand
          ? `${brand.name} — change how this storefront looks and where it sends its money.`
          : "A separate storefront under your merchant account."
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={handleSubmit} type="button">
            {brand ? "Save changes" : "Create brand"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Alert tone="info">
          Brands are sample records. Nothing is published and no checkout page
          is served from them yet — the backend has no brand model.
        </Alert>

        {error ? <Alert tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="brand-name" required>
              Brand name
            </Label>
            <Input
              id="brand-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. TechPoint Accessories"
              maxLength={80}
            />
          </div>

          <div>
            <Label htmlFor="brand-website">Website</Label>
            <Input
              id="brand-website"
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              placeholder="https://your-store.test"
            />
          </div>
        </div>

        {/* Logo and colour */}
        <div className="flex flex-col gap-4 rounded-lg border border-line bg-elevated px-4 py-4">
          <p className="text-[13px] font-semibold text-ink">Appearance</p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className="flex size-16 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white"
              style={{ backgroundColor: logoColor }}
              aria-hidden="true"
            >
              {logoText.trim() || name.slice(0, 2).toUpperCase() || "—"}
            </div>

            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="brand-logo-text">Logo text</Label>
                <Input
                  id="brand-logo-text"
                  value={logoText}
                  onChange={(event) => setLogoText(event.target.value)}
                  placeholder="Auto"
                  maxLength={3}
                />
                <p className="mt-1.5 text-[12px] text-ink-muted">
                  Up to three characters. Left empty, the brand name is used.
                </p>
              </div>

              <div>
                <Label htmlFor="brand-logo-color">Logo colour</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="brand-logo-color"
                    type="color"
                    value={logoColor}
                    onChange={(event) => setLogoColor(event.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-line-strong bg-surface p-1"
                  />
                  <code className="font-mono text-[13px] text-ink-muted">
                    {logoColor}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="brand-color">Checkout accent colour</Label>
            <div className="flex items-center gap-2">
              <input
                id="brand-color"
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-line-strong bg-surface p-1"
              />
              <code className="font-mono text-[13px] text-ink-muted">{color}</code>
            </div>
            <p className="mt-1.5 text-[12px] text-ink-muted">
              Used for the pay button and the heading on the checkout page.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="brand-theme">Checkout theme</Label>
              <Select
                id="brand-theme"
                value={checkoutTheme}
                onChange={(event) =>
                  setCheckoutTheme(event.target.value as MockBrand["checkoutTheme"])
                }
              >
                <option value="LIGHT">Light</option>
                <option value="DARK">Dark</option>
                <option value="SYSTEM">Match the device</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="brand-status">Status</Label>
              <Select
                id="brand-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as MockBrand["status"])
                }
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="brand-email">Contact email</Label>
            <Input
              id="brand-email"
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              placeholder="support@your-store.test"
            />
          </div>

          <div>
            <Label htmlFor="brand-phone">Contact phone</Label>
            <Input
              id="brand-phone"
              type="tel"
              inputMode="numeric"
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
              placeholder="01712345678"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="brand-webhook">Webhook URL</Label>
          <Input
            id="brand-webhook"
            value={webhookUrl}
            onChange={(event) => setWebhookUrl(event.target.value)}
            placeholder="https://your-store.test/api/zevapay"
          />
          <p className="mt-1.5 text-[12px] text-ink-muted">
            Where this brand&apos;s payment events are delivered.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-semibold text-ink">Assigned accounts</p>
          {accounts.length === 0 ? (
            <p className="text-[13px] text-ink-muted">
              No payment accounts are available to assign.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5 rounded-lg border border-line bg-elevated px-4 py-3.5">
              {accounts.map((account) => (
                <li key={account.id}>
                  <Checkbox
                    id={`brand-account-${account.id}`}
                    checked={accountIds.includes(account.id)}
                    onChange={() => toggleAccount(account.id)}
                    label={
                      <span className="flex items-center gap-2">
                        <span>{account.label}</span>
                        <span className="font-mono text-[12px] text-ink-muted">
                          {account.accountNumber}
                        </span>
                        <span className="text-[12px] text-ink-faint">
                          {PROVIDER_LIST.find(
                            (provider) => provider.id === account.provider,
                          )?.name ?? account.provider}
                        </span>
                      </span>
                    }
                  />
                </li>
              ))}
            </ul>
          )}
          <p className="text-[12px] text-ink-muted">
            Payments made through this brand are attributed to the accounts
            ticked here.
          </p>
        </div>
      </div>
    </Modal>
  );
}

/** The fields the brand form collects. */
export interface BrandValues {
  name: string;
  websiteUrl: string;
  color: string;
  logoText: string;
  logoColor: string;
  contactEmail: string;
  contactPhone: string;
  checkoutTheme: MockBrand["checkoutTheme"];
  status: MockBrand["status"];
  webhookUrl: string | null;
  accountIds: string[];
}

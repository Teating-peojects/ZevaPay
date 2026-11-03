"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Switch, Textarea } from "@/components/ui/form";
import { PROVIDER_LIST } from "@/data/providers";
import { ProviderLogo } from "@/components/shared/provider-logo";
import type { MockBrand, MockCheckoutConfig } from "@/mock";
import type { PaymentProvider } from "@/types/api";

/**
 * The checkout settings form.
 *
 * It is a controlled component: the page owns the draft so the preview beside
 * it can redraw on every keystroke. Nothing here writes to the mock layer —
 * saving is the page's job.
 */
export function CheckoutForm({
  config,
  brands,
  error,
  onChange,
}: {
  /** The draft being edited. */
  config: MockCheckoutConfig;
  /** The brands the merchant runs, for the identity picker. */
  brands: MockBrand[];
  /** A validation message for the whole form, if any. */
  error: string | null;
  /** Called with the full next draft whenever a field changes. */
  onChange: (next: MockCheckoutConfig) => void;
}) {
  function patch(changes: Partial<MockCheckoutConfig>) {
    onChange({ ...config, ...changes });
  }

  function moveMethod(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= config.methodOrder.length) return;

    const methodOrder = [...config.methodOrder];
    const [moved] = methodOrder.splice(index, 1);
    methodOrder.splice(target, 0, moved);
    patch({ methodOrder });
  }

  function removeMethod(method: PaymentProvider) {
    patch({
      methodOrder: config.methodOrder.filter((entry) => entry !== method),
    });
  }

  function addMethod(method: PaymentProvider) {
    if (config.methodOrder.includes(method)) return;
    patch({ methodOrder: [...config.methodOrder, method] });
  }

  function setInstruction(index: number, value: string) {
    const instructions = [...config.instructions];
    instructions[index] = value;
    patch({ instructions });
  }

  function moveInstruction(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= config.instructions.length) return;

    const instructions = [...config.instructions];
    const [moved] = instructions.splice(index, 1);
    instructions.splice(target, 0, moved);
    patch({ instructions });
  }

  function removeInstruction(index: number) {
    patch({
      instructions: config.instructions.filter((_, position) => position !== index),
    });
  }

  function addInstruction() {
    patch({ instructions: [...config.instructions, ""] });
  }

  const availableMethods = PROVIDER_LIST.filter(
    (provider) => !config.methodOrder.includes(provider.id),
  );

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-danger-line bg-danger-tint px-4 py-3 text-[13px] text-danger-text"
        >
          {error}
        </div>
      ) : null}

      {/* Identity */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Identity</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Whose name and logo the customer sees.
          </p>
        </div>

        <div>
          <Label htmlFor="checkout-brand">Brand</Label>
          <Select
            id="checkout-brand"
            value={config.brandId ?? ""}
            onChange={(event) =>
              patch({ brandId: event.target.value || null })
            }
          >
            <option value="">No brand — show &quot;Your business&quot;</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </Select>
          <p className="mt-1.5 text-[12px] text-ink-muted">
            Each brand can have its own accounts and its own webhook.
          </p>
        </div>

        <Switch
          id="checkout-show-logo"
          checked={config.showLogo}
          onCheckedChange={(checked) => patch({ showLogo: checked })}
          label="Show the logo"
          description="The brand's logo appears at the top of the page."
        />
      </section>

      {/* Appearance */}
      <section className="flex flex-col gap-4 border-t border-line pt-6">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Appearance</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            The colours and theme of the payment page.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="checkout-theme">Theme</Label>
            <Select
              id="checkout-theme"
              value={config.theme}
              onChange={(event) =>
                patch({ theme: event.target.value as MockCheckoutConfig["theme"] })
              }
            >
              <option value="LIGHT">Light</option>
              <option value="DARK">Dark</option>
              <option value="SYSTEM">Follow the customer&apos;s device</option>
            </Select>
            <p className="mt-1.5 text-[12px] text-ink-muted">
              The preview draws the light theme for &quot;follow the
              device&quot;.
            </p>
          </div>

          <div>
            <Label htmlFor="checkout-accent">Accent colour</Label>
            <div className="flex items-center gap-2">
              <input
                id="checkout-accent-picker"
                type="color"
                value={/^#[0-9a-f]{6}$/i.test(config.accentColor) ? config.accentColor : "#223b67"}
                onChange={(event) => patch({ accentColor: event.target.value })}
                className="size-10 shrink-0 cursor-pointer rounded-lg border border-line-strong bg-surface p-1"
                aria-label="Pick the accent colour"
              />
              <Input
                id="checkout-accent"
                value={config.accentColor}
                onChange={(event) => patch({ accentColor: event.target.value })}
                className="font-mono"
                maxLength={7}
              />
            </div>
            <p className="mt-1.5 text-[12px] text-ink-muted">
              Used for the pay button. A hex value like #223b67.
            </p>
          </div>
        </div>

        <Switch
          id="checkout-show-amount"
          checked={config.showAmount}
          onCheckedChange={(checked) => patch({ showAmount: checked })}
          label="Show the amount"
          description="The amount is shown at the top of the page."
        />
        <Switch
          id="checkout-show-summary"
          checked={config.showOrderSummary}
          onCheckedChange={(checked) => patch({ showOrderSummary: checked })}
          label="Show the order summary"
          description="The order reference appears under the brand name."
        />
      </section>

      {/* Payment methods */}
      <section className="flex flex-col gap-4 border-t border-line pt-6">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Payment methods</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            The order the customer sees them in. The first one is the one they
            land on.
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {config.methodOrder.length === 0 ? (
            <li className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-[13px] text-ink-muted">
              No methods selected. A checkout page with no methods cannot take
              a payment.
            </li>
          ) : null}
          {config.methodOrder.map((method, index) => {
            const meta = PROVIDER_LIST.find(
              (provider) => provider.id === method,
            );
            return (
              <li
                key={method}
                className="flex items-center gap-2.5 rounded-lg border border-line bg-elevated px-3 py-2"
              >
                {meta ? <ProviderLogo provider={meta.id} size="sm" /> : null}
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
                  {meta?.name ?? method}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  aria-label={`Move ${meta?.name ?? method} up`}
                  disabled={index === 0}
                  onClick={() => moveMethod(index, -1)}
                >
                  <ArrowUp className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  aria-label={`Move ${meta?.name ?? method} down`}
                  disabled={index === config.methodOrder.length - 1}
                  onClick={() => moveMethod(index, 1)}
                >
                  <ArrowDown className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  aria-label={`Remove ${meta?.name ?? method}`}
                  onClick={() => removeMethod(method)}
                >
                  <Trash2 className="size-4 text-danger-fg" aria-hidden="true" />
                </Button>
              </li>
            );
          })}
        </ul>

        {availableMethods.length > 0 ? (
          <div>
            <Label htmlFor="checkout-add-method">Add a method</Label>
            <div className="flex items-center gap-2">
              <Select
                id="checkout-add-method"
                value=""
                onChange={(event) => {
                  const value = event.target.value;
                  if (value) addMethod(value as PaymentProvider);
                }}
              >
                <option value="">Choose a method to add</option>
                {availableMethods.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </Select>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  const first = availableMethods[0];
                  if (first) addMethod(first.id);
                }}
              >
                <Plus className="size-4" aria-hidden="true" />
                Add
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      {/* Instructions */}
      <section className="flex flex-col gap-4 border-t border-line pt-6">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Instructions</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            The numbered steps shown above the account the customer pays into.
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {config.instructions.map((step, index) => (
            <li key={`instruction-${index}`} className="flex items-start gap-2">
              <span className="mt-2.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-elevated text-[11px] font-semibold text-ink-muted">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <Textarea
                  value={step}
                  onChange={(event) => setInstruction(index, event.target.value)}
                  className="min-h-16"
                  maxLength={200}
                  aria-label={`Instruction ${index + 1}`}
                  placeholder="What the customer should do at this step"
                />
              </div>
              <div className="mt-1 flex shrink-0 flex-col gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  aria-label={`Move instruction ${index + 1} up`}
                  disabled={index === 0}
                  onClick={() => moveInstruction(index, -1)}
                >
                  <ArrowUp className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  aria-label={`Move instruction ${index + 1} down`}
                  disabled={index === config.instructions.length - 1}
                  onClick={() => moveInstruction(index, 1)}
                >
                  <ArrowDown className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  aria-label={`Remove instruction ${index + 1}`}
                  onClick={() => removeInstruction(index)}
                >
                  <Trash2 className="size-4 text-danger-fg" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <div>
          <Button variant="outline" type="button" onClick={addInstruction}>
            <Plus className="size-4" aria-hidden="true" />
            Add instruction
          </Button>
        </div>
      </section>

      {/* Redirects */}
      <section className="flex flex-col gap-4 border-t border-line pt-6">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Redirects</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Where the customer lands once ZevaPay records their notification.
          </p>
        </div>

        <div>
          <Label htmlFor="checkout-success-url">After a payment is recorded</Label>
          <Input
            id="checkout-success-url"
            value={config.successUrl}
            onChange={(event) => patch({ successUrl: event.target.value })}
            placeholder="https://your-store.test/order/complete"
          />
          <p className="mt-1.5 text-[12px] text-ink-muted">
            The customer is sent here when a notification is received. It does
            not mean the payment was confirmed with the provider.
          </p>
        </div>

        <div>
          <Label htmlFor="checkout-failed-url">
            When a payment cannot be matched
          </Label>
          <Input
            id="checkout-failed-url"
            value={config.failedUrl}
            onChange={(event) => patch({ failedUrl: event.target.value })}
            placeholder="https://your-store.test/order/failed"
          />
        </div>
      </section>

      {/* What the customer is asked for */}
      <section className="flex flex-col gap-4 border-t border-line pt-6">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">
            What the customer is asked for
          </h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            ZevaPay never asks for a PIN or an OTP — not here, not anywhere.
          </p>
        </div>

        <Switch
          id="checkout-collect-trxid"
          checked={config.collectTrxId}
          onCheckedChange={(checked) => patch({ collectTrxId: checked })}
          label="Ask for the transaction ID"
          description="The TrxID from the payment app's confirmation screen. It helps match the payment to the order."
        />
        <Switch
          id="checkout-collect-terms"
          checked={config.collectTerms}
          onCheckedChange={(checked) => patch({ collectTerms: checked })}
          label="Ask the customer to accept your terms"
          description="Shows a checkbox for your terms and refund policy."
        />
      </section>
    </div>
  );
}

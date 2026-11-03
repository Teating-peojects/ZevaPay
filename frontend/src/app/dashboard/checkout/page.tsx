"use client";

import * as React from "react";
import { RotateCcw, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/format";
import {
  mockFetchBrands,
  mockFetchCheckoutConfig,
  mockUpdateCheckoutConfig,
  type MockCheckoutConfig,
} from "@/mock";
import { CheckoutForm } from "./checkout-form";
import { CheckoutPreview } from "./checkout-preview";

/**
 * The checkout builder.
 *
 * The form on the left is the draft; the panel on the right draws that draft
 * as the customer would see it. Nothing is published — the backend has no
 * checkout model, and this page says so rather than pretending otherwise.
 */
export default function CheckoutBuilderPage() {
  const { toast } = useToast();

  // The saved draft is the starting point. Reading it in the initialiser
  // keeps the draft from being reset by a re-render.
  const [saved, setSaved] = React.useState<MockCheckoutConfig>(() =>
    mockFetchCheckoutConfig(),
  );
  const [draft, setDraft] = React.useState<MockCheckoutConfig>(saved);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const brands = React.useMemo(
    () => mockFetchBrands({ pageSize: 100 }).rows,
    [],
  );
  const brand =
    brands.find((entry) => entry.id === draft.brandId) ?? null;

  function validate(): string | null {
    if (draft.methodOrder.length === 0) {
      return "Choose at least one payment method. A checkout page with no methods cannot take a payment.";
    }
    if (!/^#[0-9a-f]{6}$/i.test(draft.accentColor.trim())) {
      return "The accent colour must be a hex value like #223b67.";
    }
    for (const [index, step] of draft.instructions.entries()) {
      if (step.trim() === "") {
        return `Instruction ${index + 1} is empty. Remove it or write the step.`;
      }
    }
    for (const [label, value] of [
      ["success", draft.successUrl],
      ["failed", draft.failedUrl],
    ] as const) {
      const trimmed = value.trim();
      if (trimmed && !/^https?:\/\/.+/.test(trimmed)) {
        return `The ${label} redirect must be a full http or https URL.`;
      }
    }
    return null;
  }

  function handleSave() {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    setSaving(true);

    const next = mockUpdateCheckoutConfig({
      ...draft,
      accentColor: draft.accentColor.trim(),
      successUrl: draft.successUrl.trim(),
      failedUrl: draft.failedUrl.trim(),
      instructions: draft.instructions.map((step) => step.trim()),
    });

    setDraft(next);
    setSaved(next);

    setSaving(false);
    toast({
      title: "Draft saved",
      description:
        "The checkout page settings were saved to this browser session. Nothing was published.",
      tone: "success",
    });
  }

  function handleReset() {
    setDraft(saved);
    setError(null);
    toast({
      title: "Draft reset",
      description: "The form is back to the last saved settings.",
      tone: "info",
    });
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Checkout Builder"
        description="The payment page your customers land on."
        actions={
          <div className="flex items-center gap-2">
            <DemoBadge label="Demo checkout" />
            <Button variant="outline" type="button" onClick={handleReset}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset
            </Button>
            <Button type="button" onClick={handleSave} loading={saving}>
              <Save className="size-4" aria-hidden="true" />
              Save draft
            </Button>
          </div>
        }
      />

      <DemoNotice title="Sample checkout page">
        The backend has no checkout model yet. This builder saves a draft in
        this browser session only — no page is published, no customer can pay
        through it, and no payment is processed.
      </DemoNotice>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <Card>
          <CardHeader>
            <CardTitle>Page settings</CardTitle>
            <p className="text-[13px] text-ink-muted">
              The preview on the right redraws as you change these.
            </p>
          </CardHeader>
          <CardContent>
            <CheckoutForm
              config={draft}
              brands={brands}
              error={error}
              onChange={(next) => {
                setDraft(next);
                if (error) setError(null);
              }}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-ink">Live preview</h2>
            <span className="text-[12px] text-ink-muted">
              Last saved {formatDate(saved.updatedAt)}
            </span>
          </div>

          <Alert tone="info" title="A drawing, not a live page">
            This is what the page would look like. The sample order below is a
            placeholder — no payment can be made through it.
          </Alert>

          <CheckoutPreview
            config={draft}
            brand={brand}
            orderReference="ORD-4417"
            amount={4850}
          />

          <div className="rounded-lg border border-line bg-elevated px-4 py-3">
            <p className="text-[13px] font-semibold text-ink">
              {dirty ? "Unsaved changes" : "Everything is saved"}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
              {dirty
                ? "The form and the saved draft differ. Save the draft to keep these settings."
                : "The form matches the saved draft."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

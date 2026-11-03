"use client";

import * as React from "react";
import { Globe, Receipt, Save } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input, Label, Select, Switch, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import type { MockMerchantSettings } from "@/mock";

/**
 * Regional and checkout preferences.
 *
 * These are the settings a Bangladeshi merchant actually changes: the
 * currency, the timezone, and whether the checkout page says its labels in
 * Bangla. The backend has no settings model for them yet, so the page stores
 * them in the demo layer and says so.
 */
export function RegionalPreferences({
  settings,
  onSave,
}: {
  settings: MockMerchantSettings;
  onSave: (patch: Partial<MockMerchantSettings>) => void;
}) {
  const { toast } = useToast();

  const [draft, setDraft] = React.useState<MockMerchantSettings>(settings);
  const [saving, setSaving] = React.useState(false);

  // When the page reloads the settings, the form follows.
  const [loadedSettings, setLoadedSettings] = React.useState(settings);
  if (loadedSettings !== settings) {
    setLoadedSettings(settings);
    setDraft(settings);
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  function update<K extends keyof MockMerchantSettings>(
    key: K,
    value: MockMerchantSettings[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    setSaving(true);
    onSave({
      businessName: draft.businessName,
      website: draft.website,
      address: draft.address,
      city: draft.city,
      postcode: draft.postcode,
      country: draft.country,
      currency: draft.currency,
      timezone: draft.timezone,
      language: draft.language,
      banglaLabels: draft.banglaLabels,
      checkoutInstructions: draft.checkoutInstructions,
      termsUrl: draft.termsUrl,
      invoicePrefix: draft.invoicePrefix,
    });
    setSaving(false);

    toast({
      title: "Preferences saved",
      description:
        "Stored in the demo dataset. The backend has no settings model for these yet.",
      tone: "warning",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Business details</CardTitle>
          <CardDescription>
            The address that appears on invoices and receipts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pref-business-name" required>
                Business name
              </Label>
              <Input
                id="pref-business-name"
                value={draft.businessName}
                onChange={(event) => update("businessName", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pref-website">Website</Label>
              <Input
                id="pref-website"
                value={draft.website}
                onChange={(event) => update("website", event.target.value)}
                placeholder="https://yourbusiness.test"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pref-address">Address</Label>
            <Input
              id="pref-address"
              value={draft.address}
              onChange={(event) => update("address", event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="pref-city">City</Label>
              <Input
                id="pref-city"
                value={draft.city}
                onChange={(event) => update("city", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pref-postcode">Postcode</Label>
              <Input
                id="pref-postcode"
                value={draft.postcode}
                onChange={(event) => update("postcode", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pref-country">Country</Label>
              <Input
                id="pref-country"
                value={draft.country}
                onChange={(event) => update("country", event.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-ink-muted" aria-hidden="true" />
            <CardTitle>Regional preferences</CardTitle>
          </div>
          <CardDescription>
            The currency, timezone and language ZevaPay uses for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="pref-currency">Currency</Label>
              <Select
                id="pref-currency"
                value={draft.currency}
                onChange={(event) =>
                  update("currency", event.target.value as "BDT")
                }
              >
                <option value="BDT">BDT — ৳ Bangladeshi Taka</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="pref-timezone">Timezone</Label>
              <Select
                id="pref-timezone"
                value={draft.timezone}
                onChange={(event) =>
                  update("timezone", event.target.value as "Asia/Dhaka")
                }
              >
                <option value="Asia/Dhaka">Asia/Dhaka (UTC+6)</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="pref-language">Dashboard language</Label>
              <Select
                id="pref-language"
                value={draft.language}
                onChange={(event) =>
                  update("language", event.target.value as "en" | "bn")
                }
              >
                <option value="en">English</option>
                <option value="bn">বাংলা (Bangla)</option>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-elevated px-4 py-3">
            <Switch
              id="pref-bangla-labels"
              checked={draft.banglaLabels}
              onCheckedChange={(checked) => update("banglaLabels", checked)}
              label="Show Bangla labels on the checkout page"
              description="The buttons and field labels your customers see appear in Bangla. Your dashboard stays in the language you chose above."
            />
          </div>

          <Alert tone="info" title="Bangladesh only, for now">
            Bangladeshi Taka and the Dhaka timezone are the only options. A
            merchant outside Bangladesh would need more currencies and zones
            than the product currently supports.
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="size-4 text-ink-muted" aria-hidden="true" />
            <CardTitle>Checkout and invoices</CardTitle>
          </div>
          <CardDescription>
            What your customer sees at checkout, and how your invoices are
            numbered.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="pref-instructions">Checkout instructions</Label>
            <Textarea
              id="pref-instructions"
              rows={3}
              value={draft.checkoutInstructions}
              onChange={(event) =>
                update("checkoutInstructions", event.target.value)
              }
              hint="Shown above the payment instructions on your checkout page."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pref-terms">Terms URL</Label>
              <Input
                id="pref-terms"
                value={draft.termsUrl}
                onChange={(event) => update("termsUrl", event.target.value)}
                placeholder="https://yourbusiness.test/terms"
              />
            </div>
            <div>
              <Label htmlFor="pref-invoice-prefix">Invoice number prefix</Label>
              <Input
                id="pref-invoice-prefix"
                value={draft.invoicePrefix}
                onChange={(event) => update("invoicePrefix", event.target.value)}
              />
            </div>
          </div>

          <p className="text-[12px] leading-relaxed text-ink-muted">
            The next invoice would be numbered{" "}
            <span className="font-mono text-ink">
              {draft.invoicePrefix}
              {draft.invoiceNextNumber}
            </span>
            .
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {dirty ? (
          <span className="text-[13px] text-ink-muted">Unsaved changes</span>
        ) : null}
        <Button
          type="button"
          onClick={handleSave}
          loading={saving}
          disabled={!dirty}
        >
          <Save className="size-4" aria-hidden="true" />
          Save preferences
        </Button>
      </div>
    </div>
  );
}

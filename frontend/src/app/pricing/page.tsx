import type { Metadata } from "next";
import Link from "next/link";
import { PublicLayout } from "@/components/marketing/public-layout";
import {
  PricingLimitsTable,
  PricingPlans,
} from "@/components/marketing/pricing-plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "@/components/ui/demo-badge";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "ZevaPay plans and limits. Pricing shown here is configurable sample content, not a published price list.",
};

export default function PricingPage() {
  return (
    <PublicLayout>
      <section className="border-b border-line bg-elevated">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <Badge tone="brand">Pricing</Badge>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl sm:leading-[1.15]">
            Pay for the volume you actually have.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Every plan includes the full ZevaPay workflow — accounts, devices,
            transaction review, and the developer API. Higher plans raise the
            limits and add the collection and reporting tools.
          </p>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <DemoNotice title="Sample pricing">
            The prices and limits on this page are configurable sample content
            shown for demonstration. They are not a published price list, and
            no charge is made for any plan shown here. Your actual plan and
            its limits are visible in the billing page inside your dashboard.
          </DemoNotice>

          <PricingPlans />
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Plan limits
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            Each plan caps what a single merchant can use. Usage against these
            limits is shown in the billing page of your own dashboard.
          </p>

          <PricingLimitsTable />
        </div>
      </section>

      <section className="border-b border-line bg-elevated">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Fees on the money you collect
          </h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-soft">
            ZevaPay does not charge a percentage of what you collect. Provider
            fees are set by each provider and vary by account type; the fee
            report in your dashboard shows the amounts recorded against your
            own accounts. Those figures are read from recorded notifications
            and are not a settlement statement.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "No percentage fee",
                body: "Your plan price is what you pay ZevaPay. The amount a provider charges you is separate and set by them.",
              },
              {
                title: "Provider fees vary",
                body: "A personal account and a merchant account are charged differently by each provider. We do not set those rates.",
              },
              {
                title: "Limits, not penalties",
                body: "Going over a limit stops the extra activity until the next period or a plan change. Nothing is billed as an overage.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-line bg-surface p-6"
              >
                <h3 className="text-[15px] font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="rounded-xl border border-line bg-elevated px-6 py-10 text-center sm:px-14">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Start on the free plan
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
              The free plan covers one payment account and one device, which is
              enough to see the whole flow before you decide anything.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Create a free account
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Ask a question
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

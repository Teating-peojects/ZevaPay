import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  DocsDefinition,
  DocsList,
  DocsPager,
  DocsSection,
  DocsText,
  DocsTitle,
} from "@/components/docs/docs-parts";

export const metadata: Metadata = {
  title: "Introduction",
  description:
    "What ZevaPay records, what it deliberately does not do, and how a payment notification becomes a transaction in your dashboard.",
};

/**
 * The introduction page of the developer portal.
 *
 * It leads with what ZevaPay is not, because an integration that assumes
 * ZevaPay settles payments will be built wrong from the first request.
 */
export default function DocsIntroductionPage() {
  return (
    <article className="flex flex-col gap-10">
      <DocsTitle
        badge="Developer docs"
        title="Introduction"
        description="ZevaPay records the payment notifications that reach your business, and gives you one place to read, review and export them. This portal describes the API around that record."
      />

      <Alert tone="info" title="Read this first">
        Every request, response and payload in this portal is{" "}
        <strong className="font-semibold">illustrative</strong>. The examples
        use a placeholder host and placeholder credentials, and describe the
        shape of an integration rather than a contract with a live endpoint.
        The developer page in your dashboard remains the authoritative
        reference for what ZevaPay exposes today.
      </Alert>

      <DocsSection id="what-zevapay-is" title="What ZevaPay is">
        <DocsText>
          A merchant&rsquo;s customers pay by sending money from a mobile
          financial services app. The merchant&rsquo;s Android phone then
          receives a notification. ZevaPay reads those notifications, parses
          them, and files them as transactions next to the account and the
          device that received them.
        </DocsText>
        <DocsText>
          From that record you can review what came in, filter it, export it,
          and send it to your own systems over the API or a webhook.
        </DocsText>
      </DocsSection>

      <DocsSection id="what-zevapay-is-not" title="What ZevaPay is not">
        <DocsText>
          ZevaPay does not connect to bKash, Nagad, Rocket or Upay. It has no
          integration with those providers and cannot ask them whether a
          payment succeeded.
        </DocsText>
        <Alert tone="warning" title="An SMS match is not proof of payment">
          A transaction is recorded from a notification. A parser that is
          confident about what it read has still only read a notification.
          ZevaPay never labels a payment as verified, and your integration
          should not either.
        </Alert>
        <DocsList
          items={[
            <>
              It does not send, hold, or move money. It has no ability to
              initiate a transfer.
            </>,
            <>
              It does not query a provider&rsquo;s ledger. A confirmation here
              means &ldquo;we received a notification that said this&rdquo;,
              not &ldquo;the provider confirmed this&rdquo;.
            </>,
            <>
              It does not ask for, store or handle a PIN or an OTP. Nothing in
              the checkout flow asks a customer for one.
            </>,
            <>
              It is not a settlement report. Reconciliation against a provider
              statement is still work you do.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection id="how-a-payment-is-recorded" title="How a payment is recorded">
        <ol className="flex flex-col gap-4">
          {[
            {
              title: "A notification arrives",
              body: "The customer sends money, and the merchant's paired device receives the provider's notification.",
            },
            {
              title: "The parser reads it",
              body: "A provider-specific parser extracts the amount, the TrxID and the sender where it can, and reports how confident it is. That confidence is never treated as proof.",
            },
            {
              title: "A transaction is written",
              body: "The record is created against the account the notification was received on, with the device, the amount and the raw notification text.",
            },
            {
              title: "It may need a review",
              body: "A record the parser could not read confidently is filed as Needs review. A person accepts or rejects it, and that decision is written back.",
            },
            {
              title: "It reaches your systems",
              body: "The transaction appears in your dashboard immediately, and — if you have set one up — is delivered to your webhook endpoint.",
            },
          ].map((step, index) => (
            <li key={step.title} className="flex gap-3.5">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[12px] font-semibold text-brand-ink">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-ink">{step.title}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </DocsSection>

      <DocsSection id="core-concepts" title="Core concepts">
        <div className="flex flex-col gap-3">
          <DocsDefinition term="Payment account">
            A mobile financial service number you have registered with
            ZevaPay. Notifications are filed against the account they were
            received on, so the same device can serve several accounts.
          </DocsDefinition>
          <DocsDefinition term="Device">
            The paired Android phone that reads notifications and forwards
            them. A device that is offline records nothing until it
            reconnects.
          </DocsDefinition>
          <DocsDefinition term="Transaction">
            One recorded notification. It carries the amount, the provider,
            the TrxID where one was read, and the status the parser gave it.
          </DocsDefinition>
          <DocsDefinition term="Review">
            A transaction the parser was not confident about. It waits in the
            review queue until a person decides, and the decision is stored
            against the record.
          </DocsDefinition>
          <DocsDefinition term="API key">
            The credential your server presents when it reads or writes your
            ZevaPay data. It is issued in the developer page, shown once, and
            can be revoked at any time.
          </DocsDefinition>
          <DocsDefinition term="Webhook">
            An HTTP request ZevaPay makes to your endpoint when something
            happens, so your system does not have to poll.
          </DocsDefinition>
        </div>
      </DocsSection>

      <DocsSection id="base-url-and-versioning" title="Base URL and versioning">
        <DocsText>
          Every endpoint lives under a versioned path. The version is part of
          the path rather than a header, so a request never changes meaning
          because a default moved.
        </DocsText>
        <div className="rounded-lg border border-line bg-elevated px-4 py-3">
          <code className="font-mono text-[13px] break-all text-ink">
            https://api.zevapay.test/api/v1
          </code>
          <p className="mt-2 text-[12px] text-ink-muted">
            The host above is a placeholder. Your real base URL is shown in
            your dashboard settings.
          </p>
        </div>
        <DocsList
          items={[
            <>
              A breaking change gets a new version path. The old version keeps
              working until you move off it.
            </>,
            <>
              Additive changes — a new optional field, a new event type — do
              not change the version. Ignore fields you do not recognise.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection id="where-next" title="Where to next">
        <DocsText>
          The quickest useful thing to read is the Quick Start, which walks
          through issuing a key and making a first call. If you already have a
          key, go straight to{" "}
          <Link
            href="/docs/create-payment"
            className="font-medium text-brand-link underline underline-offset-2"
          >
            Create Payment
          </Link>
          .
        </DocsText>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/quick-start">
            <Button>Read the Quick Start</Button>
          </Link>
          <Link href="/dashboard/developers">
            <Button variant="outline">Open the developer page</Button>
          </Link>
        </div>
      </DocsSection>

      <DocsPager
        next={{ href: "/docs/quick-start", label: "Quick Start" }}
      />
    </article>
  );
}

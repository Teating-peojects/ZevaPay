import type { Metadata } from "next";
import Link from "next/link";
import { CodeTabs } from "@/components/docs/code-block";
import {
  DocsFieldTable,
  DocsList,
  DocsPager,
  DocsSection,
  DocsText,
  DocsTitle,
  IllustrativeNotice,
} from "@/components/docs/docs-parts";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Create Payment",
  description:
    "The request and response shapes for creating a payment, and how idempotency protects a retried call.",
};

const CREATE = {
  curl: `curl -X POST https://api.zevapay.test/api/v1/payments \\
  -H "Authorization: Bearer zp_live_your_key" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order-4417" \\
  -d '{
    "amount": 2450,
    "currency": "BDT",
    "provider": "BKASH",
    "reference": "ORD-4417",
    "description": "Wireless headphones",
    "expiresIn": 3600
  }'`,
  node: `const response = await fetch("https://api.zevapay.test/api/v1/payments", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.ZEVAPAY_API_KEY}\`,
    "Content-Type": "application/json",
    "Idempotency-Key": "order-4417",
  },
  body: JSON.stringify({
    amount: 2450,
    currency: "BDT",
    provider: "BKASH",
    reference: "ORD-4417",
    description: "Wireless headphones",
    expiresIn: 3600,
  }),
});

if (!response.ok) {
  const error = await response.json();
  throw new Error(error.error.message);
}

const payment = await response.json();
console.log(payment.id, payment.checkoutUrl);`,
  php: `$payload = json_encode([
  "amount" => 2450,
  "currency" => "BDT",
  "provider" => "BKASH",
  "reference" => "ORD-4417",
  "description" => "Wireless headphones",
  "expiresIn" => 3600,
]);

$ch = curl_init();
curl_setopt_array($ch, [
  CURLOPT_URL => "https://api.zevapay.test/api/v1/payments",
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => $payload,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer " . getenv("ZEVAPAY_API_KEY"),
    "Content-Type: application/json",
    "Idempotency-Key: order-4417",
  ],
  CURLOPT_RETURNTRANSFER => true,
]);

$payment = json_decode(curl_exec($ch), true);
echo $payment["id"], " ", $payment["checkoutUrl"];`,
  python: `import os
import requests

response = requests.post(
    "https://api.zevapay.test/api/v1/payments",
    headers={
        "Authorization": f"Bearer {os.environ['ZEVAPAY_API_KEY']}",
        "Content-Type": "application/json",
        "Idempotency-Key": "order-4417",
    },
    json={
        "amount": 2450,
        "currency": "BDT",
        "provider": "BKASH",
        "reference": "ORD-4417",
        "description": "Wireless headphones",
        "expiresIn": 3600,
    },
    timeout=30,
)

response.raise_for_status()
payment = response.json()
print(payment["id"], payment["checkoutUrl"])`,
};

/**
 * The Create Payment page.
 *
 * The response example deliberately shows a payment that is still
 * &ldquo;Awaiting verification&rdquo;, because that is the honest state of a
 * payment that has just been created.
 */
export default function DocsCreatePaymentPage() {
  return (
    <article className="flex flex-col gap-10">
      <DocsTitle
        badge="API reference"
        title="Create Payment"
        description="Creating a payment request returns a checkout URL you can send to your customer. The money has not moved — the request is asking for it."
      />

      <IllustrativeNotice />

      <DocsSection id="the-endpoint" title="The endpoint">
        <div className="rounded-lg border border-line bg-elevated px-4 py-3">
          <code className="font-mono text-[13px] break-all text-ink">
            POST /api/v1/payments
          </code>
        </div>
        <DocsText>
          The key needs the <code className="font-mono text-[13px] text-ink">payments:write</code>{" "}
          scope. A key without it gets{" "}
          <code className="font-mono text-[13px] text-ink">FORBIDDEN</code>.
        </DocsText>
      </DocsSection>

      <DocsSection id="request-fields" title="Request fields">
        <DocsFieldTable
          caption="Request body"
          fields={[
            {
              name: "amount",
              type: "number",
              required: true,
              description:
                "The amount in Bangladeshi Taka, as a whole number. Taka are not subdivided in practice, so a decimal amount is rejected.",
            },
            {
              name: "currency",
              type: "string",
              description:
                "Always BDT. It is the only currency ZevaPay deals in, so it is also the default.",
            },
            {
              name: "provider",
              type: "string",
              required: true,
              description:
                "Which MFS the customer will pay from: BKASH, NAGAD, ROCKET or UPAY. It decides which account the payment is matched against.",
            },
            {
              name: "reference",
              type: "string",
              required: true,
              description:
                "Your own order reference. Use the number you already gave the customer so the two can be matched later.",
            },
            {
              name: "description",
              type: "string",
              description:
                "What is being paid for. Shown on the checkout page above the amount.",
            },
            {
              name: "customer",
              type: "object",
              description:
                "Optional customer details: name, phone and email. Collected for your records, and shown on the checkout page.",
            },
            {
              name: "expiresIn",
              type: "number",
              description:
                "How long the payment window stays open, in seconds. After it closes the checkout page explains that the link expired.",
            },
            {
              name: "metadata",
              type: "object",
              description:
                "Anything you want stored alongside the payment, and echoed back in webhooks. Use it for your own identifiers.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection id="the-request" title="The request">
        <CodeTabs
          samples={[
            { id: "curl", label: "cURL", code: CREATE.curl },
            { id: "node", label: "Node.js", code: CREATE.node },
            { id: "php", label: "PHP", code: CREATE.php },
            { id: "python", label: "Python", code: CREATE.python },
          ]}
        />
      </DocsSection>

      <DocsSection id="the-response" title="The response">
        <DocsText>
          A successful create returns <code className="font-mono text-[13px] text-ink">201</code>{" "}
          and the payment object.
        </DocsText>
        <div className="overflow-x-auto rounded-lg border border-line bg-elevated">
          <pre className="px-4 py-3.5 font-mono text-[12px] leading-relaxed text-ink-soft">
            <code>{`{
  "payment": {
    "id": "pay_1001",
    "reference": "ORD-4417",
    "amount": 2450,
    "currency": "BDT",
    "provider": "BKASH",
    "status": "PENDING",
    "description": "Wireless headphones",
    "checkoutUrl": "https://pay.zevapay.test/c/ORD-4417",
    "expiresAt": "2026-11-02T19:00:00.000Z",
    "createdAt": "2026-11-02T18:00:00.000Z"
  }
}`}</code>
          </pre>
        </div>
        <DocsFieldTable
          caption="Response fields"
          fields={[
            {
              name: "payment.id",
              type: "string",
              description: "The identifier to use when reading the payment back.",
            },
            {
              name: "payment.status",
              type: "string",
              description:
                "PENDING — the request is open and no notification has arrived for it yet.",
            },
            {
              name: "payment.checkoutUrl",
              type: "string",
              description:
                "Where to send your customer. Opening it shows the amount, the merchant and the payment details.",
            },
            {
              name: "payment.expiresAt",
              type: "string",
              description:
                "When the payment window closes. After this the checkout page will not accept a TrxID.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection id="idempotency" title="Idempotency">
        <DocsText>
          A write that is retried is the most common way to double-charge a
          customer, and it is entirely your client&rsquo;s doing. Send an{" "}
          <code className="font-mono text-[13px] text-ink">Idempotency-Key</code>{" "}
          header and a repeated call returns the payment that already exists
          instead of creating a second one.
        </DocsText>
        <DocsList
          items={[
            <>
              Use your order reference as the idempotency key. It is already
              unique in your system, so the mapping needs no extra bookkeeping.
            </>,
            <>
              The same key with a different body is a conflict — the API
              refuses it rather than guessing which one you meant.
            </>,
            <>
              Retrying with the same key is always safe, including after a
              timeout where you do not know whether the first call landed.
            </>,
          ]}
        />
        <Alert tone="info" title="Idempotency is not a substitute for checking">
          An idempotent retry returns the original payment. It does not
          confirm that the money arrived — only the notification does that.
        </Alert>
      </DocsSection>

      <DocsSection id="payment-statuses" title="Payment statuses">
        <DocsText>
          A payment moves through these statuses. They are the same words the
          dashboard uses, so a support conversation is not a translation
          exercise.
        </DocsText>
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-elevated">
                <th className="px-4 py-2.5 text-[12px] font-semibold text-ink-muted">
                  Status
                </th>
                <th className="px-4 py-2.5 text-[12px] font-semibold text-ink-muted">
                  What it means
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                {
                  code: "CREATED",
                  label: "Created",
                  detail:
                    "The request exists but no window has opened yet. Mocked in this prototype.",
                },
                {
                  code: "PENDING",
                  label: "Awaiting verification",
                  detail:
                    "The window is open and no notification has matched this payment yet.",
                },
                {
                  code: "REVIEW",
                  label: "Needs review",
                  detail:
                    "A notification arrived but the parser was not confident enough to record it as a match. A person decides.",
                },
                {
                  code: "SUCCESS",
                  label: "Confirmed from SMS",
                  detail:
                    "A notification was received and matched to this payment. It was not confirmed with the provider.",
                },
                {
                  code: "FAILED",
                  label: "Verification failed",
                  detail:
                    "A review rejected the record, or a notification arrived that did not match.",
                },
                {
                  code: "EXPIRED",
                  label: "Expired",
                  detail:
                    "The payment window closed before a matching notification arrived.",
                },
              ].map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="block font-mono text-[12px] text-ink">
                      {row.code}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-ink-muted">
                      {row.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
                    {row.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Alert tone="warning" title="&ldquo;Confirmed&rdquo; means confirmed from the notification">
          No status in ZevaPay means the provider verified the transfer.
          ZevaPay has no connection to the provider, so it cannot report one.
        </Alert>
      </DocsSection>

      <DocsSection id="reading-it-back" title="Reading it back">
        <DocsText>
          Once a payment exists, read it with{" "}
          <code className="font-mono text-[13px] text-ink">
            GET /api/v1/payments/:id
          </code>
          , or wait for a{" "}
          <Link
            href="/docs/webhooks"
            className="font-medium text-brand-link underline underline-offset-2"
          >
            webhook
          </Link>
          . If a webhook is not something you want to operate, polling the
          payment is a fine answer.
        </DocsText>
      </DocsSection>

      <DocsPager
        previous={{ href: "/docs/authentication", label: "Authentication" }}
        next={{ href: "/docs/webhooks", label: "Webhooks" }}
      />
    </article>
  );
}

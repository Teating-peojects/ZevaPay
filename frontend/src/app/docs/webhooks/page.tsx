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
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Webhooks",
  description:
    "Event types, payload shape, signature verification, and what happens when your endpoint is down.",
};

const VERIFY = {
  node: `import { createHmac, timingSafeEqual } from "node:crypto";

function verify(rawBody, header, secret) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = header?.replace(/^sha256=/, "") ?? "";

  if (expected.length !== received.length) return false;

  return timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(received, "utf8"),
  );
}

// The raw body is required — a re-serialised payload will not match.
const event = JSON.parse(rawBody);
if (!verify(rawBody, request.headers["x-zevapay-signature"], secret)) {
  return new Response("bad signature", { status: 400 });
}`,
  php: `$rawBody = file_get_contents("php://input");
$header = $_SERVER["HTTP_X_ZEVAPAY_SIGNATURE"] ?? "";
$signature = str_starts_with($header, "sha256=")
  ? substr($header, 7)
  : "";

$expected = hash_hmac("sha256", $rawBody, $secret);

if (!hash_equals($expected, $signature)) {
  http_response_code(400);
  exit("bad signature");
}

$event = json_decode($rawBody, true);`,
  python: `import hashlib
import hmac

def verify(raw_body: bytes, header: str, secret: str) -> bool:
    received = header.removeprefix("sha256=")
    expected = hmac.new(
        secret.encode(), raw_body, hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected, received)


# Pass the raw body, not a re-encoded dict.
if not verify(raw_body, request.headers.get("X-ZevaPay-Signature"), secret):
    return Response("bad signature", status=400)

event = json.loads(raw_body)`,
  curl: `# Verify the signature over the raw body before parsing it.
BODY='{"id":"evt_8K2M4Q","type":"payment.confirmed","createdAt":"2026-11-02T18:00:00.000Z"}'

EXPECTED=$(printf '%s' "$BODY" \\
  | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -hex \\
  | sed 's/^.* //')

RECEIVED=$(printf '%s' "$BODY" | sha256sum | cut -d" " -f1)

if [ "$EXPECTED" = "$RECEIVED" ]; then
  echo "signature ok"
else
  echo "bad signature" >&2
  exit 1
fi`,
};

const PAYLOAD = `{
  "id": "evt_8K2M4Q",
  "type": "payment.confirmed",
  "createdAt": "2026-11-02T18:00:00.000Z",
  "data": {
    "payment": {
      "id": "pay_1001",
      "reference": "ORD-4417",
      "amount": 2450,
      "currency": "BDT",
      "provider": "BKASH",
      "status": "SUCCESS",
      "description": "Wireless headphones",
      "trxId": "9F2KQ1L8M3",
      "receivedAt": "2026-11-02T18:00:00.000Z"
    }
  }
}`;

/**
 * The Webhooks page.
 *
 * The signature section is the important one — a webhook endpoint that
 * accepts anything posted to it is a way for a stranger to mark your
 * customer's order as paid.
 */
export default function DocsWebhooksPage() {
  return (
    <article className="flex flex-col gap-10">
      <DocsTitle
        badge="API reference"
        title="Webhooks"
        description="When something happens in your ZevaPay account, ZevaPay sends a POST request to an endpoint you control. Your system does not have to poll."
      />

      <IllustrativeNotice />

      <DocsSection id="event-types" title="Event types">
        <DocsText>
          A webhook is configured for a set of event types. You choose which
          ones you want, so an endpoint that only cares about money arriving
          does not have to handle device events.
        </DocsText>
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-elevated">
                <th className="px-4 py-2.5 text-[12px] font-semibold text-ink-muted">
                  Event
                </th>
                <th className="px-4 py-2.5 text-[12px] font-semibold text-ink-muted">
                  When it fires
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                {
                  type: "payment.created",
                  detail:
                    "A payment request was created. Useful if you want to mark an order as awaiting payment the moment the customer reaches it.",
                },
                {
                  type: "payment.pending",
                  detail:
                    "The payment window is open and no notification has matched it yet.",
                },
                {
                  type: "payment.confirmed",
                  detail:
                    "A notification was received and matched to the payment. This is the event most integrations listen for.",
                },
                {
                  type: "payment.failed",
                  detail:
                    "The payment did not match — a review rejected it, or a notification arrived that did not fit.",
                },
                {
                  type: "payment.expired",
                  detail:
                    "The payment window closed before a matching notification arrived.",
                },
                {
                  type: "payment.refunded",
                  detail:
                    "A recorded payment was marked as refunded.",
                },
                {
                  type: "invoice.created",
                  detail: "An invoice was created.",
                },
                {
                  type: "invoice.paid",
                  detail:
                    "An invoice was marked as paid from a recorded notification.",
                },
                {
                  type: "device.offline",
                  detail:
                    "A paired device stopped reporting. Notifications sent to that device are not recorded until it comes back.",
                },
              ].map((row) => (
                <tr key={row.type} className="align-top">
                  <td className="px-4 py-3 font-mono text-[12px] whitespace-nowrap text-ink">
                    {row.type}
                  </td>
                  <td className="px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
                    {row.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocsSection>

      <DocsSection id="the-payload" title="The payload">
        <DocsText>
          Every delivery is the same envelope. The{" "}
          <code className="font-mono text-[13px] text-ink">type</code> tells
          you what happened, and{" "}
          <code className="font-mono text-[13px] text-ink">data</code> holds the
          record it happened to.
        </DocsText>
        <div className="overflow-x-auto rounded-lg border border-line bg-elevated">
          <pre className="px-4 py-3.5 font-mono text-[12px] leading-relaxed text-ink-soft">
            <code>{PAYLOAD}</code>
          </pre>
        </div>
        <DocsFieldTable
          caption="Envelope"
          fields={[
            {
              name: "id",
              type: "string",
              description:
                "The event identifier. Use it to ignore a delivery you have already handled.",
            },
            {
              name: "type",
              type: "string",
              description: "Which event this is.",
            },
            {
              name: "createdAt",
              type: "string",
              description:
                "When the event happened, in ISO 8601. The delivery may reach you some time after that.",
            },
            {
              name: "data",
              type: "object",
              description:
                "The record. The shape depends on the event type — a payment event carries data.payment.",
            },
          ]}
        />
        <Alert tone="warning" title="payment.confirmed means confirmed from the notification">
          A confirmed event tells you that a notification was received and
          matched to your payment. It is not a settlement check with the
          provider, because ZevaPay has no connection to the provider.
        </Alert>
      </DocsSection>

      <DocsSection id="verifying-the-signature" title="Verifying the signature">
        <DocsText>
          Every delivery carries a signature header. Compute an HMAC of the{" "}
          <strong className="font-medium text-ink">raw request body</strong>{" "}
          with your webhook secret, and compare it in constant time.
        </DocsText>
        <CodeTabs
          samples={[
            { id: "node", label: "Node.js", code: VERIFY.node },
            { id: "php", label: "PHP", code: VERIFY.php },
            { id: "python", label: "Python", code: VERIFY.python },
            { id: "curl", label: "cURL", code: VERIFY.curl },
          ]}
        />
        <DocsList
          items={[
            <>
              Sign the raw body. A JSON payload that has been parsed and
              re-serialised will not produce the same signature, because the
              whitespace may differ.
            </>,
            <>
              Compare with a constant-time function. A plain{" "}
              <code className="font-mono text-[13px] text-ink">===</code>{" "}
              leaks timing information.
            </>,
            <>
              Store the secret where your request handler can reach it, and
              nowhere else. It is shown once when the webhook is created.
            </>,
            <>
              Reject a delivery whose signature does not match with a{" "}
              <code className="font-mono text-[13px] text-ink">4xx</code>. A
              <code className="font-mono text-[13px] text-ink">2xx</code> says
              &ldquo;handled&rdquo; and stops the retries.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection id="delivery-and-retries" title="Delivery and retries">
        <DocsText>
          ZevaPay delivers the event with an HTTP POST. A{" "}
          <code className="font-mono text-[13px] text-ink">2xx</code> response
          acknowledges it. Anything else — a timeout, a 500, a connection
          refused — is treated as a failure and retried.
        </DocsText>
        <DocsList
          items={[
            <>
              Deliveries are retried with a growing delay between attempts. A
              delivery that keeps failing is eventually given up on and
              recorded as a failed delivery.
            </>,
            <>
              A failed delivery can be retried by hand from the webhook page
              in your dashboard.
            </>,
            <>
              Every attempt — delivered, failed and retried — is listed in the
              delivery history, with the status code and the response body.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection id="answer-quickly" title="Answer quickly">
        <DocsText>
          The acknowledgement and the work are separate things. Reply with a{" "}
          <code className="font-mono text-[13px] text-ink">2xx</code> as soon
          as the signature checks out, then do the rest of the work in the
          background.
        </DocsText>
        <Alert tone="info" title="Make handling idempotent anyway">
          A retried delivery is the same event arriving twice. Deduplicate on
          the event id, and your handler will be correct whether or not a
          retry happens.
        </Alert>
      </DocsSection>

      <DocsSection id="setting-up" title="Setting up an endpoint">
        <DocsText>
          Webhooks are configured in the dashboard, on the webhooks page. You
          give an endpoint URL, choose the event types, and copy the signing
          secret. A test event can be sent from the same page so you can check
          your handler before it matters.
        </DocsText>
        <Link href="/dashboard/webhooks">
          <Button variant="outline">Open the webhooks page</Button>
        </Link>
      </DocsSection>

      <DocsPager
        previous={{ href: "/docs/create-payment", label: "Create Payment" }}
        next={{ href: "/docs/error-codes", label: "Error Codes" }}
      />
    </article>
  );
}

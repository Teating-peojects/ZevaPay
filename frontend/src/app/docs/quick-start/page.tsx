import type { Metadata } from "next";
import Link from "next/link";
import { CodeTabs } from "@/components/docs/code-block";
import {
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
  title: "Quick Start",
  description:
    "Five steps from an empty dashboard to a payment request you can hand to a customer.",
};

/** The host used in every example. It is a placeholder, not a real origin. */
const HOST = "https://api.zevapay.test";

const FIRST_CALL = {
  curl: `curl ${HOST}/api/v1/merchant/overview \\
  -H "Authorization: Bearer zp_live_your_key" \\
  -H "Accept: application/json"`,
  node: `const response = await fetch("${HOST}/api/v1/merchant/overview", {
  headers: {
    Authorization: "Bearer zp_live_your_key",
    Accept: "application/json",
  },
});

const overview = await response.json();
console.log(overview.stats.totalTransactions);`,
  php: `$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL => "${HOST}/api/v1/merchant/overview",
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer zp_live_your_key",
    "Accept: application/json",
  ],
  CURLOPT_RETURNTRANSFER => true,
]);

$overview = json_decode(curl_exec($ch), true);
echo $overview["stats"]["totalTransactions"];`,
  python: `import requests

response = requests.get(
    "${HOST}/api/v1/merchant/overview",
    headers={
        "Authorization": "Bearer zp_live_your_key",
        "Accept": "application/json",
    },
    timeout=30,
)

overview = response.json()
print(overview["stats"]["totalTransactions"])`,
};

const CREATE_PAYMENT = {
  curl: `curl -X POST ${HOST}/api/v1/payments \\
  -H "Authorization: Bearer zp_live_your_key" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order-4417" \\
  -d '{
    "amount": 2450,
    "currency": "BDT",
    "provider": "BKASH",
    "reference": "ORD-4417",
    "description": "Wireless headphones"
  }'`,
  node: `const response = await fetch("${HOST}/api/v1/payments", {
  method: "POST",
  headers: {
    Authorization: "Bearer zp_live_your_key",
    "Content-Type": "application/json",
    "Idempotency-Key": "order-4417",
  },
  body: JSON.stringify({
    amount: 2450,
    currency: "BDT",
    provider: "BKASH",
    reference: "ORD-4417",
    description: "Wireless headphones",
  }),
});

const payment = await response.json();
console.log(payment.checkoutUrl);`,
  php: `$payload = json_encode([
  "amount" => 2450,
  "currency" => "BDT",
  "provider" => "BKASH",
  "reference" => "ORD-4417",
  "description" => "Wireless headphones",
]);

$ch = curl_init();
curl_setopt_array($ch, [
  CURLOPT_URL => "${HOST}/api/v1/payments",
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => $payload,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer zp_live_your_key",
    "Content-Type: application/json",
    "Idempotency-Key: order-4417",
  ],
  CURLOPT_RETURNTRANSFER => true,
]);

$payment = json_decode(curl_exec($ch), true);
echo $payment["checkoutUrl"];`,
  python: `import requests

response = requests.post(
    "${HOST}/api/v1/payments",
    headers={
        "Authorization": "Bearer zp_live_your_key",
        "Content-Type": "application/json",
        "Idempotency-Key": "order-4417",
    },
    json={
        "amount": 2450,
        "currency": "BDT",
        "provider": "BKASH",
        "reference": "ORD-4417",
        "description": "Wireless headphones",
    },
    timeout=30,
)

payment = response.json()
print(payment["checkoutUrl"])`,
};

/**
 * The Quick Start page.
 *
 * It is deliberately short — five steps — and every example is marked as
 * illustrative so nobody assumes the placeholder host will answer.
 */
export default function DocsQuickStartPage() {
  return (
    <article className="flex flex-col gap-10">
      <DocsTitle
        badge="Getting started"
        title="Quick Start"
        description="From an empty dashboard to a payment request you can hand to a customer. Five steps, about five minutes."
      />

      <IllustrativeNotice />

      <DocsSection id="step-1-create-an-api-key" title="Step 1 — Create an API key">
        <DocsText>
          Sign in to your ZevaPay dashboard and open the developer page. Create
          a key, give it a name you will recognise later, and copy the secret
          it shows you.
        </DocsText>
        <Alert tone="warning" title="You only see the secret once">
          ZevaPay stores a hash of the key, so it cannot show it to you again.
          Store it in your secret manager now. If you lose it, revoke the key
          and create another one.
        </Alert>
        <DocsText>
          Keep the key on your server. A key in browser JavaScript, in a
          mobile app binary, or in a public repository is a key anyone can
          spend.
        </DocsText>
        <Link href="/dashboard/developers">
          <Button variant="outline">Open the developer page</Button>
        </Link>
      </DocsSection>

      <DocsSection id="step-2-send-your-first-request" title="Step 2 — Send your first request">
        <DocsText>
          Start with a read. If this returns your dashboard totals, your key
          and your base URL are both correct.
        </DocsText>
        <CodeTabs
          samples={[
            { id: "curl", label: "cURL", code: FIRST_CALL.curl },
            { id: "node", label: "Node.js", code: FIRST_CALL.node },
            { id: "php", label: "PHP", code: FIRST_CALL.php },
            { id: "python", label: "Python", code: FIRST_CALL.python },
          ]}
        />
      </DocsSection>

      <DocsSection
        id="step-3-create-a-payment-request"
        title="Step 3 — Create a payment request"
      >
        <DocsText>
          Now create a payment. The amount is in Bangladeshi Taka, and the
          reference is yours to choose — use your own order number so you can
          match the payment back to the order later.
        </DocsText>
        <CodeTabs
          samples={[
            { id: "curl", label: "cURL", code: CREATE_PAYMENT.curl },
            { id: "node", label: "Node.js", code: CREATE_PAYMENT.node },
            { id: "php", label: "PHP", code: CREATE_PAYMENT.php },
            { id: "python", label: "Python", code: CREATE_PAYMENT.python },
          ]}
        />
        <DocsText>
          The response carries a checkout URL. Send your customer to it.
        </DocsText>
      </DocsSection>

      <DocsSection
        id="step-4-share-the-checkout-link"
        title="Step 4 — Share the checkout link"
      >
        <DocsText>
          The checkout page shows the merchant, the amount and the payment
          details. Your customer pays from their own MFS app, then enters the
          TrxID they were given.
        </DocsText>
        <DocsList
          items={[
            <>
              We never ask for a PIN or an OTP, and neither should a page you
              build on top of ZevaPay.
            </>,
            <>
              The page shows the amount and the receiving number before the
              customer commits to anything.
            </>,
            <>
              If the customer submits a TrxID that does not match, the
              checkout says so rather than pretending the payment succeeded.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection id="step-5-read-the-result" title="Step 5 — Read the result">
        <DocsText>
          Two ways to learn that a payment was recorded. Poll the payment, or
          wait for a webhook — the{" "}
          <Link
            href="/docs/webhooks"
            className="font-medium text-brand-link underline underline-offset-2"
          >
            Webhooks
          </Link>{" "}
          page describes the second.
        </DocsText>
        <Alert tone="warning" title="Recorded, not verified">
          A successful response tells you a notification was received and
          matched. It does not tell you the provider confirmed the transfer,
          because ZevaPay never asks the provider.
        </Alert>
      </DocsSection>

      <DocsSection id="try-it-in-the-sandbox" title="Try it in the sandbox">
        <DocsText>
          The sandbox in your dashboard returns fixed responses without moving
          any money and without touching a provider. Use it to check your
          request shape, your signature verification and your error handling
          before you point anything at a real order.
        </DocsText>
        <Link href="/dashboard/sandbox">
          <Button variant="outline">Open the sandbox</Button>
        </Link>
      </DocsSection>

      <DocsPager
        previous={{ href: "/docs", label: "Introduction" }}
        next={{ href: "/docs/authentication", label: "Authentication" }}
      />
    </article>
  );
}

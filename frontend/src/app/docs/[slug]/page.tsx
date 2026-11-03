import { notFound } from "next/navigation";
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
import { findDocsPage } from "@/lib/docs-content";

const TOPICS = [
  "sandbox",
  "verify-payment",
  "payment-links",
  "invoices",
  "sdk-examples",
  "api-reference",
] as const;

const samples = {
  curl: `curl -X POST https://api.zevapay.test/api/v1/payments \\\n+  -H "Authorization: Bearer zp_test_your_key" \\\n+  -H "Content-Type: application/json" \\\n+  -d '{"amount": 2450, "currency": "BDT", "reference": "ORDER-1042"}'`,
  node: `const response = await fetch("https://api.zevapay.test/api/v1/payments", {
  method: "POST",
  headers: {
    Authorization: "Bearer zp_test_your_key",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ amount: 2450, currency: "BDT", reference: "ORDER-1042" }),
});
const payment = await response.json();`,
  php: `$response = Http::withToken("zp_test_your_key")
  ->post("https://api.zevapay.test/api/v1/payments", [
      "amount" => 2450,
      "currency" => "BDT",
      "reference" => "ORDER-1042",
  ]);`,
  python: `response = requests.post(
    "https://api.zevapay.test/api/v1/payments",
    headers={"Authorization": "Bearer zp_test_your_key"},
    json={"amount": 2450, "currency": "BDT", "reference": "ORDER-1042"},
    timeout=30,
)`,
};

export function generateStaticParams() {
  return TOPICS.map((slug) => ({ slug }));
}

export default async function AdditionalDocsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(TOPICS as readonly string[]).includes(slug)) notFound();
  const page = findDocsPage(slug);
  if (!page) notFound();

  return (
    <article className="flex flex-col gap-8">
      <DocsTitle title={page.title} description={page.description} badge="Prototype guide" />
      <IllustrativeNotice>
        These examples describe a future integration shape. They use a reserved
        example host and do not send requests or move money.
      </IllustrativeNotice>

      {slug === "sandbox" ? (
        <>
          <DocsSection id="safe-testing" title="Safe testing">
            <DocsText>
              Open Sandbox from the merchant dashboard to run fixed success,
              pending and failed scenarios. Results stay in the sample dataset
              and are kept separate from merchant transaction records.
            </DocsText>
            <DocsList items={[
              "Use test credentials only in local examples.",
              "A simulated success is not a provider confirmation.",
              "Sandbox actions do not contact bKash, Nagad, Rocket or Upay.",
            ]} />
          </DocsSection>
          <DocsSection id="request-shape" title="Example request shape">
            <CodeTabs samples={[{ id: "curl", label: "cURL", code: samples.curl }]} />
          </DocsSection>
        </>
      ) : null}

      {slug === "verify-payment" ? (
        <>
          <DocsSection id="status-meanings" title="Read the recorded state">
            <DocsText>
              Statuses describe the platform record. A notification parser can
              help match an event, but it does not independently verify a
              provider settlement. Keep customer-facing copy clear about that
              distinction.
            </DocsText>
            <DocsFieldTable caption="Prototype status meanings" fields={[
              { name: "PENDING", type: "status", description: "Awaiting a matching record or review." },
              { name: "REVIEW", type: "status", description: "Needs a human decision because the record is ambiguous." },
              { name: "CONFIRMED", type: "status", description: "A notification was recorded; no provider-side settlement check was made." },
              { name: "FAILED", type: "status", description: "The notification could not be accepted as a payment record." },
            ]} />
          </DocsSection>
          <DocsSection id="status-check" title="Status check example">
            <DocsText>
              The route below is illustrative. The current backend does not
              provide this payment lookup contract yet.
            </DocsText>
            <CodeTabs samples={[{ id: "curl", label: "cURL", code: `curl https://api.zevapay.test/api/v1/payments/pay_example \\\n+  -H "Authorization: Bearer zp_test_your_key"` }]} />
          </DocsSection>
        </>
      ) : null}

      {slug === "payment-links" ? (
        <>
          <DocsSection id="create-link" title="Configure a link">
            <DocsText>
              A payment link holds the collection amount and customer-facing
              details. In this prototype, links are sample records managed in
              the dashboard.
            </DocsText>
            <CodeTabs samples={[{ id: "curl", label: "cURL", code: `curl -X POST https://api.zevapay.test/api/v1/payment-links \\\n+  -H "Authorization: Bearer zp_test_your_key" \\\n+  -H "Content-Type: application/json" \\\n+  -d '{"amount": 2450, "currency": "BDT", "reference": "ORDER-1042", "expiresIn": 86400}'` }]} />
          </DocsSection>
          <DocsSection id="link-options" title="Link options">
            <DocsList items={[
              "Use a fixed amount when the order total is already known.",
              "Set an expiry and usage limit to control how long a link remains available.",
              "Choose which customer fields to request before sharing the link.",
            ]} />
          </DocsSection>
        </>
      ) : null}

      {slug === "invoices" ? (
        <>
          <DocsSection id="invoice-fields" title="Invoice fields">
            <DocsFieldTable caption="Illustrative invoice payload" fields={[
              { name: "customer", type: "object", required: true, description: "Customer name and contact details." },
              { name: "items", type: "array", required: true, description: "Description, quantity and unit price for each line." },
              { name: "dueDate", type: "string", description: "Optional ISO date for the requested payment deadline." },
              { name: "currency", type: "string", required: true, description: "The prototype currently displays BDT amounts." },
            ]} />
          </DocsSection>
          <DocsSection id="invoice-example" title="Create an invoice">
            <CodeTabs samples={[{ id: "node", label: "Node.js", code: `const invoice = {
  customer: { name: "Samira Ahmed", email: "samira@example.test" },
  items: [{ description: "Design work", quantity: 2, unitPrice: 5000 }],
  currency: "BDT",
  dueDate: "2026-12-15",
};` }]} />
          </DocsSection>
        </>
      ) : null}

      {slug === "sdk-examples" ? (
        <DocsSection id="request-examples" title="Create a payment request">
          <DocsText>
            No official SDK is included in this prototype. These examples use
            standard HTTP clients and placeholder credentials.
          </DocsText>
          <CodeTabs samples={[
            { id: "curl", label: "cURL", code: samples.curl },
            { id: "node", label: "Node.js", code: samples.node },
            { id: "php", label: "PHP", code: samples.php },
            { id: "python", label: "Python", code: samples.python },
          ]} />
        </DocsSection>
      ) : null}

      {slug === "api-reference" ? (
        <DocsSection id="endpoint-groups" title="Endpoint groups">
          <DocsText>
            The API currently implemented in this repository focuses on
            authentication, merchant records, devices and administration.
            Payment creation, invoices and payment-link routes shown elsewhere
            in these docs are planned examples, not available endpoints.
          </DocsText>
          <DocsFieldTable caption="Implemented backend areas" fields={[
            { name: "/api/v1/auth/*", type: "Auth", description: "Registration, sign-in, sessions and profile." },
            { name: "/api/v1/merchant/*", type: "Merchant", description: "Overview, accounts, transactions and settings." },
            { name: "/api/v1/device/*", type: "Device", description: "Pairing, notification ingest and heartbeat." },
            { name: "/api/v1/admin/*", type: "Admin", description: "Platform operations and administration." },
          ]} />
        </DocsSection>
      ) : null}

      <DocsPager previous={{ href: "/docs", label: "Introduction" }} next={{ href: "/docs/error-codes", label: "Error Codes" }} />
    </article>
  );
}

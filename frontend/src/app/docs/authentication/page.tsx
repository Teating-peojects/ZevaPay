import type { Metadata } from "next";
import Link from "next/link";
import { CodeTabs } from "@/components/docs/code-block";
import {
  DocsDefinition,
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
  title: "Authentication",
  description:
    "How to issue, scope, rotate and revoke an API key, and which headers every request carries.",
};

const AUTH_HEADERS = {
  curl: `curl https://api.zevapay.test/api/v1/merchant/transactions \\
  -H "Authorization: Bearer zp_live_your_key" \\
  -H "Accept: application/json"`,
  node: `const response = await fetch(
  "https://api.zevapay.test/api/v1/merchant/transactions",
  {
    headers: {
      Authorization: \`Bearer \${process.env.ZEVAPAY_API_KEY}\`,
      Accept: "application/json",
    },
  },
);`,
  php: `$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL => "https://api.zevapay.test/api/v1/merchant/transactions",
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer " . getenv("ZEVAPAY_API_KEY"),
    "Accept: application/json",
  ],
  CURLOPT_RETURNTRANSFER => true,
]);`,
  python: `import os
import requests

response = requests.get(
    "https://api.zevapay.test/api/v1/merchant/transactions",
    headers={
        "Authorization": f"Bearer {os.environ['ZEVAPAY_API_KEY']}",
        "Accept": "application/json",
    },
    timeout=30,
)`,
};

/**
 * The Authentication page.
 *
 * It explains the credential itself, the headers that carry it, the scopes
 * it can hold, and the practical business of rotating a key without
 * downtime.
 */
export default function DocsAuthenticationPage() {
  return (
    <article className="flex flex-col gap-10">
      <DocsTitle
        badge="Getting started"
        title="Authentication"
        description="ZevaPay authenticates your server with an API key. There is no OAuth flow, no client secret to exchange, and nothing for a customer to log into."
      />

      <IllustrativeNotice />

      <DocsSection id="the-authorization-header" title="The Authorization header">
        <DocsText>
          Every request carries your key as a bearer token. Send it in the{" "}
          <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-ink">
            Authorization
          </code>{" "}
          header, and nothing else about the request changes.
        </DocsText>
        <CodeTabs
          samples={[
            { id: "curl", label: "cURL", code: AUTH_HEADERS.curl },
            { id: "node", label: "Node.js", code: AUTH_HEADERS.node },
            { id: "php", label: "PHP", code: AUTH_HEADERS.php },
            { id: "python", label: "Python", code: AUTH_HEADERS.python },
          ]}
        />
        <DocsFieldTable
          caption="Headers"
          fields={[
            {
              name: "Authorization",
              type: "string",
              required: true,
              description:
                "Bearer token: the word 'Bearer', a space, then your key. A key sent any other way is rejected.",
            },
            {
              name: "Content-Type",
              type: "string",
              description:
                "application/json, on any request that carries a body. The API rejects a body it cannot parse.",
            },
            {
              name: "Accept",
              type: "string",
              description: "application/json. Optional, and the default.",
            },
            {
              name: "Idempotency-Key",
              type: "string",
              description:
                "A key you choose, on a write. See Create Payment for what it protects.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection id="scopes" title="Scopes">
        <DocsText>
          A key carries the scopes it was issued with. A request that needs a
          scope the key does not have is refused with{" "}
          <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-ink">
            FORBIDDEN
          </code>
          .
        </DocsText>
        <DocsDefinition term="payments:read">
          Read transactions, payments and payment links. This is the scope a
          reporting script needs, and the one most integrations should start
          with.
        </DocsDefinition>
        <DocsDefinition term="payments:write">
          Create payments and change records. Only give this to a server that
          genuinely needs it — a key with write access can create a payment
          request that a customer will be asked to pay.
        </DocsDefinition>
        <DocsDefinition term="webhooks:read">
          Read webhook configuration and delivery history. Does not let a
          caller change where events are sent.
        </DocsDefinition>
        <DocsDefinition term="reports:read">
          Read reporting aggregates, for a script that reconciles against a
          provider statement.
        </DocsDefinition>
        <Alert tone="info" title="Scope the narrowest thing that works">
          A read-only key cannot create a payment, and a read-only key that
          leaks is a smaller problem than a write key that leaks.
        </Alert>
      </DocsSection>

      <DocsSection id="key-lifecycle" title="Key lifecycle">
        <DocsList
          items={[
            <>
              <strong className="font-medium text-ink">Issued once.</strong>{" "}
              The full secret is returned exactly once, in the response to the
              create call. Afterwards only a prefix is ever visible.
            </>,
            <>
              <strong className="font-medium text-ink">Stored as a hash.</strong>{" "}
              ZevaPay keeps a hash, not the secret, so it cannot show you the
              key again even if it wanted to.
            </>,
            <>
              <strong className="font-medium text-ink">Revocable at any time.</strong>{" "}
              Revoking takes effect immediately. Requests with a revoked key
              fail with{" "}
              <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-ink">
                UNAUTHORIZED
              </code>
              .
            </>,
            <>
              <strong className="font-medium text-ink">Audited.</strong>{" "}
              Creating and revoking a key is written to the audit trail, with
              the actor and the address the request came from.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection id="rotating-a-key" title="Rotating a key">
        <DocsText>
          A key can be replaced without downtime, because nothing about a key
          depends on the key before it.
        </DocsText>
        <ol className="flex flex-col gap-3">
          {[
            "Create a second key with the same scopes.",
            "Deploy it to every place that uses the first one.",
            "Watch the developer page until the first key's last-used timestamp stops moving.",
            "Revoke the first key.",
          ].map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[12px] font-semibold text-brand-ink">
                {index + 1}
              </span>
              <span className="text-[15px] leading-relaxed text-ink-soft">
                {step}
              </span>
            </li>
          ))}
        </ol>
        <Alert tone="warning" title="Revocation is immediate and total">
          There is no grace period. If a deployment is still holding the old
          key when you revoke it, those requests start failing.
        </Alert>
      </DocsSection>

      <DocsSection
        id="sessions-are-not-api-keys"
        title="Sessions are not API keys"
      >
        <DocsText>
          A signed-in browser holds a session cookie. That cookie lets the
          dashboard show a merchant their own data, and it is deliberately not
          usable as an API credential — it is scoped to the browser session,
          it expires, and it is not what an integration should send.
        </DocsText>
        <DocsList
          items={[
            <>
              Use an API key on your server, always.
            </>,
            <>
              Do not forward a customer&rsquo;s session cookie to the API.
            </>,
            <>
              Do not put a key in a browser bundle. A bundle is public, and a
              key in a bundle is a key anyone can copy.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection id="troubleshooting" title="Troubleshooting">
        <DocsText>
          If a request fails with{" "}
          <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-ink">
            UNAUTHORIZED
          </code>
          , check these in order.
        </DocsText>
        <DocsList
          items={[
            <>
              The header is spelled <code>Authorization</code> and the value
              starts with <code>Bearer </code> — capital B, with a space.
            </>,
            <>
              The key was not revoked, and has not expired.
            </>,
            <>
              The key belongs to the merchant whose data you are asking for.
              A key from one merchant cannot read another&rsquo;s records.
            </>,
            <>
              There is no stray newline in the value. A key copied with a
              trailing space fails the same way a wrong key does.
            </>,
          ]}
        />
        <Link href="/docs/error-codes">
          <Button variant="outline">See every error code</Button>
        </Link>
      </DocsSection>

      <DocsPager
        previous={{ href: "/docs/quick-start", label: "Quick Start" }}
        next={{ href: "/docs/create-payment", label: "Create Payment" }}
      />
    </article>
  );
}

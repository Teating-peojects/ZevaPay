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
  title: "Error Codes",
  description:
    "Every error code the API returns, what causes it, and what you should do about it.",
};

/**
 * The error catalogue.
 *
 * The codes and statuses are the ones the API actually produces. The
 * wording of each message is the API's too — an integration should branch
 * on the code, never on the message text.
 */
const ERROR_CODES = [
  {
    status: "400",
    code: "BAD_REQUEST",
    meaning: "The request was understood but cannot be acted on.",
    causes:
      "A field has a value the API cannot use — a negative amount, a provider ZevaPay does not recognise, a transaction that is not awaiting review.",
    action:
      "Read the message. Fix the request. Do not retry it unchanged.",
  },
  {
    status: "401",
    code: "UNAUTHORIZED",
    meaning: "No usable credential was presented.",
    causes:
      "The Authorization header is missing or malformed, the key was revoked, the key expired, or the key belongs to a different merchant.",
    action:
      "Check the header, then check the key's status in the developer page. If it was revoked, deploy a new key.",
  },
  {
    status: "401",
    code: "UNAUTHORIZED_DEVICE",
    meaning: "The device is not allowed to post notifications.",
    causes:
      "The device's pairing was revoked, or it is presenting a credential the API does not recognise.",
    action:
      "Pair the device again from the devices page.",
  },
  {
    status: "403",
    code: "FORBIDDEN",
    meaning: "The credential is valid but does not allow this.",
    causes:
      "The key lacks the scope this endpoint needs — for example, a read-only key trying to create a payment.",
    action:
      "Issue a key with the scope the endpoint requires, or use a different endpoint.",
  },
  {
    status: "404",
    code: "NOT_FOUND",
    meaning: "No record matches the identifier.",
    causes:
      "The identifier is wrong, or the record belongs to a different merchant. The API does not say which, so it does not confirm that a record exists.",
    action:
      "Check the identifier and the merchant the key belongs to.",
  },
  {
    status: "409",
    code: "CONFLICT",
    meaning: "The request conflicts with something that already exists.",
    causes:
      "A record with the same reference already exists, or an idempotency key was reused with a different body.",
    action:
      "Look up the existing record and reuse it, or use a fresh idempotency key.",
  },
  {
    status: "422",
    code: "VALIDATION_ERROR",
    meaning: "A field failed validation.",
    causes:
      "A required field is missing, a value is the wrong type, or a string is longer than the endpoint allows.",
    action:
      "Read the details. Each key is a field name and each value is the message for that field.",
  },
  {
    status: "429",
    code: "RATE_LIMITED",
    meaning: "Too many requests, too quickly.",
    causes: "The client is sending faster than the limit allows.",
    action:
      "Back off and retry. Send fewer requests, or poll less often than you think you need to.",
  },
  {
    status: "500",
    code: "INTERNAL_ERROR",
    meaning: "Something failed on the API's side.",
    causes: "An unhandled failure. The message is deliberately generic — internal detail is not leaked.",
    action:
      "Retry after a short pause. If it keeps happening, the request id in the error body identifies the failure on our side.",
  },
];

const HANDLE = {
  node: `const response = await fetch(url, { ...options });

const body = await response.json();

if (!response.ok) {
  // body.error.code is the stable thing to branch on.
  // body.error.message is written for a person — do not parse it.
  if (body.error.code === "VALIDATION_ERROR") {
    throw new ValidationError(body.error.details);
  }
  if (body.error.code === "RATE_LIMITED") {
    throw new RateLimited(body.error.requestId);
  }
  throw new ApiError(body.error.code, body.error.message, body.error.requestId);
}`,
  php: `$ch = curl_init();
curl_setopt_array($ch, [
  CURLOPT_URL => $url,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => json_encode($payload),
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer " . getenv("ZEVAPAY_API_KEY"),
    "Content-Type: application/json",
  ],
]);

$body = json_decode(curl_exec($ch), true);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($status >= 400) {
  // $body["error"]["code"] is the stable thing to branch on.
  throw new RuntimeException(
    $body["error"]["code"] . ": " . $body["error"]["message"]
  );
}`,
  python: `import requests

response = requests.post(url, json=payload, headers=headers, timeout=30)

if not response.ok:
    body = response.json()

    # body["error"]["code"] is the stable thing to branch on.
    # body["error"]["message"] is written for a person.
    if body["error"]["code"] == "VALIDATION_ERROR":
        raise ValidationError(body["error"].get("details"))

    raise ApiError(
        body["error"]["code"],
        body["error"]["message"],
        body["error"].get("requestId"),
    )`,
  curl: `response=$(curl -sS -w '\\n%{http_code}' \\
  -X POST "$URL" \\
  -H "Authorization: Bearer $ZEVAPAY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d "$BODY")

status=$(printf '%s' "$response" | tail -n1)
payload=$(printf '%s' "$response" | sed '$d')

if [ "$status" -ge 400 ]; then
  # The body always carries error.code.
  code=$(printf '%s' "$payload" | jq -r '.error.code')
  echo "request failed: $code" >&2
  exit 1
fi`,
};

/**
 * The Error Codes page.
 *
 * Every code carries a meaning, a cause and an action, because "the request
 * failed" is not something an integration can act on.
 */
export default function DocsErrorCodesPage() {
  return (
    <article className="flex flex-col gap-10">
      <DocsTitle
        badge="API reference"
        title="Error Codes"
        description="Every error the API can return. The code is the stable part of the contract; the message is written for a person and may change."
      />

      <IllustrativeNotice />

      <DocsSection id="the-error-body" title="The error body">
        <DocsText>
          A failing request returns a body with a single{" "}
          <code className="font-mono text-[13px] text-ink">error</code> object.
        </DocsText>
        <div className="overflow-x-auto rounded-lg border border-line bg-elevated">
          <pre className="px-4 py-3.5 font-mono text-[12px] leading-relaxed text-ink-soft">
            <code>{`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Some fields need attention.",
    "details": {
      "amount": "Amount must be a positive number",
      "reference": "A reference is required"
    },
    "requestId": "req_8K2M4Q"
  }
}`}</code>
          </pre>
        </div>
        <DocsList
          items={[
            <>
              <code className="font-mono text-[13px] text-ink">code</code> — the
              stable machine-readable code. Branch on this.
            </>,
            <>
              <code className="font-mono text-[13px] text-ink">message</code> —
              written for a person reading a log. Do not parse it.
            </>,
            <>
              <code className="font-mono text-[13px] text-ink">details</code> —
              field-level messages, present on validation failures. Each key is
              a field name.
            </>,
            <>
              <code className="font-mono text-[13px] text-ink">requestId</code>{" "}
              — the identifier of this request on the API side. Quote it when
              you report a problem.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection id="the-code-list" title="The code list">
        <div className="flex flex-col gap-3">
          {ERROR_CODES.map((entry) => (
            <div
              key={entry.code}
              className="rounded-lg border border-line bg-surface px-4 py-3.5"
            >
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="rounded bg-danger-tint px-1.5 py-0.5 font-mono text-[12px] font-semibold text-danger-fg">
                  {entry.status}
                </span>
                <span className="font-mono text-[13px] font-semibold text-ink">
                  {entry.code}
                </span>
              </div>
              <p className="mt-2 text-[14px] font-medium text-ink">
                {entry.meaning}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                <span className="font-medium text-ink-muted">Cause — </span>
                {entry.causes}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                <span className="font-medium text-ink-muted">What to do — </span>
                {entry.action}
              </p>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection id="handling-errors" title="Handling errors">
        <DocsText>
          Read the body, branch on the code, and keep the request id. This is
          the same in every language.
        </DocsText>
        <CodeTabs
          samples={[
            { id: "node", label: "Node.js", code: HANDLE.node },
            { id: "php", label: "PHP", code: HANDLE.php },
            { id: "python", label: "Python", code: HANDLE.python },
            { id: "curl", label: "cURL", code: HANDLE.curl },
          ]}
        />
      </DocsSection>

      <DocsSection id="retry-safely" title="Retry safely">
        <DocsText>
          Some errors are worth retrying and some are not. Retrying a request
          that failed validation just fails again.
        </DocsText>
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-elevated">
                <th className="px-4 py-2.5 text-[12px] font-semibold text-ink-muted">
                  Code
                </th>
                <th className="px-4 py-2.5 text-[12px] font-semibold text-ink-muted">
                  Retry?
                </th>
                <th className="px-4 py-2.5 text-[12px] font-semibold text-ink-muted">
                  What to do
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                {
                  code: "RATE_LIMITED",
                  retry: "Yes, with a backoff",
                  note:
                    "Wait before the next attempt. Repeatedly retrying immediately makes the limit worse.",
                },
                {
                  code: "INTERNAL_ERROR",
                  retry: "Yes, a few times",
                  note:
                    "Back off and retry. If it persists, the request id tells us which failure it was.",
                },
                {
                  code: "UNAUTHORIZED",
                  retry: "No, not unchanged",
                  note:
                    "A new key has to be deployed. Retrying with the same credential produces the same error.",
                },
                {
                  code: "VALIDATION_ERROR",
                  retry: "No",
                  note: "Fix the fields the details point at.",
                },
                {
                  code: "BAD_REQUEST",
                  retry: "No",
                  note:
                    "The request cannot succeed as written. Change it or send a person.",
                },
                {
                  code: "FORBIDDEN",
                  retry: "No",
                  note: "The key needs a different scope.",
                },
                {
                  code: "NOT_FOUND",
                  retry: "No",
                  note:
                    "Check the identifier. If it may arrive later, poll for it separately rather than retrying the write.",
                },
                {
                  code: "CONFLICT",
                  retry: "No, not unchanged",
                  note:
                    "Look up the record that already exists and use it instead.",
                },
              ].map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="px-4 py-3 font-mono text-[12px] whitespace-nowrap text-ink">
                    {row.code}
                  </td>
                  <td className="px-4 py-3 text-[13px] whitespace-nowrap text-ink-soft">
                    {row.retry}
                  </td>
                  <td className="px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Alert tone="info" title="Retrying a write">
          When you retry a create, send the same idempotency key as the first
          attempt. A retry with a fresh key can create a second payment for
          the same order.
        </Alert>
      </DocsSection>

      <DocsSection id="reporting-a-problem" title="Reporting a problem">
        <DocsText>
          If a request fails in a way that makes no sense, quote the request
          id from the error body. It identifies that exact request on the API
          side, and it is the difference between a question that can be
          answered and one that cannot.
        </DocsText>
        <Link href="/contact">
          <Button variant="outline">Contact support</Button>
        </Link>
      </DocsSection>

      <DocsPager
        previous={{ href: "/docs/webhooks", label: "Webhooks" }}
        next={{ href: "/docs", label: "Introduction" }}
      />
    </article>
  );
}

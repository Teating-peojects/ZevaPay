/**
 * The content index for the developer docs portal.
 *
 * The portal has no CMS behind it. Every page is a real route in
 * `src/app/docs`, and this module holds the navigation and the search
 * corpus that both the sidebar and the search box read from.
 *
 * The examples in the portal are **illustrative**. They describe the shape
 * of an integration, not a contract with a live endpoint — see the note in
 * `src/app/docs/page.tsx`.
 */

export interface DocsNavItem {
  /** Path under `/docs`. The empty string is the introduction. */
  slug: string;
  label: string;
  /** One line, shown under the label in the sidebar. */
  summary: string;
}

export interface DocsNavGroup {
  title: string;
  items: DocsNavItem[];
}

export const DOC_NAV: DocsNavGroup[] = [
  {
    title: "Getting started",
    items: [
      {
        slug: "",
        label: "Introduction",
        summary: "What ZevaPay is, and what it is not.",
      },
      {
        slug: "quick-start",
        label: "Quick Start",
        summary: "Your first request in five minutes.",
      },
      {
        slug: "authentication",
        label: "Authentication",
        summary: "How API keys are issued, scoped and revoked.",
      },
      {
        slug: "sandbox",
        label: "Sandbox",
        summary: "Explore outcomes without creating a real payment.",
      },
    ],
  },
  {
    title: "API reference",
    items: [
      {
        slug: "create-payment",
        label: "Create Payment",
        summary: "Request and response shapes.",
      },
      {
        slug: "verify-payment",
        label: "Payment Status",
        summary: "Read payment states and verification limits.",
      },
      {
        slug: "payment-links",
        label: "Payment Links",
        summary: "Create and share a hosted collection link.",
      },
      {
        slug: "invoices",
        label: "Invoices",
        summary: "Create an invoice and track its state.",
      },
      {
        slug: "webhooks",
        label: "Webhooks",
        summary: "Event types, payloads and delivery behaviour.",
      },
      {
        slug: "sdk-examples",
        label: "Code Examples",
        summary: "Illustrative requests in common languages.",
      },
      {
        slug: "api-reference",
        label: "API Reference",
        summary: "Endpoint groups and current prototype boundaries.",
      },
      {
        slug: "error-codes",
        label: "Error Codes",
        summary: "Every code the API can return.",
      },
    ],
  },
];

/** Metadata for each page, used by the sidebar, the search results and SEO. */
export interface DocsPageMeta {
  slug: string;
  title: string;
  description: string;
  /** Extra terms the search box should match against. */
  keywords: string[];
}

export const DOC_PAGES: DocsPageMeta[] = [
  {
    slug: "",
    title: "Introduction",
    description:
      "What ZevaPay records, what it deliberately does not do, and how a payment notification becomes a transaction in your dashboard.",
    keywords: ["overview", "concepts", "notification", "parser", "device", "account"],
  },
  {
    slug: "quick-start",
    title: "Quick Start",
    description:
      "Five steps from an empty dashboard to a payment request you can hand to a customer.",
    keywords: ["getting started", "first request", "curl", "sandbox", "steps"],
  },
  {
    slug: "authentication",
    title: "Authentication",
    description:
      "How to issue, scope, rotate and revoke an API key, and which headers every request carries.",
    keywords: ["api key", "bearer", "token", "scopes", "rotate", "revoke", "headers"],
  },
  {
    slug: "sandbox",
    title: "Sandbox",
    description: "Try fixed payment outcomes in the frontend sandbox without sending a provider request.",
    keywords: ["test", "sandbox", "simulation", "mock", "payment"],
  },
  {
    slug: "create-payment",
    title: "Create Payment",
    description:
      "The request and response shapes for creating a payment, and how idempotency protects a retried call.",
    keywords: ["create", "post", "payment", "idempotency", "amount", "currency", "response"],
  },
  {
    slug: "verify-payment",
    title: "Payment Status",
    description: "Understand payment states and why an SMS record is not independent provider verification.",
    keywords: ["status", "verify", "poll", "confirmed", "review", "notification"],
  },
  {
    slug: "payment-links",
    title: "Payment Links",
    description: "Configure a hosted payment link with an amount, reference and expiry.",
    keywords: ["link", "checkout", "hosted", "fixed amount", "flexible"],
  },
  {
    slug: "invoices",
    title: "Invoices",
    description: "Create an invoice with line items and track the resulting status.",
    keywords: ["invoice", "line item", "due date", "customer", "tax"],
  },
  {
    slug: "webhooks",
    title: "Webhooks",
    description:
      "Event types, payload shape, signature verification, and what happens when your endpoint is down.",
    keywords: ["webhook", "events", "signature", "retry", "payload", "endpoint"],
  },
  {
    slug: "error-codes",
    title: "Error Codes",
    description:
      "Every error code the API returns, what causes it, and what you should do about it.",
    keywords: ["errors", "status codes", "422", "401", "404", "429", "500", "validation"],
  },
  {
    slug: "sdk-examples",
    title: "Code Examples",
    description: "Illustrative cURL, Node.js, PHP and Python request examples.",
    keywords: ["sdk", "curl", "node", "php", "python", "examples"],
  },
  {
    slug: "api-reference",
    title: "API Reference",
    description: "Endpoint groups represented by the current ZevaPay prototype.",
    keywords: ["endpoint", "reference", "route", "api"],
  },
];

/** A single searchable entry. */
export interface DocsSearchEntry {
  /** Page the entry belongs to. */
  slug: string;
  /** Anchor within the page, or empty for the page itself. */
  anchor: string;
  /** Heading text. */
  heading: string;
  /** A short body of text that is searched alongside the heading. */
  text: string;
}

/**
 * The search corpus.
 *
 * It is a hand-written index rather than a full-text search, because the
 * portal is small enough that a naive substring match over the headings is
 * both faster and easier to reason about than a search index.
 */
export const DOC_SEARCH_ENTRIES: DocsSearchEntry[] = [
  {
    slug: "",
    anchor: "",
    heading: "Introduction",
    text: "What ZevaPay is, what it is not, and how a notification becomes a transaction.",
  },
  {
    slug: "",
    anchor: "what-zevapay-is",
    heading: "What ZevaPay is",
    text: "A record of mobile financial service notifications, grouped by account and device.",
  },
  {
    slug: "",
    anchor: "what-zevapay-is-not",
    heading: "What ZevaPay is not",
    text: "ZevaPay does not connect to bKash, Nagad, Rocket or Upay to confirm a payment.",
  },
  {
    slug: "",
    anchor: "how-a-payment-is-recorded",
    heading: "How a payment is recorded",
    text: "Device notification, parser, transaction record, review queue, dashboard.",
  },
  {
    slug: "",
    anchor: "core-concepts",
    heading: "Core concepts",
    text: "Payment account, device, transaction, review, webhook, API key.",
  },
  {
    slug: "",
    anchor: "base-url-and-versioning",
    heading: "Base URL and versioning",
    text: "The API lives under /api/v1 and the version is part of the path.",
  },
  {
    slug: "quick-start",
    anchor: "",
    heading: "Quick Start",
    text: "Five steps from an empty dashboard to a payment request.",
  },
  {
    slug: "quick-start",
    anchor: "step-1-create-an-api-key",
    heading: "Step 1 — Create an API key",
    text: "Create a key in the developer page and copy it once.",
  },
  {
    slug: "quick-start",
    anchor: "step-2-send-your-first-request",
    heading: "Step 2 — Send your first request",
    text: "A curl, Node.js, PHP and Python example of a first API call.",
  },
  {
    slug: "quick-start",
    anchor: "step-3-create-a-payment-request",
    heading: "Step 3 — Create a payment request",
    text: "Amount, currency, provider and the reference you give your customer.",
  },
  {
    slug: "quick-start",
    anchor: "step-4-share-the-checkout-link",
    heading: "Step 4 — Share the checkout link",
    text: "The customer opens the link, pays, and submits their TrxID.",
  },
  {
    slug: "quick-start",
    anchor: "step-5-read-the-result",
    heading: "Step 5 — Read the result",
    text: "Poll the payment or wait for a webhook. A notification is not a settlement check.",
  },
  {
    slug: "quick-start",
    anchor: "try-it-in-the-sandbox",
    heading: "Try it in the sandbox",
    text: "The sandbox sends back fixed responses without moving any money.",
  },
  {
    slug: "authentication",
    anchor: "",
    heading: "Authentication",
    text: "API keys, bearer tokens, scopes, rotation and revocation.",
  },
  {
    slug: "authentication",
    anchor: "the-authorization-header",
    heading: "The Authorization header",
    text: "Send your key as a bearer token in the Authorization header.",
  },
  {
    slug: "authentication",
    anchor: "scopes",
    heading: "Scopes",
    text: "payments:read, payments:write, webhooks:read, reports:read.",
  },
  {
    slug: "authentication",
    anchor: "key-lifecycle",
    heading: "Key lifecycle",
    text: "A key is shown once, stored as a hash, and can be revoked at any time.",
  },
  {
    slug: "authentication",
    anchor: "rotating-a-key",
    heading: "Rotating a key",
    text: "Create the second key, deploy it, then revoke the first one.",
  },
  {
    slug: "authentication",
    anchor: "sessions-are-not-api-keys",
    heading: "Sessions are not API keys",
    text: "A browser session cookie cannot be used as an API credential.",
  },
  {
    slug: "create-payment",
    anchor: "",
    heading: "Create Payment",
    text: "The request and response shapes for creating a payment.",
  },
  {
    slug: "create-payment",
    anchor: "the-endpoint",
    heading: "The endpoint",
    text: "POST /api/v1/payments with a JSON body.",
  },
  {
    slug: "create-payment",
    anchor: "request-fields",
    heading: "Request fields",
    text: "amount, currency, provider, reference, customer, expiresIn.",
  },
  {
    slug: "create-payment",
    anchor: "the-response",
    heading: "The response",
    text: "The payment object, its status and the checkout URL.",
  },
  {
    slug: "create-payment",
    anchor: "idempotency",
    heading: "Idempotency",
    text: "The same idempotency key returns the same payment instead of creating a second one.",
  },
  {
    slug: "create-payment",
    anchor: "payment-statuses",
    heading: "Payment statuses",
    text: "Created, Awaiting verification, Needs review, Confirmed, Failed, Expired.",
  },
  {
    slug: "webhooks",
    anchor: "",
    heading: "Webhooks",
    text: "Event types, payloads, signature verification and retries.",
  },
  {
    slug: "webhooks",
    anchor: "event-types",
    heading: "Event types",
    text: "payment.created, payment.pending, payment.confirmed, payment.failed, invoice.paid.",
  },
  {
    slug: "webhooks",
    anchor: "the-payload",
    heading: "The payload",
    text: "The event envelope, the data object and the event timestamp.",
  },
  {
    slug: "webhooks",
    anchor: "verifying-the-signature",
    heading: "Verifying the signature",
    text: "Compute an HMAC of the raw body and compare it in constant time.",
  },
  {
    slug: "webhooks",
    anchor: "delivery-and-retries",
    heading: "Delivery and retries",
    text: "A 2xx response acknowledges the event. Anything else is retried.",
  },
  {
    slug: "webhooks",
    anchor: "answer-quickly",
    heading: "Answer quickly",
    text: "Return a 2xx straight away and do the work afterwards.",
  },
  {
    slug: "error-codes",
    anchor: "",
    heading: "Error Codes",
    text: "Every error code the API returns and what to do about it.",
  },
  {
    slug: "error-codes",
    anchor: "the-error-body",
    heading: "The error body",
    text: "Every error has a code, a message, and sometimes field-level details.",
  },
  {
    slug: "error-codes",
    anchor: "the-code-list",
    heading: "The code list",
    text: "BAD_REQUEST, VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT.",
  },
  {
    slug: "error-codes",
    anchor: "handling-errors",
    heading: "Handling errors",
    text: "Node.js, PHP, Python and cURL examples of reading an error body.",
  },
  {
    slug: "error-codes",
    anchor: "retry-safely",
    heading: "Retry safely",
    text: "Which errors are worth retrying, and which need a person.",
  },
];

/** Builds the full path for a documentation page. */
export function docsHref(slug: string, anchor = ""): string {
  const base = slug ? `/docs/${slug}` : "/docs";
  return anchor ? `${base}#${anchor}` : base;
}

/** Finds the page metadata for a slug. */
export function findDocsPage(slug: string): DocsPageMeta | undefined {
  return DOC_PAGES.find((page) => page.slug === slug);
}

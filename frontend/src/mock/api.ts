/**
 * The mock API.
 *
 * Every function here has the same name and shape as the endpoint it stands
 * in for, and returns the same envelope the real API returns. A page that
 * reads from this module can be switched to the live API by changing the
 * import and nothing else.
 *
 *     const rows = await mockFetchPayments({ status: "PENDING" });
 *     // later
 *     const rows = await serverFetch<...>("/api/v1/merchant/payments");
 *
 * The records themselves live in `data.ts` and are copied into mutable
 * collections here, so edits made on a demo page persist for the rest of
 * the session — the way a real row would.
 *
 * Two rules are enforced by this module and must not be relaxed:
 *
 *  1. A parser match is never reported as a confirmed payment. The
 *     `CONFIRMED` status means "a notification that looked like this was
 *     recorded", and `status.ts` owns the wording.
 *  2. Nothing is random. Every number is fixed by `data.ts`.
 */

import {
  MOCK_ACCOUNTS,
  MOCK_ADMIN_STAFF,
  MOCK_ADMIN_SESSIONS,
  MOCK_API_KEYS,
  MOCK_API_LOGS,
  MOCK_AUDIT_LOGS,
  MOCK_BILLING_HISTORY,
  MOCK_BRANDS,
  MOCK_CHECKOUTS,
  MOCK_CHECKOUT_CONFIG,
  MOCK_CUSTOMERS,
  MOCK_CUSTOM_ROLES,
  MOCK_DEVICES,
  MOCK_FEATURE_FLAGS,
  MOCK_FEE_REPORT,
  MOCK_INVOICES,
  MOCK_LOGIN_HISTORY,
  MOCK_MERCHANTS,
  MOCK_MERCHANT_SETTINGS,
  MOCK_NOW,
  MOCK_NOTIFICATION_CHANNELS,
  MOCK_NOTIFICATION_SETTINGS,
  MOCK_PAYMENTS,
  MOCK_PAYMENT_LINKS,
  MOCK_PERMISSIONS,
  MOCK_PLANS,
  MOCK_PLATFORM_NOTIFICATIONS,
  MOCK_PROVIDERS,
  MOCK_RECONCILIATION,
  MOCK_REVENUE_BY_DAY,
  MOCK_ROLE_PERMISSIONS,
  MOCK_SANDBOX_TRANSACTIONS,
  MOCK_SECURITY_EVENTS,
  MOCK_SESSIONS,
  MOCK_SUBSCRIPTION,
  MOCK_SYSTEM_HEALTH,
  MOCK_TEAM,
  MOCK_TRANSACTIONS,
  MOCK_WEBHOOK_DELIVERIES,
  MOCK_WEBHOOKS,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_EVENTS,
  WEBHOOK_EVENTS,
  mockTime,
  type MockAdminSession,
  type MockAdminStaff,
  type MockApiKey,
  type MockApiLog,
  type MockAuditLog,
  type MockBrand,
  type MockCheckout,
  type MockCheckoutConfig,
  type MockCustomRole,
  type MockCustomer,
  type MockDevice,
  type MockFeatureFlag,
  type MockInvoice,
  type MockInvoiceRecord,
  type MockMerchant,
  type MockMerchantSettings,
  type MockNotificationChannelConfig,
  type MockNotificationSetting,
  type MockPayment,
  type MockPaymentAccount,
  type MockPaymentLink,
  type MockPermission,
  type MockPlan,
  type MockPlatformNotification,
  type MockProvider,
  type MockRole,
  type MockSandboxTransaction,
  type MockSubscription,
  type MockSystemHealth,
  type MockTeamMember,
  type MockTransaction,
  type MockWebhook,
  type MockWebhookDelivery,
  type NotificationChannel,
  type NotificationEvent,
} from "./data";
import {
  MockCollection,
  matchesFilter,
  nextId,
  paginate,
  searchRows,
  sortRows,
  type MockListResult,
  type MockQuery,
} from "./store";
import { toBackendStatus, type PaymentStatus } from "./status";
import type { PaymentProvider } from "@/types/api";

/* -------------------------------------------------------------------------- */
/* Collections                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * The merchant the demo is signed in as.
 *
 * Every merchant-scoped read is scoped to this id, so a page can never leak
 * another merchant's records into its own totals.
 */
export const MOCK_MERCHANT_ID = "mer_001";

const merchants = new MockCollection<MockMerchant>(MOCK_MERCHANTS);
const accounts = new MockCollection<MockPaymentAccount>(MOCK_ACCOUNTS);
const devices = new MockCollection<MockDevice>(MOCK_DEVICES);
const customers = new MockCollection<MockCustomer>(MOCK_CUSTOMERS);
const payments = new MockCollection<MockPayment>(MOCK_PAYMENTS);
const transactions = new MockCollection<MockTransaction>(MOCK_TRANSACTIONS);
const invoices = new MockCollection<MockInvoice>(MOCK_INVOICES);
const paymentLinks = new MockCollection<MockPaymentLink>(MOCK_PAYMENT_LINKS);
const brands = new MockCollection<MockBrand>(MOCK_BRANDS);
const apiKeys = new MockCollection<MockApiKey>(MOCK_API_KEYS);
const apiLogs = new MockCollection<MockApiLog>(MOCK_API_LOGS);
const webhooks = new MockCollection<MockWebhook>(MOCK_WEBHOOKS);
const webhookDeliveries = new MockCollection<MockWebhookDelivery>(
  MOCK_WEBHOOK_DELIVERIES,
);
const team = new MockCollection<MockTeamMember>(MOCK_TEAM);
const customRoles = new MockCollection<MockCustomRole>(MOCK_CUSTOM_ROLES);
const auditLogs = new MockCollection<MockAuditLog>(MOCK_AUDIT_LOGS);
const providers = new MockCollection<MockProvider>(MOCK_PROVIDERS);
const adminStaff = new MockCollection<MockAdminStaff>(MOCK_ADMIN_STAFF);
const adminSessions = new MockCollection<MockAdminSession>(MOCK_ADMIN_SESSIONS);
const platformNotifications = new MockCollection<MockPlatformNotification>(
  MOCK_PLATFORM_NOTIFICATIONS,
);
const featureFlags = new MockCollection<MockFeatureFlag>(MOCK_FEATURE_FLAGS);
const sandboxTransactions = new MockCollection<MockSandboxTransaction>(
  MOCK_SANDBOX_TRANSACTIONS,
);
const billingHistory = new MockCollection<MockInvoiceRecord>(MOCK_BILLING_HISTORY);

/**
 * Notification preferences are keyed by event rather than by id, so they are
 * held as a plain array instead of a collection.
 */
const notificationSettings: MockNotificationSetting[] = MOCK_NOTIFICATION_SETTINGS.map(
  (setting) => ({ ...setting, channels: { ...setting.channels } }),
);

/**
 * The channels a merchant has set up. Held apart from `NOTIFICATION_CHANNELS`,
 * which is the fixed catalogue of what a channel *is*.
 */
const notificationChannels: MockNotificationChannelConfig[] =
  MOCK_NOTIFICATION_CHANNELS.map((config) => ({ ...config }));

/**
 * Whether two-factor authentication is switched on for the demo account.
 *
 * The backend has no two-factor state on the user record, so it is held here.
 */
let MOCK_TWO_FACTOR_ENABLED = false;

/* -------------------------------------------------------------------------- */
/* Shared option types                                                         */
/* -------------------------------------------------------------------------- */

/** Options accepted by every mock list endpoint. */
export interface MockListOptions extends MockQuery {
  /** Exact-match filter on the status field. */
  status?: string;
  /** Exact-match filter on the payment provider. */
  provider?: string;
  /** Exact-match filter on the customer the record belongs to. */
  customerId?: string;
  /** Inclusive lower bound on the amount, in BDT. */
  minAmount?: number;
  /** Inclusive upper bound on the amount, in BDT. */
  maxAmount?: number;
  /** Inclusive lower bound on the timestamp. */
  from?: string;
  /** Inclusive upper bound on the timestamp. */
  to?: string;
  /** Merchant scope. Defaults to the demo merchant. */
  merchantId?: string;
}

/** Options for a single-record read. */
export interface MockGetOptions {
  merchantId?: string;
}

/**
 * Resolves the merchant scope for a request.
 *
 * A merchant-scoped read defaults to the demo merchant. Admin views pass
 * `"*"` to reach every merchant.
 */
function merchantScope(options: { merchantId?: string } | undefined): string {
  const value = options?.merchantId;
  if (!value) return MOCK_MERCHANT_ID;
  return value;
}

/** True when the scope covers every merchant. */
function isAllMerchants(options: { merchantId?: string } | undefined): boolean {
  return options?.merchantId === "*";
}

/** Applies the amount and date window shared by the money-shaped lists. */
function withinWindow<T extends { amount: number; createdAt: string }>(
  rows: T[],
  options: MockListOptions,
): T[] {
  return rows.filter((row) => {
    if (options.minAmount !== undefined && row.amount < options.minAmount) {
      return false;
    }
    if (options.maxAmount !== undefined && row.amount > options.maxAmount) {
      return false;
    }
    if (options.from && row.createdAt < options.from) return false;
    if (options.to && row.createdAt > options.to) return false;
    return true;
  });
}

/* -------------------------------------------------------------------------- */
/* Merchants                                                                   */
/* -------------------------------------------------------------------------- */

/** Lists merchants, newest registration first. */
export function mockFetchMerchants(
  options: MockListOptions = {},
): MockListResult<MockMerchant> {
  let rows = merchants.all();

  if (!isAllMerchants(options)) {
    const scope = merchantScope(options);
    rows = rows.filter((merchant) => merchant.id === scope);
  }

  rows = rows.filter((merchant) => matchesFilter(merchant.status, options.status));

  rows = searchRows(rows, options.q, (merchant) => [
    merchant.businessName,
    merchant.ownerName,
    merchant.email,
    merchant.phone,
    merchant.id,
  ]);

  rows = sortRows(rows, options.sort ?? "lastActiveAt", options.order ?? "desc");

  return paginate(rows, options);
}

/** One merchant by id. */
export function mockFetchMerchant(
  id: string,
): MockMerchant | undefined {
  return merchants.get(id);
}

/** Updates a merchant. Used by the admin console's demo actions. */
export function mockUpdateMerchant(
  id: string,
  patch: Partial<MockMerchant>,
): MockMerchant | undefined {
  return merchants.update(id, patch);
}

/* -------------------------------------------------------------------------- */
/* Payment accounts                                                            */
/* -------------------------------------------------------------------------- */

/** Lists the demo merchant's payment accounts. */
export function mockFetchAccounts(
  options: MockListOptions = {},
): MockListResult<MockPaymentAccount> {
  let rows = accounts.all().filter(
    (account) => account.merchantId === merchantScope(options),
  );

  rows = rows.filter((account) => matchesFilter(account.status, options.status));
  rows = rows.filter((account) => matchesFilter(account.provider, options.provider));
  rows = rows.filter((account) =>
    matchesFilter(account.enabled, options.filters?.enabled),
  );


  rows = searchRows(rows, options.q, (account) => [
    account.label,
    account.accountNumber,
    account.provider,
    account.id,
  ]);

  rows = sortRows(rows, options.sort ?? "priority", options.order ?? "asc");

  return paginate(rows, options);
}

/** One payment account by id. */
export function mockFetchAccount(
  id: string,
): MockPaymentAccount | undefined {
  return accounts.get(id);
}

/** Creates a payment account. The number is masked on the way in. */
export function mockCreateAccount(
  input: Omit<MockPaymentAccount, "id" | "createdAt" | "lastActivityAt"> & {
    id?: string;
  },
): MockPaymentAccount {
  const row: MockPaymentAccount = {
    ...input,
    id: input.id ?? nextId("acc", accounts.all()),
    createdAt: mockTime(0),
    lastActivityAt: mockTime(0),
  };
  return accounts.insert(row);
}

/** Updates a payment account. */
export function mockUpdateAccount(
  id: string,
  patch: Partial<MockPaymentAccount>,
): MockPaymentAccount | undefined {
  return accounts.update(id, patch);
}

/** Removes a payment account. */
export function mockDeleteAccount(id: string): boolean {
  return accounts.remove(id);
}

/* -------------------------------------------------------------------------- */
/* Devices                                                                     */
/* -------------------------------------------------------------------------- */

/** Lists devices. */
export function mockFetchDevices(
  options: MockListOptions = {},
): MockListResult<MockDevice> {
  let rows = devices.all().filter(
    (device) => device.merchantId === merchantScope(options),
  );

  rows = rows.filter((device) => matchesFilter(device.status, options.status));
  rows = searchRows(rows, options.q, (device) => [
    device.name,
    device.deviceId,
    device.model,
    device.id,
  ]);
  rows = sortRows(rows, options.sort ?? "lastActiveAt", options.order ?? "desc");

  return paginate(rows, options);
}

/** One device by id. */
export function mockFetchDevice(id: string): MockDevice | undefined {
  return devices.get(id);
}

/** Removes a device. */
export function mockDeleteDevice(id: string): boolean {
  return devices.remove(id);
}

/* -------------------------------------------------------------------------- */
/* Customers                                                                   */
/* -------------------------------------------------------------------------- */

/** Lists the demo merchant's customers. */
export function mockFetchCustomers(
  options: MockListOptions = {},
): MockListResult<MockCustomer> {
  let rows = customers.all().filter(
    (customer) => customer.merchantId === merchantScope(options),
  );

  rows = searchRows(rows, options.q, (customer) => [
    customer.name,
    customer.email,
    customer.phone,
    ...customer.tags,
  ]);
  rows = sortRows(rows, options.sort ?? "totalSpent", options.order ?? "desc");

  return paginate(rows, options);
}

/** One customer by id. */
export function mockFetchCustomer(id: string): MockCustomer | undefined {
  return customers.get(id);
}

/**
 * The payments a customer has made.
 *
 * The customer list is the merchant's own; the payments behind it come from
 * the same records the payments screen shows, so a customer's history and the
 * payments screen never disagree.
 */
export function mockFetchCustomerPayments(
  customerId: string,
  options: MockListOptions = {},
): MockListResult<MockPayment> {
  let rows = payments.all().filter(
    (payment) =>
      payment.merchantId === merchantScope(options) &&
      payment.customerId === customerId,
  );

  rows = rows.filter((payment) => matchesFilter(payment.status, options.status));
  rows = rows.filter((payment) => matchesFilter(payment.provider, options.provider));
  rows = withinWindow(rows, options);
  rows = searchRows(rows, options.q, (payment) => [
    payment.reference,
    payment.orderReference ?? "",
    payment.providerRef ?? "",
    payment.id,
  ]);
  rows = sortRows(rows, options.sort ?? "createdAt", options.order ?? "desc");

  return paginate(rows, options);
}

/** The invoices raised for a customer. */
export function mockFetchCustomerInvoices(
  customerId: string,
  options: MockListOptions = {},
): MockListResult<MockInvoice> {
  let rows = invoices.all().filter(
    (invoice) =>
      invoice.merchantId === merchantScope(options) &&
      invoice.customerId === customerId,
  );

  rows = rows.filter((invoice) => matchesFilter(invoice.status, options.status));
  rows = searchRows(rows, options.q, (invoice) => [
    invoice.number,
    invoice.customerName,
    invoice.id,
  ]);
  rows = sortRows(rows, options.sort ?? "createdAt", options.order ?? "desc");

  return paginate(rows, options);
}

/**
 * Flattens customers into CSV.
 *
 * The same column order is used by every customer export, so a file exported
 * here can be re-imported without editing.
 */
export function mockExportCustomersCsv(
  options: MockListOptions = {},
): string {
  const { rows } = mockFetchCustomers({ ...options, pageSize: 200 });

  const header = [
    "Name",
    "Email",
    "Phone",
    "Tags",
    "Total spent",
    "Payment count",
    "Favourite provider",
    "First payment",
    "Last payment",
    "Notes",
  ];

  const escape = (value: string | number | null) => {
    const text = value === null ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const lines = rows.map((row) =>
    [
      row.name,
      row.email,
      row.phone,
      row.tags.join(", "),
      row.totalSpent,
      row.paymentCount,
      row.favouriteProvider ?? "",
      row.firstPaymentAt ?? "",
      row.lastPaymentAt ?? "",
      row.notes,
    ]
      .map(escape)
      .join(","),
  );

  return [header.join(","), ...lines].join("\n");
}

/** The outcome of a CSV import. */
export interface MockCustomerImportResult {
  /** Customers added to the directory. */
  created: number;
  /** Rows that were already present and were left alone. */
  skipped: number;
  /** One message per rejected row, in file order. */
  errors: { row: number; message: string }[];
}

/**
 * Imports customers from a CSV file.
 *
 * The file needs a `name` column; `email`, `phone`, `tags` and `notes` are
 * optional. Rows without a name are rejected with a message rather than
 * silently dropped, and a row whose email already exists is skipped.
 */
export function mockImportCustomersCsv(csv: string): MockCustomerImportResult {
  const result: MockCustomerImportResult = {
    created: 0,
    skipped: 0,
    errors: [],
  };

  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    result.errors.push({ row: 0, message: "The file is empty." });
    return result;
  }

  const parse = (line: string) => {
    const cells: string[] = [];
    let current = "";
    let quoted = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];

      if (quoted) {
        if (char === '"' && line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else if (char === '"') {
          quoted = false;
        } else {
          current += char;
        }
        continue;
      }

      if (char === '"') {
        quoted = true;
      } else if (char === ",") {
        cells.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    cells.push(current.trim());
    return cells;
  };

  const header = parse(lines[0]).map((cell) => cell.toLowerCase());
  const column = (name: string) => header.indexOf(name);

  const nameIndex = column("name");
  if (nameIndex === -1) {
    result.errors.push({
      row: 1,
      message: "The file needs a 'name' column in the first row.",
    });
    return result;
  }

  const emailIndex = column("email");
  const phoneIndex = column("phone");
  const tagsIndex = column("tags");
  const notesIndex = column("notes");

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const cells = parse(lines[lineIndex]);
    const name = cells[nameIndex] ?? "";
    const email = emailIndex === -1 ? "" : (cells[emailIndex] ?? "");
    const phone = phoneIndex === -1 ? "" : (cells[phoneIndex] ?? "");
    const tags =
      tagsIndex === -1 ? "" : (cells[tagsIndex] ?? "");
    const notes = notesIndex === -1 ? "" : (cells[notesIndex] ?? "");

    if (name.length < 2) {
      result.errors.push({
        row: lineIndex + 1,
        message: "The name is missing or too short.",
      });
      continue;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      result.errors.push({
        row: lineIndex + 1,
        message: "The email address is not valid.",
      });
      continue;
    }

    const exists = customers
      .all()
      .some(
        (customer) =>
          customer.merchantId === MOCK_MERCHANT_ID &&
          (customer.email.toLowerCase() === email.toLowerCase() ||
            customer.phone === phone),
      );

    if (exists) {
      result.skipped += 1;
      continue;
    }

    mockCreateCustomer({
      merchantId: MOCK_MERCHANT_ID,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@example.test`,
      phone: phone || "01700000000",
      totalSpent: 0,
      paymentCount: 0,
      tags: tags
        .split(/[,;|]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
      notes,
      favouriteProvider: null,
    });

    result.created += 1;
  }

  return result;
}

/** Creates a customer. */
export function mockCreateCustomer(
  input: Omit<MockCustomer, "id" | "firstPaymentAt" | "lastPaymentAt"> & {
    id?: string;
  },
): MockCustomer {
  return customers.insert({
    ...input,
    id: input.id ?? nextId("cus", customers.all()),
    firstPaymentAt: null,
    lastPaymentAt: null,
  });
}

/** Updates a customer. */
export function mockUpdateCustomer(
  id: string,
  patch: Partial<MockCustomer>,
): MockCustomer | undefined {
  return customers.update(id, patch);
}

/** Removes a customer. */
export function mockDeleteCustomer(id: string): boolean {
  return customers.remove(id);
}

/* -------------------------------------------------------------------------- */
/* Payments                                                                    */
/* -------------------------------------------------------------------------- */

/** Lists payments. */
export function mockFetchPayments(
  options: MockListOptions = {},
): MockListResult<MockPayment> {
  let rows = payments.all().filter(
    (payment) => payment.merchantId === merchantScope(options),
  );

  rows = rows.filter((payment) => matchesFilter(payment.status, options.status));
  rows = rows.filter((payment) => matchesFilter(payment.provider, options.provider));
  rows = withinWindow(rows, options);
  rows = searchRows(rows, options.q, (payment) => [
    payment.reference,
    payment.customerName,
    payment.customerPhone,
    payment.accountLabel,
    payment.orderReference,
    payment.id,
  ]);
  rows = sortRows(rows, options.sort ?? "createdAt", options.order ?? "desc");

  return paginate(rows, options);
}

/** One payment by id. */
export function mockFetchPayment(id: string): MockPayment | undefined {
  return payments.get(id);
}

/**
 * Moves a payment to a new status.
 *
 * This is a demo action. It does not talk to a provider and it does not mean
 * the money moved — the status label in `status.ts` says as much.
 */
export function mockUpdatePaymentStatus(
  id: string,
  status: PaymentStatus,
  note?: { body: string; author: string },
): MockPayment | undefined {
  const payment = payments.get(id);
  if (!payment) return undefined;

  const updatedAt = mockTime(0);
  const timeline = [
    ...payment.timeline,
    {
      at: updatedAt,
      label: `Marked as ${status.toLowerCase()}`,
      detail:
        note?.body ??
        "Changed from the demo console. No provider-side check was performed.",
    },
  ];

  const notes = note
    ? [
        ...payment.notes,
        {
          id: nextId("note", payment.notes),
          body: note.body,
          author: note.author,
          createdAt: updatedAt,
        },
      ]
    : payment.notes;

  return payments.update(id, { status, updatedAt, timeline, notes });
}

/** Appends an internal note to a payment. */
export function mockAddPaymentNote(
  id: string,
  body: string,
  author: string,
): MockPayment | undefined {
  const payment = payments.get(id);
  if (!payment) return undefined;

  const note = {
    id: nextId("note", payment.notes),
    body,
    author,
    createdAt: mockTime(0),
  };

  return payments.update(id, {
    notes: [...payment.notes, note],
    updatedAt: note.createdAt,
  });
}

/* -------------------------------------------------------------------------- */
/* Transactions                                                                */
/* -------------------------------------------------------------------------- */

/** Lists recorded transactions. */
export function mockFetchTransactions(
  options: MockListOptions = {},
): MockListResult<MockTransaction> {
  let rows = transactions.all().filter(
    (transaction) =>
      transaction.merchantId === merchantScope(options),
  );

  rows = rows.filter((transaction) => matchesFilter(transaction.status, options.status));
  rows = rows.filter((transaction) =>
    matchesFilter(transaction.provider, options.provider),
  );
  rows = withinWindow(rows, options);
  rows = searchRows(rows, options.q, (transaction) => [
    transaction.reference,
    transaction.customerName,
    transaction.customerPhone,
    transaction.accountLabel,
    transaction.providerRef,
    transaction.id,
  ]);
  rows = sortRows(rows, options.sort ?? "occurredAt", options.order ?? "desc");

  return paginate(rows, options);
}

/** One transaction by id. */
export function mockFetchTransaction(id: string): MockTransaction | undefined {
  return transactions.get(id);
}

/** Records a review decision on a transaction. */
export function mockReviewTransaction(
  id: string,
  decision: "APPROVED" | "REJECTED",
  reviewer: string,
): MockTransaction | undefined {
  const transaction = transactions.get(id);
  if (!transaction) return undefined;

  const reviewedAt = mockTime(0);
  const status: PaymentStatus =
    decision === "APPROVED" ? "CONFIRMED" : "FAILED";

  return transactions.update(id, {
    status,
    reviewedAt,
    reviewedByName: reviewer,
  });
}

/**
 * Flattens transactions into CSV.
 *
 * The same column order is used by every export in the app, so the files line
 * up with each other.
 */
export function mockExportTransactionsCsv(
  options: MockListOptions = {},
): string {
  const { rows } = mockFetchTransactions({ ...options, pageSize: 200 });

  const header = [
    "Reference",
    "Provider",
    "Amount",
    "Currency",
    "Customer",
    "Phone",
    "Account",
    "Status",
    "Provider reference",
    "Occurred at",
    "Recorded at",
  ];

  const escape = (value: string | number | null) => {
    const text = value === null ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const lines = rows.map((row) =>
    [
      row.reference,
      row.provider,
      row.amount,
      "BDT",
      row.customerName ?? "",
      row.customerPhone ?? "",
      row.accountLabel,
      row.status,
      row.providerRef ?? "",
      row.occurredAt,
      row.createdAt,
    ]
      .map(escape)
      .join(","),
  );

  return [header.join(","), ...lines].join("\n");
}

/* -------------------------------------------------------------------------- */
/* Invoices                                                                    */
/* -------------------------------------------------------------------------- */

/** Computes the money totals for an invoice. */
export function invoiceTotals(invoice: MockInvoice) {
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const discount = invoice.discount ?? 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round((taxable * invoice.taxRate) / 100);
  return { subtotal, discount, tax, total: taxable + tax };
}

/** Lists invoices. */
export function mockFetchInvoices(
  options: MockListOptions = {},
): MockListResult<MockInvoice> {
  let rows = invoices.all().filter(
    (invoice) => invoice.merchantId === merchantScope(options),
  );

  rows = rows.filter((invoice) => matchesFilter(invoice.status, options.status));
  rows = searchRows(rows, options.q, (invoice) => [
    invoice.number,
    invoice.customerName,
    invoice.customerEmail,
    invoice.customerPhone,
    invoice.id,
  ]);
  rows = sortRows(rows, options.sort ?? "createdAt", options.order ?? "desc");

  return paginate(rows, options);
}

/** One invoice by id. */
export function mockFetchInvoice(id: string): MockInvoice | undefined {
  return invoices.get(id);
}

/** Creates an invoice. */
export function mockCreateInvoice(
  input: Omit<
    MockInvoice,
    "id" | "createdAt" | "issuedAt" | "paidAt" | "remindersSent"
  > & { id?: string },
): MockInvoice {
  return invoices.insert({
    ...input,
    id: input.id ?? nextId("inv", invoices.all()),
    createdAt: mockTime(0),
    issuedAt: null,
    paidAt: null,
    remindersSent: 0,
  });
}

/** Updates an invoice. */
export function mockUpdateInvoice(
  id: string,
  patch: Partial<MockInvoice>,
): MockInvoice | undefined {
  return invoices.update(id, patch);
}

/** Removes an invoice. */
export function mockDeleteInvoice(id: string): boolean {
  return invoices.remove(id);
}

/**
 * Sends a reminder for an invoice.
 *
 * Nothing is sent. The page says so; this only bumps a counter so the demo
 * shows the state change a real send would cause.
 */
export function mockSendInvoiceReminder(
  id: string,
): MockInvoice | undefined {
  const invoice = invoices.get(id);
  if (!invoice) return undefined;

  return invoices.update(id, {
    remindersSent: invoice.remindersSent + 1,
  });
}

/* -------------------------------------------------------------------------- */
/* Payment links                                                               */
/* -------------------------------------------------------------------------- */

/** Lists payment links. */
export function mockFetchPaymentLinks(
  options: MockListOptions = {},
): MockListResult<MockPaymentLink> {
  let rows = paymentLinks.all().filter(
    (link) => link.merchantId === merchantScope(options),
  );

  rows = rows.filter((link) => matchesFilter(link.status, options.status));
  rows = rows.filter((link) => matchesFilter(link.provider, options.provider));
  rows = searchRows(rows, options.q, (link) => [
    link.title,
    link.code,
    link.description,
    link.id,
  ]);
  rows = sortRows(rows, options.sort ?? "createdAt", options.order ?? "desc");

  return paginate(rows, options);
}

/** One payment link by id. */
export function mockFetchPaymentLink(id: string): MockPaymentLink | undefined {
  return paymentLinks.get(id);
}

/** Creates a payment link. */
export function mockCreatePaymentLink(
  input: Omit<MockPaymentLink, "id" | "createdAt" | "usageCount" | "revenue"> & {
    id?: string;
  },
): MockPaymentLink {
  return paymentLinks.insert({
    ...input,
    id: input.id ?? nextId("lnk", paymentLinks.all()),
    createdAt: mockTime(0),
    usageCount: 0,
    revenue: 0,
  });
}

/** Updates a payment link. */
export function mockUpdatePaymentLink(
  id: string,
  patch: Partial<MockPaymentLink>,
): MockPaymentLink | undefined {
  return paymentLinks.update(id, patch);
}

/** Removes a payment link. */
export function mockDeletePaymentLink(id: string): boolean {
  return paymentLinks.remove(id);
}

/* -------------------------------------------------------------------------- */
/* Brands                                                                      */
/* -------------------------------------------------------------------------- */

/** Lists brands. */
export function mockFetchBrands(
  options: MockListOptions = {},
): MockListResult<MockBrand> {
  let rows = brands.all().filter(
    (brand) => brand.merchantId === merchantScope(options),
  );

  rows = rows.filter((brand) => matchesFilter(brand.status, options.status));
  rows = searchRows(rows, options.q, (brand) => [brand.name, brand.websiteUrl, brand.id]);
  rows = sortRows(rows, options.sort ?? "createdAt", options.order ?? "desc");

  return paginate(rows, options);
}

/** One brand by id. */
export function mockFetchBrand(id: string): MockBrand | undefined {
  return brands.get(id);
}

/** Creates a brand. */
export function mockCreateBrand(
  input: Omit<
    MockBrand,
    "id" | "createdAt" | "revenue" | "transactionCount"
  > & { id?: string },
): MockBrand {
  return brands.insert({
    ...input,
    id: input.id ?? nextId("brd", brands.all()),
    createdAt: mockTime(0),
    revenue: 0,
    transactionCount: 0,
  });
}

/** Updates a brand. */
export function mockUpdateBrand(
  id: string,
  patch: Partial<MockBrand>,
): MockBrand | undefined {
  return brands.update(id, patch);
}

/** Removes a brand. */
export function mockDeleteBrand(id: string): boolean {
  return brands.remove(id);
}

/* -------------------------------------------------------------------------- */
/* API keys and request logs                                                   */
/* -------------------------------------------------------------------------- */

/** Lists API keys. */
export function mockFetchApiKeys(
  options: MockListOptions = {},
): MockListResult<MockApiKey> {
  let rows = apiKeys.all().filter(
    (key) => key.merchantId === merchantScope(options),
  );

  rows = rows.filter((key) => matchesFilter(key.status, options.status));
  rows = rows.filter((key) => matchesFilter(key.environment, options.filters?.environment));
  rows = searchRows(rows, options.q, (key) => [key.name, key.keyPrefix, key.id]);
  rows = sortRows(rows, options.sort ?? "createdAt", options.order ?? "desc");

  return paginate(rows, options);
}

/** One API key by id. */
export function mockFetchApiKey(id: string): MockApiKey | undefined {
  return apiKeys.get(id);
}

/**
 * Issues an API key.
 *
 * The secret is returned once, at creation, and is never stored — exactly
 * like the real endpoint. `keyPrefix` is what the list shows afterwards.
 */
export function mockCreateApiKey(input: {
  name: string;
  environment?: "LIVE" | "TEST";
  scopes?: string[];
}): { key: MockApiKey; secret: string } {
  const secret = `zp_live_demo_${input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 8)}_demo`;

  const key = apiKeys.insert({
    id: nextId("key", apiKeys.all()),
    merchantId: MOCK_MERCHANT_ID,
    name: input.name,
    keyPrefix: `${secret.slice(0, 12)}••••••••`,
    environment: input.environment ?? "LIVE",
    scopes: input.scopes ?? ["payments:read"],
    status: "ACTIVE",
    lastUsedAt: null,
    createdAt: mockTime(0),
    expiresAt: null,
  });

  return { key, secret };
}

/** Revokes an API key. */
export function mockRevokeApiKey(id: string): MockApiKey | undefined {
  return apiKeys.update(id, { status: "REVOKED" });
}

/** Lists API request logs. */
export function mockFetchApiLogs(
  options: MockListOptions = {},
): MockListResult<MockApiLog> {
  // The admin console asks for every merchant's logs at once.
  let rows = isAllMerchants(options)
    ? apiLogs.all()
    : apiLogs.all().filter((log) => log.merchantId === merchantScope(options));

  rows = rows.filter((log) => matchesFilter(log.method, options.filters?.method));
  rows = rows.filter((log) =>
    matchesFilter(log.merchantId, options.filters?.merchantId),
  );
  rows = rows.filter((log) =>
    matchesFilter(String(log.statusCode), options.filters?.statusCode),
  );
  rows = searchRows(rows, options.q, (log) => [
    log.path,
    log.requestId,
    log.ipAddress,
    log.method,
    log.errorCode ?? "",
  ]);
  rows = sortRows(rows, options.sort ?? "createdAt", options.order ?? "desc");

  return paginate(rows, options);
}

/* -------------------------------------------------------------------------- */
/* Webhooks                                                                    */
/* -------------------------------------------------------------------------- */

/** Lists webhook endpoints. */
export function mockFetchWebhooks(
  options: MockListOptions = {},
): MockListResult<MockWebhook> {
  // The admin console asks for every merchant's endpoints at once.
  let rows = isAllMerchants(options)
    ? webhooks.all()
    : webhooks.all().filter((webhook) => webhook.merchantId === merchantScope(options));

  rows = rows.filter((webhook) => matchesFilter(webhook.status, options.status));
  rows = rows.filter((webhook) =>
    matchesFilter(webhook.merchantId, options.filters?.merchantId),
  );
  rows = searchRows(rows, options.q, (webhook) => [
    webhook.url,
    webhook.description,
    webhook.id,
  ]);
  rows = sortRows(rows, options.sort ?? "createdAt", options.order ?? "desc");

  return paginate(rows, options);
}

/** One webhook by id. */
export function mockFetchWebhook(id: string): MockWebhook | undefined {
  return webhooks.get(id);
}

/** Creates a webhook endpoint. */
export function mockCreateWebhook(
  input: Omit<
    MockWebhook,
    "id" | "createdAt" | "lastDeliveryAt" | "successRate" | "secret"
  > & { id?: string },
): MockWebhook {
  return webhooks.insert({
    ...input,
    id: input.id ?? nextId("wh", webhooks.all()),
    createdAt: mockTime(0),
    lastDeliveryAt: null,
    successRate: 100,
    secret: "whsec_••••••••••••••••••••demo",
  });
}

/** Updates a webhook endpoint. */
export function mockUpdateWebhook(
  id: string,
  patch: Partial<MockWebhook>,
): MockWebhook | undefined {
  return webhooks.update(id, patch);
}

/** Removes a webhook endpoint. */
export function mockDeleteWebhook(id: string): boolean {
  webhooks.remove(id);
  for (const delivery of webhookDeliveries.all()) {
    if (delivery.webhookId === id) webhookDeliveries.remove(delivery.id);
  }
  return true;
}

/** Lists webhook deliveries. */
export function mockFetchWebhookDeliveries(
  options: MockListOptions & { webhookId?: string } = {},
): MockListResult<MockWebhookDelivery> {
  let rows = webhookDeliveries.all();

  if (options.webhookId) {
    rows = rows.filter((delivery) => delivery.webhookId === options.webhookId);
  }

  rows = rows.filter((delivery) => matchesFilter(delivery.status, options.status));
  rows = rows.filter((delivery) => matchesFilter(delivery.event, options.filters?.event));
  rows = searchRows(rows, options.q, (delivery) => [
    delivery.id,
    delivery.event,
    delivery.status,
  ]);
  rows = sortRows(rows, options.sort ?? "createdAt", options.order ?? "desc");

  return paginate(rows, options);
}

/**
 * Replays a delivery.
 *
 * The attempt counter goes up and the delivery is marked as retrying. Nothing
 * leaves the browser.
 */
export function mockRetryWebhookDelivery(
  id: string,
): MockWebhookDelivery | undefined {
  const delivery = webhookDeliveries.get(id);
  if (!delivery) return undefined;

  return webhookDeliveries.update(id, {
    attempt: delivery.attempt + 1,
    status: "RETRYING",
  });
}

/**
 * Sends a test event to an endpoint.
 *
 * A delivery record is written so the log shows what would have happened.
 * No HTTP request is made — the endpoint is never contacted.
 */
export function mockSendTestWebhook(
  webhookId: string,
  event: MockWebhook["events"][number] = "payment.confirmed",
): MockWebhookDelivery | undefined {
  const webhook = webhooks.get(webhookId);
  if (!webhook) return undefined;

  const requestBody = JSON.stringify(
    {
      id: "pay_test_0001",
      event,
      amount: 2450,
      currency: "BDT",
      provider: "BKASH",
      test: true,
    },
    null,
    2,
  );

  const delivery = webhookDeliveries.insert({
    id: nextId("dlv", webhookDeliveries.all()),
    webhookId,
    event,
    statusCode: 200,
    status: "DELIVERED",
    durationMs: 118,
    createdAt: mockTime(0),
    requestBody,
    responseBody: JSON.stringify({ received: true, test: true }, null, 2),
    attempt: 1,
  });

  webhooks.update(webhookId, { lastDeliveryAt: delivery.createdAt });

  return delivery;
}

/* -------------------------------------------------------------------------- */
/* Sandbox                                                                     */
/* -------------------------------------------------------------------------- */

/** Lists sandbox transactions. */
export function mockFetchSandboxTransactions(
  options: MockListOptions = {},
): MockListResult<MockSandboxTransaction> {
  let rows = sandboxTransactions.all();

  rows = rows.filter((row) => matchesFilter(row.scenario, options.status));
  rows = searchRows(rows, options.q, (row) => [row.reference, row.id, row.provider]);
  rows = sortRows(rows, options.sort ?? "createdAt", options.order ?? "desc");

  return paginate(rows, options);
}

/** Removes a sandbox record. */
export function mockDeleteSandboxTransaction(id: string): boolean {
  return sandboxTransactions.remove(id);
}

/**
 * Runs a sandbox payment.
 *
 * The scenario is chosen by the caller: "success", "failed" or "pending".
 * The response body is what a real endpoint would return, so the docs page
 * can show the same shape.
 */
export function mockRunSandboxPayment(input: {
  scenario: "success" | "failed" | "pending";
  amount: number;
  provider: PaymentProvider;
}): { transaction: MockSandboxTransaction; response: Record<string, unknown> } {
  const reference = `SBX-${String(sandboxTransactions.size + 1).padStart(4, "0")}`;

  const response: Record<string, unknown> =
    input.scenario === "success"
      ? {
          id: `pay_sbx_${reference}`,
          status: "CONFIRMED",
          amount: input.amount,
          currency: "BDT",
          provider: input.provider,
          providerRef: "SBX7Q2M9K4L",
          sandbox: true,
        }
      : input.scenario === "failed"
        ? {
            id: `pay_sbx_${reference}`,
            status: "FAILED",
            amount: input.amount,
            currency: "BDT",
            provider: input.provider,
            error: {
              code: "VERIFICATION_FAILED",
              message: "No matching notification was found.",
            },
            sandbox: true,
          }
        : {
            id: `pay_sbx_${reference}`,
            status: "PENDING",
            amount: input.amount,
            currency: "BDT",
            provider: input.provider,
            message: "Waiting for a matching notification.",
            sandbox: true,
          };

  const transaction = sandboxTransactions.insert({
    id: nextId("sbx", sandboxTransactions.all()),
    reference,
    scenario: input.scenario,
    amount: input.amount,
    provider: input.provider,
    createdAt: mockTime(0),
    request: `POST /api/v1/sandbox/payments\n${JSON.stringify(
      { amount: input.amount, currency: "BDT", provider: input.provider, scenario: input.scenario },
      null,
      2,
    )}`,
    response: JSON.stringify(response, null, 2),
  });

  return { transaction, response };
}

/* -------------------------------------------------------------------------- */
/* Team                                                                        */
/* -------------------------------------------------------------------------- */

/** Lists team members. */
export function mockFetchTeam(
  options: MockListOptions = {},
): MockListResult<MockTeamMember> {
  let rows = team.all().filter(
    (member) => member.merchantId === merchantScope(options),
  );

  rows = rows.filter((member) => matchesFilter(member.role, options.status));
  rows = rows.filter((member) => matchesFilter(member.status, options.filters?.state));
  rows = searchRows(rows, options.q, (member) => [
    member.name,
    member.email,
    member.role,
    member.id,
  ]);
  rows = sortRows(rows, options.sort ?? "joinedAt", options.order ?? "asc");

  return paginate(rows, options);
}

/** One team member by id. */
export function mockFetchTeamMember(id: string): MockTeamMember | undefined {
  return team.get(id);
}

/** Invites a team member. */
export function mockInviteTeamMember(input: {
  name: string;
  email: string;
  role: MockRole;
}): MockTeamMember {
  return team.insert({
    id: nextId("mem", team.all()),
    merchantId: MOCK_MERCHANT_ID,
    name: input.name,
    email: input.email,
    role: input.role,
    status: "INVITED",
    lastLoginAt: null,
    joinedAt: mockTime(0),
    activity: [
      { at: mockTime(0), action: "Invitation sent" },
    ],
  });
}

/** Updates a team member. */
export function mockUpdateTeamMember(
  id: string,
  patch: Partial<MockTeamMember>,
): MockTeamMember | undefined {
  return team.update(id, patch);
}

/** Removes a team member. */
export function mockDeleteTeamMember(id: string): boolean {
  return team.remove(id);
}

/** The permission catalogue. */
export function mockFetchPermissions(): MockPermission[] {
  return MOCK_PERMISSIONS;
}

/** The default role → permission mapping. */
export function mockFetchRolePermissions(): Record<MockRole, string[]> {
  return MOCK_ROLE_PERMISSIONS;
}

/** Lists custom roles. */
export function mockFetchCustomRoles(
  options: MockListOptions = {},
): MockListResult<MockCustomRole> {
  let rows = customRoles.all().filter(
    (role) => role.merchantId === merchantScope(options),
  );

  rows = searchRows(rows, options.q, (role) => [role.name, role.description, role.id]);

  return paginate(rows, options);
}

/** Creates a custom role. */
export function mockCreateCustomRole(input: {
  name: string;
  description: string;
  permissions: string[];
}): MockCustomRole {
  return customRoles.insert({
    id: nextId("role", customRoles.all()),
    merchantId: MOCK_MERCHANT_ID,
    name: input.name,
    description: input.description,
    permissions: input.permissions,
    memberCount: 0,
    createdAt: mockTime(0),
  });
}

/** Removes a custom role. */
export function mockDeleteCustomRole(id: string): boolean {
  return customRoles.remove(id);
}

/* -------------------------------------------------------------------------- */
/* Billing                                                                     */
/* -------------------------------------------------------------------------- */

/** The available plans. */
export function mockFetchPlans(): MockPlan[] {
  return MOCK_PLANS;
}

/** One plan by id. */
export function mockFetchPlan(id: string): MockPlan | undefined {
  return MOCK_PLANS.find((plan) => plan.id === id);
}

/** The demo merchant's current subscription. */
export function mockFetchSubscription(): MockSubscription {
  // A copy, so a page holding this in React state notices a change.
  return { ...MOCK_SUBSCRIPTION, usage: { ...MOCK_SUBSCRIPTION.usage } };
}

/**
 * Changes the demo plan.
 *
 * The price is not charged. The page says the plan is configurable.
 */
export function mockChangePlan(
  planId: string,
  billingCycle: "MONTHLY" | "YEARLY",
): MockSubscription | undefined {
  if (!MOCK_PLANS.some((plan) => plan.id === planId)) return undefined;

  MOCK_SUBSCRIPTION.planId = planId;
  MOCK_SUBSCRIPTION.billingCycle = billingCycle;

  return { ...MOCK_SUBSCRIPTION };
}

/**
 * Cancels the demo subscription.
 *
 * Nothing is sent to a billing system — there is none. The status changes so
 * the page can show what a cancelled subscription looks like.
 */
export function mockCancelSubscription(): MockSubscription {
  MOCK_SUBSCRIPTION.status = "CANCELLED";
  return { ...MOCK_SUBSCRIPTION };
}

/** The billing history. */
export function mockFetchBillingHistory(
  options: MockListOptions = {},
): MockListResult<MockInvoiceRecord> {
  let rows = billingHistory.all();

  rows = rows.filter((row) => matchesFilter(row.status, options.status));
  rows = searchRows(rows, options.q, (row) => [row.number, row.plan, row.id]);
  rows = sortRows(rows, options.sort ?? "date", options.order ?? "desc");

  return paginate(rows, options);
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                               */
/* -------------------------------------------------------------------------- */

/** The notification channels a merchant can switch on. */
export function mockFetchNotificationChannels() {
  return NOTIFICATION_CHANNELS;
}

/** How each channel is configured for this merchant. */
export function mockFetchNotificationChannelConfigs(): MockNotificationChannelConfig[] {
  // A copy, not the stored array. The page holds this in React state, and
  // handing back the same reference would stop React noticing a change.
  return notificationChannels.map((config) => ({ ...config }));
}

/** The notification events a merchant can subscribe to. */
export function mockFetchNotificationEvents() {
  return NOTIFICATION_EVENTS;
}

/** The current channel preferences, per event. */
export function mockFetchNotificationSettings(): MockNotificationSetting[] {
  // A copy, for the same reason as the channels above.
  return notificationSettings.map((setting) => ({
    ...setting,
    channels: { ...setting.channels },
  }));
}

/**
 * Turns a channel on or off for an event.
 *
 * Nothing is sent. The preferences are stored so the page behaves like the
 * real thing once the notification service exists.
 */
export function mockUpdateNotificationSetting(
  event: NotificationEvent,
  channel: NotificationChannel,
  enabled: boolean,
): MockNotificationSetting | undefined {
  const setting = notificationSettings.find((row) => row.event === event);
  if (!setting) return undefined;

  setting.channels[channel] = enabled;
  return setting;
}

/**
 * Enables or disables a channel as a whole.
 *
 * Disabling a channel also clears it from every event, because a channel that
 * is switched off cannot carry an event.
 */
export function mockUpdateNotificationChannel(
  channel: NotificationChannel,
  enabled: boolean,
): MockNotificationChannelConfig | undefined {
  const config = notificationChannels.find((row) => row.channel === channel);
  if (!config) return undefined;

  config.enabled = enabled;
  config.note = enabled ? null : "This channel is switched off.";

  if (!enabled) {
    for (const setting of notificationSettings) {
      setting.channels[channel] = false;
    }
  }

  return config;
}

/**
 * Sets where a channel delivers to.
 *
 * The address is stored only. Nothing is contacted, and no message is sent.
 */
export function mockUpdateNotificationChannelDestination(
  channel: NotificationChannel,
  destination: string,
): MockNotificationChannelConfig | undefined {
  const config = notificationChannels.find((row) => row.channel === channel);
  if (!config) return undefined;

  config.destination = destination;
  config.enabled = true;
  config.note = null;
  return config;
}

/**
 * Sends a test notification.
 *
 * Nothing leaves the browser. The call records the attempt and says so, so the
 * button can be exercised without a message service behind it.
 */
export function mockSendTestNotification(
  channel: NotificationChannel,
): { channel: NotificationChannel; destination: string | null; sentAt: string } | undefined {
  const config = notificationChannels.find((row) => row.channel === channel);
  if (!config) return undefined;

  return {
    channel,
    destination: config.destination,
    sentAt: new Date(MOCK_NOW).toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/* Settings and security                                                       */
/* -------------------------------------------------------------------------- */

/** The demo merchant's business profile. */
export function mockFetchMerchantSettings(): MockMerchantSettings {
  // A copy, so a page holding this in React state notices a change.
  return { ...MOCK_MERCHANT_SETTINGS };
}

/** Updates the business profile. */
export function mockUpdateMerchantSettings(
  patch: Partial<MockMerchantSettings>,
): MockMerchantSettings {
  Object.assign(MOCK_MERCHANT_SETTINGS, patch);
  return { ...MOCK_MERCHANT_SETTINGS };
}

/** The signed-in user's active sessions. */
export function mockFetchSessions() {
  return MOCK_SESSIONS.map((session) => ({ ...session }));
}

/** The sign-in history. */
export function mockFetchLoginHistory() {
  return MOCK_LOGIN_HISTORY.map((event) => ({ ...event }));
}

/** The security event log. */
export function mockFetchSecurityEvents() {
  return MOCK_SECURITY_EVENTS.map((event) => ({ ...event }));
}

/**
 * Signs a session out.
 *
 * The session is removed from the demo list. Nothing is revoked on a real
 * server — there is no session store to revoke it from.
 */
export function mockRevokeSession(id: string): boolean {
  const index = MOCK_SESSIONS.findIndex((session) => session.id === id);
  if (index === -1) return false;
  MOCK_SESSIONS.splice(index, 1);
  return true;
}

/**
 * Turns two-factor authentication on or off.
 *
 * The backend has no two-factor state, so this is held in the demo layer.
 */
export function mockSetTwoFactorEnabled(enabled: boolean): boolean {
  MOCK_TWO_FACTOR_ENABLED = enabled;
  return enabled;
}

/** Whether two-factor authentication is on. */
export function mockFetchTwoFactorEnabled(): boolean {
  return MOCK_TWO_FACTOR_ENABLED;
}

/* -------------------------------------------------------------------------- */
/* Admin                                                                       */
/* -------------------------------------------------------------------------- */

/** Lists the platform's providers. */
export function mockFetchProviders(
  options: MockListOptions = {},
): MockListResult<MockProvider> {
  let rows = providers.all();

  rows = rows.filter((provider) => matchesFilter(provider.status, options.status));
  rows = rows.filter((provider) =>
    matchesFilter(provider.code, options.filters?.provider),
  );
  rows = searchRows(rows, options.q, (provider) => [
    provider.name,
    provider.code,
    provider.id,
  ]);
  rows = sortRows(rows, options.sort ?? "name", options.order ?? "asc");

  return paginate(rows, options);
}

/** One provider by id. */
export function mockFetchProvider(id: string): MockProvider | undefined {
  return providers.get(id);
}

/** Enables or disables a provider. */
export function mockUpdateProvider(
  id: string,
  patch: Partial<MockProvider>,
): MockProvider | undefined {
  return providers.update(id, patch);
}

/** Lists the platform staff. */
export function mockFetchAdminStaff(
  options: MockListOptions = {},
): MockListResult<MockAdminStaff> {
  let rows = adminStaff.all();

  rows = rows.filter((member) => matchesFilter(member.role, options.status));
  rows = rows.filter((member) =>
    matchesFilter(member.status, options.filters?.state),
  );
  rows = searchRows(rows, options.q, (member) => [
    member.name,
    member.email,
    member.id,
  ]);
  rows = sortRows(rows, options.sort ?? "createdAt", options.order ?? "asc");

  return paginate(rows, options);
}

/** Lists the audit log. */
export function mockFetchAuditLogs(
  options: MockListOptions = {},
): MockListResult<MockAuditLog> {
  let rows = auditLogs.all();

  rows = rows.filter((log) => matchesFilter(log.severity, options.status));
  rows = rows.filter((log) =>
    matchesFilter(log.action, options.filters?.action),
  );
  rows = searchRows(rows, options.q, (log) => [
    log.action,
    log.actorName,
    log.merchantName,
    log.target,
    log.id,
  ]);
  rows = sortRows(rows, options.sort ?? "createdAt", options.order ?? "desc");

  return paginate(rows, options);
}

/** The platform's health snapshot. */
export function mockFetchSystemHealth(): MockSystemHealth {
  return MOCK_SYSTEM_HEALTH;
}

/** The feature flags. */
export function mockFetchFeatureFlags(
  options: MockListOptions = {},
): MockListResult<MockFeatureFlag> {
  let rows = featureFlags.all();

  rows = rows.filter((flag) =>
    matchesFilter(String(flag.enabled), options.filters?.enabled),
  );
  rows = searchRows(rows, options.q, (flag) => [
    flag.name,
    flag.description,
    flag.audience,
    flag.id,
  ]);
  rows = sortRows(rows, options.sort ?? "name", options.order ?? "asc");

  return paginate(rows, options);
}

/** Turns a feature flag on or off. */
export function mockUpdateFeatureFlag(
  id: string,
  patch: Partial<MockFeatureFlag>,
): MockFeatureFlag | undefined {
  return featureFlags.update(id, patch);
}

/* -------------------------------------------------------------------------- */
/* Admin console                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Lists the notifications the platform has sent to merchants.
 *
 * The admin console watches the outbound side. The backend has no
 * notification service, so every record here is sample data.
 */
export function mockFetchPlatformNotifications(
  options: MockListOptions = {},
): MockListResult<MockPlatformNotification> {
  let rows = platformNotifications.all();

  rows = rows.filter((row) => matchesFilter(row.status, options.status));
  rows = rows.filter((row) =>
    matchesFilter(row.channel, options.filters?.channel),
  );
  rows = searchRows(rows, options.q, (row) => [
    row.title,
    row.detail,
    row.audience,
    row.id,
  ]);
  rows = sortRows(rows, options.sort ?? "sentAt", options.order ?? "desc");

  return paginate(rows, options);
}

/**
 * Queues a platform notification.
 *
 * Nothing is sent. The record is written to the list so an administrator can
 * see what the announcement would look like.
 */
export function mockSendPlatformNotification(input: {
  title: string;
  detail: string;
  channel: NotificationChannel;
  audience: string;
  recipients: number;
}): MockPlatformNotification {
  return platformNotifications.insert({
    id: nextId("pnt", platformNotifications.all()),
    title: input.title,
    detail: input.detail,
    channel: input.channel,
    audience: input.audience,
    status: "QUEUED",
    sentAt: null,
    recipients: 0,
  });
}

/**
 * Lists the signed-in administrator sessions.
 *
 * The backend stores sessions, but there is no endpoint that lists them across
 * the platform, so these are sample records.
 */
export function mockFetchAdminSessions(
  options: MockListOptions = {},
): MockListResult<MockAdminSession> {
  let rows = adminSessions.all();

  rows = rows.filter((row) => matchesFilter(row.staffId, options.filters?.staffId));
  rows = searchRows(rows, options.q, (row) => [
    row.staffName,
    row.device,
    row.ipAddress,
    row.id,
  ]);
  rows = sortRows(rows, options.sort ?? "lastActiveAt", options.order ?? "desc");

  return paginate(rows, options);
}

/**
 * Ends an administrator session.
 *
 * The record is removed from the list. The backend is not told, because it has
 * no endpoint for this.
 */
export function mockRevokeAdminSession(id: string): boolean {
  return adminSessions.remove(id);
}

/**
 * Invites a member of staff.
 *
 * The record is added to the list with the status "invited". No invitation
 * email is sent — there is no mail service behind this.
 */
export function mockInviteAdminStaff(input: {
  name: string;
  email: string;
  role: MockAdminStaff["role"];
}): MockAdminStaff {
  return adminStaff.insert({
    id: nextId("stf", adminStaff.all()),
    name: input.name,
    email: input.email,
    role: input.role,
    status: "INVITED",
    lastLoginAt: null,
    createdAt: mockTime(0),
  });
}

/**
 * Changes a staff member's role, or suspends them.
 */
export function mockUpdateAdminStaff(
  id: string,
  patch: Partial<MockAdminStaff>,
): MockAdminStaff | undefined {
  return adminStaff.update(id, patch);
}

/**
 * Removes a staff member from the platform staff list.
 */
export function mockRemoveAdminStaff(id: string): boolean {
  return adminStaff.remove(id);
}

/* -------------------------------------------------------------------------- */
/* Checkout                                                                    */
/* -------------------------------------------------------------------------- */

/** One checkout session by id. */
export function mockFetchCheckout(id: string): MockCheckout | undefined {
  return MOCK_CHECKOUTS.find((checkout) => checkout.id === id);
}

/**
 * Applies a customer's submitted TrxID to a checkout.
 *
 * The result is deliberately conservative: the demo moves the checkout to
 * "awaiting verification" rather than to "paid", because a submitted TrxID
 * is a claim, not a confirmation.
 */
export function mockSubmitCheckoutTrxId(
  id: string,
  trxId: string,
): { status: "AWAITING_VERIFICATION" | "EXPIRED"; trxId: string } | undefined {
  const checkout = mockFetchCheckout(id);
  if (!checkout) return undefined;

  if (checkout.status === "EXPIRED") return { status: "EXPIRED", trxId };

  return { status: "AWAITING_VERIFICATION", trxId };
}

/* -------------------------------------------------------------------------- */
/* Checkout configuration                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The merchant's checkout configuration.
 *
 * A copy is returned so a caller cannot mutate the stored draft by accident;
 * `mockUpdateCheckoutConfig` is the only way to change it.
 */
export function mockFetchCheckoutConfig(): MockCheckoutConfig {
  return { ...MOCK_CHECKOUT_CONFIG, methodOrder: [...MOCK_CHECKOUT_CONFIG.methodOrder] };
}

/**
 * Saves the checkout configuration.
 *
 * A demo action — the draft is kept in this browser session only.
 */
export function mockUpdateCheckoutConfig(
  patch: Partial<MockCheckoutConfig>,
): MockCheckoutConfig {
  Object.assign(MOCK_CHECKOUT_CONFIG, {
    ...patch,
    methodOrder: patch.methodOrder
      ? [...patch.methodOrder]
      : [...MOCK_CHECKOUT_CONFIG.methodOrder],
    instructions: patch.instructions
      ? [...patch.instructions]
      : [...MOCK_CHECKOUT_CONFIG.instructions],
    updatedAt: mockTime(0),
  });

  return mockFetchCheckoutConfig();
}

/* -------------------------------------------------------------------------- */
/* Reports                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The window a report covers.
 *
 * The bounds are inclusive ISO timestamps. `undefined` means "no bound on
 * this side", which is how the report page says "everything".
 */
export interface ReportWindow {
  from?: string;
  to?: string;
}

/**
 * The payments a report covers.
 *
 * Only the merchant's own payments, and only those inside the window. The
 * window is applied here rather than in the page so every report on the page
 * counts exactly the same set of records.
 */
export function mockReportPayments(window: ReportWindow = {}): MockPayment[] {
  return payments.all().filter((payment) => {
    if (payment.merchantId !== MOCK_MERCHANT_ID) return false;
    const time = new Date(payment.createdAt).getTime();
    if (window.from && time < new Date(window.from).getTime()) return false;
    if (window.to && time > new Date(window.to).getTime()) return false;
    return true;
  });
}

/**
 * The headline numbers of a report.
 *
 * `confirmedRevenue` counts only payments whose status is CONFIRMED — a
 * notification was recorded. `pendingRevenue` counts the ones still waiting
 * for a decision, so the reader can see how much of the money is not yet
 * settled. The two are never added together into a single "revenue" figure
 * without saying which is which.
 */
export function mockReportSummary(window: ReportWindow = {}): {
  confirmedRevenue: number;
  pendingRevenue: number;
  refunded: number;
  transactionCount: number;
  confirmedCount: number;
  pendingCount: number;
  failedCount: number;
  successRate: number;
  failureRate: number;
  averageAmount: number;
} {
  const rows = mockReportPayments(window);

  let confirmedRevenue = 0;
  let pendingRevenue = 0;
  let refunded = 0;
  let confirmedCount = 0;
  let pendingCount = 0;
  let failedCount = 0;

  for (const payment of rows) {
    if (payment.status === "CONFIRMED") {
      confirmedRevenue += payment.amount;
      confirmedCount += 1;
    } else if (
      payment.status === "PENDING" ||
      payment.status === "REVIEW" ||
      payment.status === "CREATED"
    ) {
      pendingRevenue += payment.amount;
      pendingCount += 1;
    } else if (payment.status === "FAILED") {
      failedCount += 1;
    } else if (payment.status === "REFUNDED") {
      refunded += payment.amount;
    }
  }

  const decided = confirmedCount + failedCount;

  return {
    confirmedRevenue,
    pendingRevenue,
    refunded,
    transactionCount: rows.length,
    confirmedCount,
    pendingCount,
    failedCount,
    successRate: decided > 0 ? (confirmedCount / decided) * 100 : 0,
    failureRate: decided > 0 ? (failedCount / decided) * 100 : 0,
    averageAmount:
      confirmedCount > 0 ? confirmedRevenue / confirmedCount : 0,
  };
}

/**
 * Revenue and volume per day, for the report charts.
 *
 * The series is the fixed dataset in `data.ts`, windowed by date. Days with
 * no data are not invented — the series is simply shorter.
 */
export function mockReportSeries(window: ReportWindow = {}): {
  label: string;
  date: string;
  revenue: number;
  transactions: number;
}[] {
  return MOCK_REVENUE_BY_DAY.filter((point) => {
    if (window.from && point.date < window.from.slice(0, 10)) return false;
    if (window.to && point.date > window.to.slice(0, 10)) return false;
    return true;
  });
}

/**
 * The method split for a report window.
 *
 * Amount and count per provider, taken from the merchant's own payments so
 * the share adds up to the totals shown above.
 */
export function mockReportMethods(
  window: ReportWindow = {},
): { method: PaymentProvider; amount: number; count: number }[] {
  const rows = mockReportPayments(window).filter(
    (payment) => payment.status === "CONFIRMED",
  );

  const byMethod = new Map<
    PaymentProvider,
    { method: PaymentProvider; amount: number; count: number }
  >();

  for (const payment of rows) {
    const entry = byMethod.get(payment.provider) ?? {
      method: payment.provider,
      amount: 0,
      count: 0,
    };
    entry.amount += payment.amount;
    entry.count += 1;
    byMethod.set(payment.provider, entry);
  }

  return [...byMethod.values()].sort((a, b) => b.amount - a.amount);
}

/**
 * The account breakdown for a report window.
 *
 * Account numbers are masked in the dataset, so they stay masked here.
 */
export function mockReportAccounts(
  window: ReportWindow = {},
): {
  accountId: string;
  label: string;
  accountNumber: string;
  provider: PaymentProvider;
  amount: number;
  count: number;
}[] {
  const rows = mockReportPayments(window).filter(
    (payment) => payment.status === "CONFIRMED",
  );

  const byAccount = new Map<
    string,
    {
      accountId: string;
      label: string;
      accountNumber: string;
      provider: PaymentProvider;
      amount: number;
      count: number;
    }
  >();

  for (const payment of rows) {
    const account = accounts.get(payment.accountId);
    const entry = byAccount.get(payment.accountId) ?? {
      accountId: payment.accountId,
      label: payment.accountLabel,
      accountNumber: account?.accountNumber ?? "•••••••",
      provider: payment.provider,
      amount: 0,
      count: 0,
    };
    entry.amount += payment.amount;
    entry.count += 1;
    byAccount.set(payment.accountId, entry);
  }

  return [...byAccount.values()].sort((a, b) => b.amount - a.amount);
}

/**
 * The fee breakdown.
 *
 * The fee rates are demonstration figures — the backend has no fee model, and
 * the provider's real rates are not published in the API.
 */
export function mockReportFees(): {
  label: string;
  transactions: number;
  gross: number;
  fee: number;
  net: number;
  rate: number;
}[] {
  return MOCK_FEE_REPORT.map((row) => ({
    ...row,
    rate: row.gross > 0 ? (row.fee / row.gross) * 100 : 0,
  }));
}

/**
 * The reconciliation periods.
 *
 * "Recorded" is what ZevaPay logged from notifications. "Settled" is what
 * the provider statement says. The difference between them is the point of
 * the report — it is not an error, it is money that has not been confirmed
 * on the provider's side yet.
 */
export function mockReportReconciliation(): {
  id: string;
  period: string;
  opening: number;
  recorded: number;
  settled: number;
  difference: number;
  status: "BALANCED" | "DIFFERENCE";
  note: string;
}[] {
  return MOCK_RECONCILIATION;
}

/**
 * Flattens a report into CSV rows.
 *
 * The header and the row order match what the page shows, so the file and
 * the screen agree.
 */
export function mockExportReportCsv(
  window: ReportWindow = {},
): { header: string[]; rows: string[][] } {
  const rows = mockReportPayments(window).map((payment) => [
    payment.reference,
    payment.createdAt,
    payment.provider,
    payment.accountLabel,
    payment.accountId,
    String(payment.amount),
    payment.status,
    payment.customerName ?? "",
    payment.providerRef ?? "",
  ]);

  return {
    header: [
      "Reference",
      "Date",
      "Provider",
      "Account",
      "Account ID",
      "Amount (BDT)",
      "Status",
      "Customer",
      "Provider reference",
    ],
    rows,
  };
}

/* -------------------------------------------------------------------------- */
/* Status helpers                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Counts payments by product status.
 *
 * The counts add up to the number of payments the merchant has, which is
 * what the overview charts need.
 */
export function mockCountPaymentsByStatus(
  options: { merchantId?: string } = {},
): Record<PaymentStatus, number> {
  const counts = {
    CREATED: 0,
    PENDING: 0,
    REVIEW: 0,
    CONFIRMED: 0,
    FAILED: 0,
    EXPIRED: 0,
    CANCELLED: 0,
    REFUNDED: 0,
  } as Record<PaymentStatus, number>;

  for (const payment of payments.all()) {
    if (
      options.merchantId &&
      options.merchantId !== "*" &&
      payment.merchantId !== options.merchantId
    ) {
      continue;
    }
    counts[payment.status] += 1;
  }

  return counts;
}

/**
 * The backend status of a payment.
 *
 * Mock-only statuses have no backend counterpart, so they come back `null`.
 */
export function mockPaymentBackendStatus(id: string) {
  const payment = payments.get(id);
  if (!payment) return null;
  return toBackendStatus(payment.status);
}

/* -------------------------------------------------------------------------- */
/* Re-exported vocabulary                                                       */
/* -------------------------------------------------------------------------- */

export {
  MOCK_ACCOUNTS,
  MOCK_API_KEYS,
  MOCK_API_LOGS,
  MOCK_AUDIT_LOGS,
  MOCK_BILLING_HISTORY,
  MOCK_BRANDS,
  MOCK_CHECKOUTS,
  MOCK_CHECKOUT_CONFIG,
  MOCK_CUSTOMERS,
  MOCK_CUSTOM_ROLES,
  MOCK_DEVICES,
  MOCK_FEATURE_FLAGS,
  MOCK_FEE_REPORT,
  MOCK_INVOICES,
  MOCK_MERCHANTS,
  MOCK_NOTIFICATION_SETTINGS,
  MOCK_PAYMENTS,
  MOCK_PAYMENT_LINKS,
  MOCK_PERMISSIONS,
  MOCK_PLANS,
  MOCK_ROLE_PERMISSIONS,
  MOCK_SANDBOX_TRANSACTIONS,
  MOCK_SUBSCRIPTION,
  MOCK_SYSTEM_HEALTH,
  MOCK_TEAM,
  MOCK_TRANSACTIONS,
  MOCK_WEBHOOK_DELIVERIES,
  MOCK_WEBHOOKS,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_EVENTS,
  WEBHOOK_EVENTS,
};

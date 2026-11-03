import type { PaymentProvider } from "@/types/api";
import type { PaymentStatus } from "./status";

/**
 * The mock dataset.
 *
 * Every record here is fixed. Nothing is generated at random or derived from
 * the current time, so the charts, totals and tables are identical on every
 * render and on every machine.
 *
 * `REFERENCE_NOW` in `@/lib/format` is the "current" instant the whole app
 * measures against. Timestamps below sit relative to it.
 */

/** The instant the mock dataset is anchored to. */
export const MOCK_NOW = Date.parse("2026-11-02T18:00:00.000Z");

/** Builds an ISO timestamp relative to the mock anchor. */
export function mockTime(
  daysAgo: number,
  hours = 0,
  minutes = 0,
): string {
  return new Date(
    MOCK_NOW - daysAgo * 86_400_000 - hours * 3_600_000 - minutes * 60_000,
  ).toISOString();
}

/* -------------------------------------------------------------------------- */
/* Merchants                                                                   */
/* -------------------------------------------------------------------------- */

export type MockMerchantStatus =
  | "ACTIVE"
  | "PENDING_REVIEW"
  | "SUSPENDED";

export interface MockMerchant {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  country: string;
  plan: string;
  status: MockMerchantStatus;
  registrationDate: string;
  lastActiveAt: string;
  /** Trading / business category. */
  category: string;
  website: string;
  /** Total amount recorded across all of the merchant's transactions. */
  totalVolume: number;
  transactionCount: number;
  /** Internal note visible only in the admin console. */
  internalNote: string;
  /** Verification checklist state. */
  verification: {
    email: boolean;
    phone: boolean;
    businessDocument: boolean;
    bankAccount: boolean;
  };
}

export const MOCK_MERCHANTS: MockMerchant[] = [
  {
    id: "mer_001",
    businessName: "Dhanmondi Electronics",
    ownerName: "Rakibul Hasan",
    email: "owner@dhanmondi.test",
    phone: "01712345678",
    country: "Bangladesh",
    plan: "GROWTH",
    status: "ACTIVE",
    registrationDate: mockTime(214),
    lastActiveAt: mockTime(0, 1, 12),
    category: "Consumer electronics",
    website: "https://dhanmondi-electronics.test",
    totalVolume: 4_182_500,
    transactionCount: 1284,
    internalNote: "Long-standing account. Prefers email over phone support.",
    verification: {
      email: true,
      phone: true,
      businessDocument: true,
      bankAccount: true,
    },
  },
  {
    id: "mer_002",
    businessName: "Chattogram Fashion Hub",
    ownerName: "Sumaiya Akter",
    email: "sumaiya@chattogramfashion.test",
    phone: "01822334455",
    country: "Bangladesh",
    plan: "STARTER",
    status: "ACTIVE",
    registrationDate: mockTime(148),
    lastActiveAt: mockTime(0, 4, 40),
    category: "Fashion retail",
    website: "https://chattogramfashion.test",
    totalVolume: 1_264_900,
    transactionCount: 617,
    internalNote: "",
    verification: {
      email: true,
      phone: true,
      businessDocument: true,
      bankAccount: false,
    },
  },
  {
    id: "mer_003",
    businessName: "Sylhet Tea Traders",
    ownerName: "Abdul Karim",
    email: "karim@teatraders.test",
    phone: "01933445566",
    country: "Bangladesh",
    plan: "BUSINESS",
    status: "ACTIVE",
    registrationDate: mockTime(402),
    lastActiveAt: mockTime(1, 6, 5),
    category: "Wholesale and export",
    website: "https://teatraders.test",
    totalVolume: 9_845_000,
    transactionCount: 3102,
    internalNote: "High volume. Asked for priority webhook delivery.",
    verification: {
      email: true,
      phone: true,
      businessDocument: true,
      bankAccount: true,
    },
  },
  {
    id: "mer_004",
    businessName: "Rajshahi Crafts",
    ownerName: "Nusrat Jahan",
    email: "nusrat@rajshahicrafts.test",
    phone: "01644556677",
    country: "Bangladesh",
    plan: "FREE",
    status: "PENDING_REVIEW",
    registrationDate: mockTime(6),
    lastActiveAt: mockTime(2),
    category: "Handicrafts",
    website: "",
    totalVolume: 0,
    transactionCount: 0,
    internalNote: "Business document uploaded but not yet verified.",
    verification: {
      email: true,
      phone: true,
      businessDocument: false,
      bankAccount: false,
    },
  },
  {
    id: "mer_005",
    businessName: "Khulna Motors",
    ownerName: "Tanvir Ahmed",
    email: "tanvir@khnlamotors.test",
    phone: "01555667788",
    country: "Bangladesh",
    plan: "GROWTH",
    status: "SUSPENDED",
    registrationDate: mockTime(96),
    lastActiveAt: mockTime(21),
    category: "Vehicle dealership",
    website: "https://khnlamotors.test",
    totalVolume: 3_120_400,
    transactionCount: 402,
    internalNote: "Suspended after repeated chargeback disputes. Under review.",
    verification: {
      email: true,
      phone: true,
      businessDocument: true,
      bankAccount: true,
    },
  },
  {
    id: "mer_006",
    businessName: "Barishal Software Labs",
    ownerName: "Mehedi Hasan",
    email: "mehedi@bsllabs.test",
    phone: "01766778899",
    country: "Bangladesh",
    plan: "ENTERPRISE",
    status: "ACTIVE",
    registrationDate: mockTime(512),
    lastActiveAt: mockTime(0, 0, 30),
    category: "SaaS and developer tools",
    website: "https://bsllabs.test",
    totalVolume: 21_486_200,
    transactionCount: 8451,
    internalNote: "Integration partner. Uses the API heavily.",
    verification: {
      email: true,
      phone: true,
      businessDocument: true,
      bankAccount: true,
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Payment accounts                                                            */
/* -------------------------------------------------------------------------- */

export type MockAccountType = "PERSONAL" | "MERCHANT" | "AGENT" | "BUSINESS";
export type MockAccountStatus = "ACTIVE" | "PENDING" | "SUSPENDED";

export interface MockPaymentAccount {
  id: string;
  merchantId: string;
  provider: PaymentProvider;
  /** Always masked. The full number is never part of the dataset. */
  accountNumber: string;
  accountType: MockAccountType;
  label: string;
  status: MockAccountStatus;
  enabled: boolean;
  /** Higher priority accounts are offered to customers first. */
  priority: number;
  deviceId: string | null;
  createdAt: string;
  lastActivityAt: string;
  /** Per-transaction ceiling in BDT. Demo field. */
  dailyLimit: number;
  /** Health score out of 100. Demo field. */
  health: number;
  totalReceived: number;
  transactionCount: number;
}

export const MOCK_ACCOUNTS: MockPaymentAccount[] = [
  {
    id: "acc_001",
    merchantId: "mer_001",
    provider: "BKASH",
    accountNumber: "•••••••5678",
    accountType: "MERCHANT",
    label: "Main counter bKash",
    status: "ACTIVE",
    enabled: true,
    priority: 1,
    deviceId: "dev_001",
    createdAt: mockTime(210),
    lastActivityAt: mockTime(0, 0, 22),
    dailyLimit: 200_000,
    health: 96,
    totalReceived: 2_418_000,
    transactionCount: 742,
  },
  {
    id: "acc_002",
    merchantId: "mer_001",
    provider: "NAGAD",
    accountNumber: "•••••••3456",
    accountType: "PERSONAL",
    label: "Shop floor Nagad",
    status: "ACTIVE",
    enabled: true,
    priority: 2,
    deviceId: "dev_001",
    createdAt: mockTime(188),
    lastActivityAt: mockTime(0, 3, 5),
    dailyLimit: 100_000,
    health: 88,
    totalReceived: 1_204_500,
    transactionCount: 388,
  },
  {
    id: "acc_003",
    merchantId: "mer_001",
    provider: "ROCKET",
    accountNumber: "•••••••9012",
    accountType: "AGENT",
    label: "Delivery Rocket",
    status: "ACTIVE",
    enabled: true,
    priority: 3,
    deviceId: "dev_002",
    createdAt: mockTime(96),
    lastActivityAt: mockTime(1, 2, 18),
    dailyLimit: 60_000,
    health: 74,
    totalReceived: 412_000,
    transactionCount: 109,
  },
  {
    id: "acc_004",
    merchantId: "mer_001",
    provider: "UPAY",
    accountNumber: "•••••••7890",
    accountType: "BUSINESS",
    label: "Corporate Upay",
    status: "PENDING",
    enabled: false,
    priority: 4,
    deviceId: null,
    createdAt: mockTime(4),
    lastActivityAt: mockTime(4),
    dailyLimit: 150_000,
    health: 40,
    totalReceived: 0,
    transactionCount: 0,
  },
  {
    id: "acc_005",
    merchantId: "mer_003",
    provider: "BKASH",
    accountNumber: "•••••••2244",
    accountType: "MERCHANT",
    label: "Export bKash",
    status: "ACTIVE",
    enabled: true,
    priority: 1,
    deviceId: "dev_003",
    createdAt: mockTime(400),
    lastActivityAt: mockTime(0, 0, 45),
    dailyLimit: 500_000,
    health: 92,
    totalReceived: 6_240_000,
    transactionCount: 2104,
  },
  {
    id: "acc_006",
    merchantId: "mer_003",
    provider: "NAGAD",
    accountNumber: "•••••••6677",
    accountType: "BUSINESS",
    label: "Trade Nagad",
    status: "ACTIVE",
    enabled: true,
    priority: 2,
    deviceId: "dev_003",
    createdAt: mockTime(380),
    lastActivityAt: mockTime(1, 5, 30),
    dailyLimit: 300_000,
    health: 81,
    totalReceived: 3_605_000,
    transactionCount: 998,
  },
];

/* -------------------------------------------------------------------------- */
/* Devices                                                                     */
/* -------------------------------------------------------------------------- */

export type MockDeviceStatus = "ONLINE" | "OFFLINE" | "PENDING";

export interface MockDevice {
  id: string;
  merchantId: string;
  name: string;
  deviceId: string;
  status: MockDeviceStatus;
  lastActiveAt: string;
  connectedAt: string;
  connectedAccountIds: string[];
  androidVersion: string;
  appVersion: string;
  /** Android model, as reported by the device app. */
  model: string;
  /** Health score out of 100. Demo field. */
  health: number;
  /** Number of notifications received in the last 24 hours. */
  notificationsToday: number;
  parserErrors: number;
  duplicateEvents: number;
  /** Connection history, most recent first. */
  connectionHistory: { at: string; event: string }[];
}

export const MOCK_DEVICES: MockDevice[] = [
  {
    id: "dev_001",
    merchantId: "mer_001",
    name: "Counter tablet",
    deviceId: "ZP-A1B2-C3D4-E5F6",
    status: "ONLINE",
    lastActiveAt: mockTime(0, 0, 1),
    connectedAt: mockTime(208),
    connectedAccountIds: ["acc_001", "acc_002"],
    androidVersion: "Android 14",
    appVersion: "2.4.1",
    model: "Samsung Galaxy Tab A9",
    health: 97,
    notificationsToday: 63,
    parserErrors: 0,
    duplicateEvents: 2,
    connectionHistory: [
      { at: mockTime(0, 0, 1), event: "Heartbeat received" },
      { at: mockTime(0, 2, 14), event: "Notification forwarded" },
      { at: mockTime(1, 0, 30), event: "Reconnected" },
      { at: mockTime(1, 4, 2), event: "Heartbeat received" },
    ],
  },
  {
    id: "dev_002",
    merchantId: "mer_001",
    name: "Delivery phone",
    deviceId: "ZP-F6E5-D4C3-B2A1-0099",
    status: "OFFLINE",
    lastActiveAt: mockTime(1, 8, 12),
    connectedAt: mockTime(94),
    connectedAccountIds: ["acc_003"],
    androidVersion: "Android 12",
    appVersion: "2.3.8",
    model: "Xiaomi Redmi Note 11",
    health: 62,
    notificationsToday: 0,
    parserErrors: 4,
    duplicateEvents: 11,
    connectionHistory: [
      { at: mockTime(1, 8, 12), event: "Last heartbeat received" },
      { at: mockTime(2, 1, 0), event: "Connection lost" },
      { at: mockTime(3, 6, 40), event: "Connection lost" },
    ],
  },
  {
    id: "dev_003",
    merchantId: "mer_003",
    name: "Warehouse phone",
    deviceId: "ZP-1122-3344-5566-7788",
    status: "ONLINE",
    lastActiveAt: mockTime(0, 0, 12),
    connectedAt: mockTime(398),
    connectedAccountIds: ["acc_005", "acc_006"],
    androidVersion: "Android 13",
    appVersion: "2.4.1",
    model: "Realme 10 Pro",
    health: 91,
    notificationsToday: 118,
    parserErrors: 1,
    duplicateEvents: 5,
    connectionHistory: [
      { at: mockTime(0, 0, 12), event: "Heartbeat received" },
      { at: mockTime(0, 1, 5), event: "Notification forwarded" },
      { at: mockTime(0, 3, 44), event: "Notification forwarded" },
    ],
  },
  {
    id: "dev_004",
    merchantId: "mer_002",
    name: "Front desk phone",
    deviceId: "ZP-9988-7766-5544-3322",
    status: "PENDING",
    lastActiveAt: mockTime(0, 2, 0),
    connectedAt: mockTime(0, 2, 0),
    connectedAccountIds: [],
    androidVersion: "Android 14",
    appVersion: "2.4.1",
    model: "Google Pixel 8a",
    health: 55,
    notificationsToday: 0,
    parserErrors: 0,
    duplicateEvents: 0,
    connectionHistory: [{ at: mockTime(0, 2, 0), event: "Pairing requested" }],
  },
];

/* -------------------------------------------------------------------------- */
/* Customers                                                                   */
/* -------------------------------------------------------------------------- */

export interface MockCustomer {
  id: string;
  merchantId: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  paymentCount: number;
  lastPaymentAt: string | null;
  firstPaymentAt: string | null;
  tags: string[];
  notes: string;
  /** Most-used provider, derived from the dataset. */
  favouriteProvider: PaymentProvider | null;
}

export const MOCK_CUSTOMERS: MockCustomer[] = [
  {
    id: "cus_001",
    merchantId: "mer_001",
    name: "Imran Chowdhury",
    email: "imran@example.test",
    phone: "01711223344",
    totalSpent: 184_500,
    paymentCount: 34,
    lastPaymentAt: mockTime(0, 0, 22),
    firstPaymentAt: mockTime(198),
    tags: ["repeat", "wholesale"],
    notes: "Regular buyer. Prefers bKash.",
    favouriteProvider: "BKASH",
  },
  {
    id: "cus_002",
    merchantId: "mer_001",
    name: "Farhana Islam",
    email: "farhana@example.test",
    phone: "01822334455",
    totalSpent: 62_400,
    paymentCount: 12,
    lastPaymentAt: mockTime(1, 3, 5),
    firstPaymentAt: mockTime(120),
    tags: ["repeat"],
    notes: "",
    favouriteProvider: "NAGAD",
  },
  {
    id: "cus_003",
    merchantId: "mer_001",
    name: "Tanvir Ahmed",
    email: "tanvir@example.test",
    phone: "01555667788",
    totalSpent: 27_900,
    paymentCount: 5,
    lastPaymentAt: mockTime(4, 1, 15),
    firstPaymentAt: mockTime(72),
    tags: ["first-time"],
    notes: "Asked about instalment options.",
    favouriteProvider: "ROCKET",
  },
  {
    id: "cus_004",
    merchantId: "mer_001",
    name: "Sadia Rahman",
    email: "sadia@example.test",
    phone: "01966778899",
    totalSpent: 9_450,
    paymentCount: 2,
    lastPaymentAt: mockTime(11, 2, 0),
    firstPaymentAt: mockTime(30),
    tags: ["new"],
    notes: "",
    favouriteProvider: "BKASH",
  },
  {
    id: "cus_005",
    merchantId: "mer_001",
    name: "Rifat Hossain",
    email: "rifat@example.test",
    phone: "01477889900",
    totalSpent: 4_200,
    paymentCount: 1,
    lastPaymentAt: mockTime(23),
    firstPaymentAt: mockTime(23),
    tags: ["new"],
    notes: "",
    favouriteProvider: "BKASH",
  },
  {
    id: "cus_006",
    merchantId: "mer_001",
    name: "Nusrat Jahan",
    email: "nusrat@example.test",
    phone: "01688990011",
    totalSpent: 71_300,
    paymentCount: 18,
    lastPaymentAt: mockTime(6, 4, 25),
    firstPaymentAt: mockTime(160),
    tags: ["repeat", "vip"],
    notes: "VIP customer. Handle phone calls directly.",
    favouriteProvider: "NAGAD",
  },
  {
    id: "cus_007",
    merchantId: "mer_001",
    name: "Masud Rana",
    email: "masud@example.test",
    phone: "01399001122",
    totalSpent: 2_850,
    paymentCount: 1,
    lastPaymentAt: mockTime(41),
    firstPaymentAt: mockTime(41),
    tags: ["new"],
    notes: "",
    favouriteProvider: "UPAY",
  },
  {
    id: "cus_008",
    merchantId: "mer_002",
    name: "Sabina Yasmin",
    email: "sabina@example.test",
    phone: "01733445566",
    totalSpent: 48_700,
    paymentCount: 22,
    lastPaymentAt: mockTime(0, 4, 40),
    firstPaymentAt: mockTime(140),
    tags: ["repeat"],
    notes: "",
    favouriteProvider: "BKASH",
  },
];

/* -------------------------------------------------------------------------- */
/* Payments and transactions                                                   */
/* -------------------------------------------------------------------------- */

export interface MockPayment {
  id: string;
  merchantId: string;
  /** Human-facing payment reference, e.g. PAY-8K2M4Q. */
  reference: string;
  provider: PaymentProvider;
  accountId: string;
  accountLabel: string;
  amount: number;
  currency: "BDT";
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  status: PaymentStatus;
  /** Provider-side transaction id, when the customer supplied one. */
  providerRef: string | null;
  createdAt: string;
  updatedAt: string;
  /** Link the payment came from, when it came from a payment link. */
  paymentLinkId: string | null;
  orderReference: string | null;
  notes: { id: string; body: string; author: string; createdAt: string }[];
  timeline: { at: string; label: string; detail: string }[];
  /** The raw notification text the parser read. Demo field. */
  rawNotification: string;
  /** Parser confidence, 0..1. Never treated as proof of payment. */
  confidence: number;
}

export const MOCK_PAYMENTS: MockPayment[] = [
  {
    id: "pay_1001",
    merchantId: "mer_001",
    reference: "PAY-8K2M4Q",
    provider: "BKASH",
    accountId: "acc_001",
    accountLabel: "Main counter bKash",
    amount: 2450,
    currency: "BDT",
    customerId: "cus_001",
    customerName: "Imran Chowdhury",
    customerPhone: "01711223344",
    status: "CONFIRMED",
    providerRef: "9F2KQ1L8M3",
    createdAt: mockTime(0, 0, 22),
    updatedAt: mockTime(0, 0, 20),
    paymentLinkId: null,
    orderReference: "ORD-4417",
    notes: [
      {
        id: "note_001",
        body: "Customer called to confirm the amount before paying.",
        author: "Rakibul Hasan",
        createdAt: mockTime(0, 1, 10),
      },
    ],
    timeline: [
      {
        at: mockTime(0, 0, 22),
        label: "Payment created",
        detail: "Checkout link opened.",
      },
      {
        at: mockTime(0, 0, 20),
        label: "Notification recorded",
        detail: "A matching provider notification was received.",
      },
      {
        at: mockTime(0, 0, 19),
        label: "Confirmed from SMS",
        detail: "Confirmed from a recorded notification. Not a provider settlement check.",
      },
    ],
    rawNotification:
      "You have received 2,450 BDT from Imran Chowdhury. TrxID 9F2KQ1L8M3.",
    confidence: 0.97,
  },
  {
    id: "pay_1002",
    merchantId: "mer_001",
    reference: "PAY-7T4B9N",
    provider: "NAGAD",
    accountId: "acc_002",
    accountLabel: "Shop floor Nagad",
    amount: 890,
    currency: "BDT",
    customerId: "cus_002",
    customerName: "Farhana Islam",
    customerPhone: "01822334455",
    status: "PENDING",
    providerRef: "N7X2QK9P",
    createdAt: mockTime(0, 3, 5),
    updatedAt: mockTime(0, 3, 5),
    paymentLinkId: "lnk_002",
    orderReference: "ORD-4418",
    notes: [],
    timeline: [
      {
        at: mockTime(0, 3, 5),
        label: "Payment created",
        detail: "Customer submitted a TrxID for checking.",
      },
    ],
    rawNotification: "Awaiting a matching provider notification.",
    confidence: 0.42,
  },
  {
    id: "pay_1003",
    merchantId: "mer_001",
    reference: "PAY-3M8W5R",
    provider: "BKASH",
    accountId: "acc_001",
    accountLabel: "Main counter bKash",
    amount: 12_750,
    currency: "BDT",
    customerId: "cus_006",
    customerName: "Nusrat Jahan",
    customerPhone: "01688990011",
    status: "REVIEW",
    providerRef: "K4D8P2L7Q",
    createdAt: mockTime(0, 5, 48),
    updatedAt: mockTime(0, 5, 48),
    paymentLinkId: null,
    orderReference: "ORD-4416",
    notes: [],
    timeline: [
      {
        at: mockTime(0, 5, 48),
        label: "Payment created",
        detail: "Amount is above the automatic acceptance threshold.",
      },
    ],
    rawNotification:
      "You have received 12,750 BDT from Nusrat Jahan. TrxID K4D8P2L7Q.",
    confidence: 0.58,
  },
  {
    id: "pay_1004",
    merchantId: "mer_001",
    reference: "PAY-6P1H3J",
    provider: "ROCKET",
    accountId: "acc_003",
    accountLabel: "Delivery Rocket",
    amount: 560,
    currency: "BDT",
    customerId: "cus_003",
    customerName: "Tanvir Ahmed",
    customerPhone: "01555667788",
    status: "FAILED",
    providerRef: null,
    createdAt: mockTime(1, 2, 18),
    updatedAt: mockTime(1, 2, 18),
    paymentLinkId: "lnk_003",
    orderReference: "ORD-4409",
    notes: [],
    timeline: [
      {
        at: mockTime(1, 2, 18),
        label: "Payment created",
        detail: "Checkout link opened.",
      },
      {
        at: mockTime(1, 2, 19),
        label: "Verification failed",
        detail: "The submitted TrxID did not match any recorded notification.",
      },
    ],
    rawNotification: "No matching notification was found for the submitted TrxID.",
    confidence: 0.11,
  },
  {
    id: "pay_1005",
    merchantId: "mer_001",
    reference: "PAY-9R5Y2C",
    provider: "BKASH",
    accountId: "acc_001",
    accountLabel: "Main counter bKash",
    amount: 18_400,
    currency: "BDT",
    customerId: "cus_001",
    customerName: "Imran Chowdhury",
    customerPhone: "01711223344",
    status: "CONFIRMED",
    providerRef: "M3Q7L9X2K",
    createdAt: mockTime(1, 1, 30),
    updatedAt: mockTime(1, 1, 28),
    paymentLinkId: null,
    orderReference: "ORD-4398",
    notes: [],
    timeline: [
      {
        at: mockTime(1, 1, 30),
        label: "Payment created",
        detail: "Checkout link opened.",
      },
      {
        at: mockTime(1, 1, 28),
        label: "Confirmed from SMS",
        detail: "Confirmed from a recorded notification. Not a provider settlement check.",
      },
    ],
    rawNotification:
      "You have received 18,400 BDT from Imran Chowdhury. TrxID M3Q7L9X2K.",
    confidence: 0.95,
  },
  {
    id: "pay_1006",
    merchantId: "mer_001",
    reference: "PAY-2L8D6F",
    provider: "NAGAD",
    accountId: "acc_002",
    accountLabel: "Shop floor Nagad",
    amount: 3_200,
    currency: "BDT",
    customerId: "cus_002",
    customerName: "Farhana Islam",
    customerPhone: "01822334455",
    status: "CONFIRMED",
    providerRef: "Q8H2N5T7W",
    createdAt: mockTime(2, 4, 12),
    updatedAt: mockTime(2, 4, 10),
    paymentLinkId: "lnk_001",
    orderReference: "ORD-4380",
    notes: [],
    timeline: [
      {
        at: mockTime(2, 4, 12),
        label: "Payment created",
        detail: "Customer opened a payment link.",
      },
      {
        at: mockTime(2, 4, 10),
        label: "Confirmed from SMS",
        detail: "Confirmed from a recorded notification. Not a provider settlement check.",
      },
    ],
    rawNotification:
      "You have received 3,200 BDT from Farhana Islam. TrxID Q8H2N5T7W.",
    confidence: 0.93,
  },
  {
    id: "pay_1007",
    merchantId: "mer_001",
    reference: "PAY-5X3K9T",
    provider: "BKASH",
    accountId: "acc_001",
    accountLabel: "Main counter bKash",
    amount: 1_250,
    currency: "BDT",
    customerId: "cus_004",
    customerName: "Sadia Rahman",
    customerPhone: "01966778899",
    status: "EXPIRED",
    providerRef: null,
    createdAt: mockTime(3, 6, 0),
    updatedAt: mockTime(3, 8, 0),
    paymentLinkId: "lnk_004",
    orderReference: "ORD-4361",
    notes: [],
    timeline: [
      {
        at: mockTime(3, 6, 0),
        label: "Payment created",
        detail: "Checkout link opened.",
      },
      {
        at: mockTime(3, 8, 0),
        label: "Expired",
        detail: "The link expired before a payment was submitted.",
      },
    ],
    rawNotification: "The payment link expired before it was paid.",
    confidence: 0,
  },
  {
    id: "pay_1008",
    merchantId: "mer_001",
    reference: "PAY-4N7V2S",
    provider: "UPAY",
    accountId: "acc_004",
    accountLabel: "Corporate Upay",
    amount: 44_000,
    currency: "BDT",
    customerId: "cus_001",
    customerName: "Imran Chowdhury",
    customerPhone: "01711223344",
    status: "CANCELLED",
    providerRef: null,
    createdAt: mockTime(4, 2, 30),
    updatedAt: mockTime(4, 3, 5),
    paymentLinkId: null,
    orderReference: "ORD-4340",
    notes: [],
    timeline: [
      {
        at: mockTime(4, 2, 30),
        label: "Payment created",
        detail: "Created from the dashboard.",
      },
      {
        at: mockTime(4, 3, 5),
        label: "Cancelled",
        detail: "Cancelled by the merchant.",
      },
    ],
    rawNotification: "Cancelled before a payment was submitted.",
    confidence: 0,
  },
  {
    id: "pay_1009",
    merchantId: "mer_001",
    reference: "PAY-8J1Q6W",
    provider: "BKASH",
    accountId: "acc_001",
    accountLabel: "Main counter bKash",
    amount: 7_800,
    currency: "BDT",
    customerId: "cus_006",
    customerName: "Nusrat Jahan",
    customerPhone: "01688990011",
    status: "CONFIRMED",
    providerRef: "R5W9P3K7M",
    createdAt: mockTime(5, 2, 45),
    updatedAt: mockTime(5, 2, 43),
    paymentLinkId: null,
    orderReference: "ORD-4322",
    notes: [],
    timeline: [
      {
        at: mockTime(5, 2, 45),
        label: "Payment created",
        detail: "Checkout link opened.",
      },
      {
        at: mockTime(5, 2, 43),
        label: "Confirmed from SMS",
        detail: "Confirmed from a recorded notification. Not a provider settlement check.",
      },
    ],
    rawNotification:
      "You have received 7,800 BDT from Nusrat Jahan. TrxID R5W9P3K7M.",
    confidence: 0.99,
  },
  {
    id: "pay_1010",
    merchantId: "mer_001",
    reference: "PAY-1C6Y8B",
    provider: "NAGAD",
    accountId: "acc_002",
    accountLabel: "Shop floor Nagad",
    amount: 950,
    currency: "BDT",
    customerId: "cus_003",
    customerName: "Tanvir Ahmed",
    customerPhone: "01555667788",
    status: "REFUNDED",
    providerRef: "T2M4B6N8K",
    createdAt: mockTime(7, 1, 20),
    updatedAt: mockTime(8, 3, 10),
    paymentLinkId: null,
    orderReference: "ORD-4288",
    notes: [],
    timeline: [
      {
        at: mockTime(7, 1, 20),
        label: "Payment created",
        detail: "Checkout link opened.",
      },
      {
        at: mockTime(7, 1, 18),
        label: "Confirmed from SMS",
        detail: "Confirmed from a recorded notification. Not a provider settlement check.",
      },
      {
        at: mockTime(8, 3, 10),
        label: "Refunded",
        detail: "A refund was requested for this payment.",
      },
    ],
    rawNotification:
      "You have received 950 BDT from Tanvir Ahmed. TrxID T2M4B6N8K.",
    confidence: 0.91,
  },
  {
    id: "pay_1011",
    merchantId: "mer_001",
    reference: "PAY-3B7T5Z",
    provider: "BKASH",
    accountId: "acc_001",
    accountLabel: "Main counter bKash",
    amount: 22_600,
    currency: "BDT",
    customerId: "cus_001",
    customerName: "Imran Chowdhury",
    customerPhone: "01711223344",
    status: "PENDING",
    providerRef: "V6H2L9C4P",
    createdAt: mockTime(0, 1, 40),
    updatedAt: mockTime(0, 1, 40),
    paymentLinkId: null,
    orderReference: "ORD-4420",
    notes: [],
    timeline: [
      {
        at: mockTime(0, 1, 40),
        label: "Payment created",
        detail: "Waiting for the matching notification.",
      },
    ],
    rawNotification: "Awaiting a matching provider notification.",
    confidence: 0.38,
  },
  {
    id: "pay_1012",
    merchantId: "mer_001",
    reference: "PAY-6D2R9K",
    provider: "ROCKET",
    accountId: "acc_003",
    accountLabel: "Delivery Rocket",
    amount: 5_400,
    currency: "BDT",
    customerId: "cus_005",
    customerName: "Rifat Hossain",
    customerPhone: "01477889900",
    status: "CREATED",
    providerRef: null,
    createdAt: mockTime(0, 2, 5),
    updatedAt: mockTime(0, 2, 5),
    paymentLinkId: "lnk_005",
    orderReference: "ORD-4421",
    notes: [],
    timeline: [
      {
        at: mockTime(0, 2, 5),
        label: "Payment created",
        detail: "Checkout link opened. No TrxID submitted yet.",
      },
    ],
    rawNotification: "No notification received yet.",
    confidence: 0,
  },
];

/** A transaction is the recording of a notification against an account. */
export interface MockTransaction {
  id: string;
  reference: string;
  paymentId: string | null;
  merchantId: string;
  provider: PaymentProvider;
  accountId: string;
  accountLabel: string;
  amount: number;
  customerName: string | null;
  customerPhone: string | null;
  status: PaymentStatus;
  /** Provider-side transaction id parsed out of the notification. */
  providerRef: string | null;
  deviceId: string | null;
  deviceName: string | null;
  rawNotification: string;
  confidence: number;
  occurredAt: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByName: string | null;
}

export const MOCK_TRANSACTIONS: MockTransaction[] = [
  {
    id: "txn_5001",
    reference: "TXN-100245",
    paymentId: "pay_1001",
    merchantId: "mer_001",
    provider: "BKASH",
    accountId: "acc_001",
    accountLabel: "Main counter bKash",
    amount: 2450,
    customerName: "Imran Chowdhury",
    customerPhone: "01711223344",
    status: "CONFIRMED",
    providerRef: "9F2KQ1L8M3",
    deviceId: "dev_001",
    deviceName: "Counter tablet",
    rawNotification:
      "You have received 2,450 BDT from Imran Chowdhury. TrxID 9F2KQ1L8M3.",
    confidence: 0.97,
    occurredAt: mockTime(0, 0, 20),
    createdAt: mockTime(0, 0, 20),
    reviewedAt: null,
    reviewedByName: null,
  },
  {
    id: "txn_5002",
    reference: "TXN-100244",
    paymentId: "pay_1002",
    merchantId: "mer_001",
    provider: "NAGAD",
    accountId: "acc_002",
    accountLabel: "Shop floor Nagad",
    amount: 890,
    customerName: "Farhana Islam",
    customerPhone: "01822334455",
    status: "PENDING",
    providerRef: "N7X2QK9P",
    deviceId: "dev_001",
    deviceName: "Counter tablet",
    rawNotification:
      "You have received 890 BDT from Farhana Islam. TrxID N7X2QK9P.",
    confidence: 0.42,
    occurredAt: mockTime(0, 3, 5),
    createdAt: mockTime(0, 3, 5),
    reviewedAt: null,
    reviewedByName: null,
  },
  {
    id: "txn_5003",
    reference: "TXN-100243",
    paymentId: "pay_1003",
    merchantId: "mer_001",
    provider: "BKASH",
    accountId: "acc_001",
    accountLabel: "Main counter bKash",
    amount: 12_750,
    customerName: "Nusrat Jahan",
    customerPhone: "01688990011",
    status: "REVIEW",
    providerRef: "K4D8P2L7Q",
    deviceId: "dev_001",
    deviceName: "Counter tablet",
    rawNotification:
      "You have received 12,750 BDT from Nusrat Jahan. TrxID K4D8P2L7Q.",
    confidence: 0.58,
    occurredAt: mockTime(0, 5, 48),
    createdAt: mockTime(0, 5, 48),
    reviewedAt: null,
    reviewedByName: null,
  },
  {
    id: "txn_5004",
    reference: "TXN-100242",
    paymentId: "pay_1004",
    merchantId: "mer_001",
    provider: "ROCKET",
    accountId: "acc_003",
    accountLabel: "Delivery Rocket",
    amount: 560,
    customerName: "Tanvir Ahmed",
    customerPhone: "01555667788",
    status: "FAILED",
    providerRef: null,
    deviceId: "dev_002",
    deviceName: "Delivery phone",
    rawNotification: "No matching notification was found for the submitted TrxID.",
    confidence: 0.11,
    occurredAt: mockTime(1, 2, 18),
    createdAt: mockTime(1, 2, 18),
    reviewedAt: mockTime(1, 3, 0),
    reviewedByName: "Rakibul Hasan",
  },
  {
    id: "txn_5005",
    reference: "TXN-100241",
    paymentId: "pay_1005",
    merchantId: "mer_001",
    provider: "BKASH",
    accountId: "acc_001",
    accountLabel: "Main counter bKash",
    amount: 18_400,
    customerName: "Imran Chowdhury",
    customerPhone: "01711223344",
    status: "CONFIRMED",
    providerRef: "M3Q7L9X2K",
    deviceId: "dev_001",
    deviceName: "Counter tablet",
    rawNotification:
      "You have received 18,400 BDT from Imran Chowdhury. TrxID M3Q7L9X2K.",
    confidence: 0.95,
    occurredAt: mockTime(1, 1, 28),
    createdAt: mockTime(1, 1, 28),
    reviewedAt: null,
    reviewedByName: null,
  },
  {
    id: "txn_5006",
    reference: "TXN-100240",
    paymentId: "pay_1006",
    merchantId: "mer_001",
    provider: "NAGAD",
    accountId: "acc_002",
    accountLabel: "Shop floor Nagad",
    amount: 3_200,
    customerName: "Farhana Islam",
    customerPhone: "01822334455",
    status: "CONFIRMED",
    providerRef: "Q8H2N5T7W",
    deviceId: "dev_001",
    deviceName: "Counter tablet",
    rawNotification:
      "You have received 3,200 BDT from Farhana Islam. TrxID Q8H2N5T7W.",
    confidence: 0.93,
    occurredAt: mockTime(2, 4, 10),
    createdAt: mockTime(2, 4, 10),
    reviewedAt: null,
    reviewedByName: null,
  },
  {
    id: "txn_5007",
    reference: "TXN-100239",
    paymentId: "pay_1007",
    merchantId: "mer_001",
    provider: "BKASH",
    accountId: "acc_001",
    accountLabel: "Main counter bKash",
    amount: 1_250,
    customerName: "Sadia Rahman",
    customerPhone: "01966778899",
    status: "EXPIRED",
    providerRef: null,
    deviceId: "dev_001",
    deviceName: "Counter tablet",
    rawNotification: "The payment link expired before it was paid.",
    confidence: 0,
    occurredAt: mockTime(3, 6, 0),
    createdAt: mockTime(3, 6, 0),
    reviewedAt: null,
    reviewedByName: null,
  },
  {
    id: "txn_5008",
    reference: "TXN-100238",
    paymentId: "pay_1008",
    merchantId: "mer_001",
    provider: "UPAY",
    accountId: "acc_004",
    accountLabel: "Corporate Upay",
    amount: 44_000,
    customerName: "Imran Chowdhury",
    customerPhone: "01711223344",
    status: "CANCELLED",
    providerRef: null,
    deviceId: null,
    deviceName: null,
    rawNotification: "Cancelled before a payment was submitted.",
    confidence: 0,
    occurredAt: mockTime(4, 2, 30),
    createdAt: mockTime(4, 2, 30),
    reviewedAt: null,
    reviewedByName: null,
  },
  {
    id: "txn_5009",
    reference: "TXN-100237",
    paymentId: "pay_1009",
    merchantId: "mer_001",
    provider: "BKASH",
    accountId: "acc_001",
    accountLabel: "Main counter bKash",
    amount: 7_800,
    customerName: "Nusrat Jahan",
    customerPhone: "01688990011",
    status: "CONFIRMED",
    providerRef: "R5W9P3K7M",
    deviceId: "dev_001",
    deviceName: "Counter tablet",
    rawNotification:
      "You have received 7,800 BDT from Nusrat Jahan. TrxID R5W9P3K7M.",
    confidence: 0.99,
    occurredAt: mockTime(5, 2, 43),
    createdAt: mockTime(5, 2, 43),
    reviewedAt: null,
    reviewedByName: null,
  },
  {
    id: "txn_5010",
    reference: "TXN-100236",
    paymentId: "pay_1010",
    merchantId: "mer_001",
    provider: "NAGAD",
    accountId: "acc_002",
    accountLabel: "Shop floor Nagad",
    amount: 950,
    customerName: "Tanvir Ahmed",
    customerPhone: "01555667788",
    status: "REFUNDED",
    providerRef: "T2M4B6N8K",
    deviceId: "dev_001",
    deviceName: "Counter tablet",
    rawNotification:
      "You have received 950 BDT from Tanvir Ahmed. TrxID T2M4B6N8K.",
    confidence: 0.91,
    occurredAt: mockTime(7, 1, 18),
    createdAt: mockTime(7, 1, 18),
    reviewedAt: mockTime(8, 3, 10),
    reviewedByName: "Rakibul Hasan",
  },
  {
    id: "txn_5011",
    reference: "TXN-100235",
    paymentId: "pay_1011",
    merchantId: "mer_001",
    provider: "BKASH",
    accountId: "acc_001",
    accountLabel: "Main counter bKash",
    amount: 22_600,
    customerName: "Imran Chowdhury",
    customerPhone: "01711223344",
    status: "PENDING",
    providerRef: "V6H2L9C4P",
    deviceId: "dev_001",
    deviceName: "Counter tablet",
    rawNotification:
      "You have received 22,600 BDT from Imran Chowdhury. TrxID V6H2L9C4P.",
    confidence: 0.38,
    occurredAt: mockTime(0, 1, 40),
    createdAt: mockTime(0, 1, 40),
    reviewedAt: null,
    reviewedByName: null,
  },
  {
    id: "txn_5012",
    reference: "TXN-100234",
    paymentId: null,
    merchantId: "mer_003",
    provider: "BKASH",
    accountId: "acc_005",
    accountLabel: "Export bKash",
    amount: 84_500,
    customerName: "Imran Chowdhury",
    customerPhone: "01711223344",
    status: "CONFIRMED",
    providerRef: "J8M2Q6X9L",
    deviceId: "dev_003",
    deviceName: "Warehouse phone",
    rawNotification:
      "You have received 84,500 BDT from Imran Chowdhury. TrxID J8M2Q6X9L.",
    confidence: 0.96,
    occurredAt: mockTime(0, 0, 45),
    createdAt: mockTime(0, 0, 45),
    reviewedAt: null,
    reviewedByName: null,
  },
  {
    id: "txn_5013",
    reference: "TXN-100233",
    paymentId: null,
    merchantId: "mer_003",
    provider: "NAGAD",
    accountId: "acc_006",
    accountLabel: "Trade Nagad",
    amount: 12_900,
    customerName: "Farhana Islam",
    customerPhone: "01822334455",
    status: "REVIEW",
    providerRef: "C4N8W1K7D",
    deviceId: "dev_003",
    deviceName: "Warehouse phone",
    rawNotification:
      "You have received 12,900 BDT from Farhana Islam. TrxID C4N8W1K7D.",
    confidence: 0.61,
    occurredAt: mockTime(1, 5, 30),
    createdAt: mockTime(1, 5, 30),
    reviewedAt: null,
    reviewedByName: null,
  },
  {
    id: "txn_5014",
    reference: "TXN-100232",
    paymentId: null,
    merchantId: "mer_002",
    provider: "BKASH",
    accountId: "acc_001",
    accountLabel: "Main counter bKash",
    amount: 1_950,
    customerName: "Sabina Yasmin",
    customerPhone: "01733445566",
    status: "CONFIRMED",
    providerRef: "B7Y3L5P9T",
    deviceId: "dev_001",
    deviceName: "Counter tablet",
    rawNotification:
      "You have received 1,950 BDT from Sabina Yasmin. TrxID B7Y3L5P9T.",
    confidence: 0.94,
    occurredAt: mockTime(0, 4, 40),
    createdAt: mockTime(0, 4, 40),
    reviewedAt: null,
    reviewedByName: null,
  },
];

/* -------------------------------------------------------------------------- */
/* Invoices                                                                    */
/* -------------------------------------------------------------------------- */

export type MockInvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface MockInvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface MockInvoice {
  id: string;
  merchantId: string;
  number: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: MockInvoiceStatus;
  items: MockInvoiceLine[];
  taxRate: number;
  discount: number;
  currency: "BDT";
  dueDate: string;
  createdAt: string;
  issuedAt: string | null;
  paidAt: string | null;
  notes: string;
  /** How many times a reminder has been sent. Demo field. */
  remindersSent: number;
}

export const MOCK_INVOICES: MockInvoice[] = [
  {
    id: "inv_001",
    merchantId: "mer_001",
    number: "INV-2026-0041",
    customerId: "cus_001",
    customerName: "Imran Chowdhury",
    customerEmail: "imran@example.test",
    customerPhone: "01711223344",
    status: "SENT",
    items: [
      { id: "li_1", description: "Wireless keyboard", quantity: 2, unitPrice: 1_800 },
      { id: "li_2", description: "USB-C hub", quantity: 2, unitPrice: 950 },
    ],
    taxRate: 0,
    discount: 0,
    currency: "BDT",
    dueDate: mockTime(-7),
    createdAt: mockTime(3),
    issuedAt: mockTime(3),
    paidAt: null,
    notes: "Delivered to the Dhanmondi branch.",
    remindersSent: 1,
  },
  {
    id: "inv_002",
    merchantId: "mer_001",
    number: "INV-2026-0040",
    customerId: "cus_006",
    customerName: "Nusrat Jahan",
    customerEmail: "nusrat@example.test",
    customerPhone: "01688990011",
    status: "OVERDUE",
    items: [
      { id: "li_3", description: "Laptop stand", quantity: 4, unitPrice: 1_250 },
      { id: "li_4", description: "Delivery service", quantity: 1, unitPrice: 200 },
    ],
    taxRate: 0,
    discount: 500,
    currency: "BDT",
    dueDate: mockTime(-14),
    createdAt: mockTime(24),
    issuedAt: mockTime(22),
    paidAt: null,
    notes: "",
    remindersSent: 2,
  },
  {
    id: "inv_003",
    merchantId: "mer_001",
    number: "INV-2026-0039",
    customerId: "cus_002",
    customerName: "Farhana Islam",
    customerEmail: "farhana@example.test",
    customerPhone: "01822334455",
    status: "PAID",
    items: [
      { id: "li_5", description: "HDMI cable", quantity: 3, unitPrice: 420 },
    ],
    taxRate: 0,
    discount: 0,
    currency: "BDT",
    dueDate: mockTime(-5),
    createdAt: mockTime(12),
    issuedAt: mockTime(11),
    paidAt: mockTime(6),
    notes: "",
    remindersSent: 0,
  },
  {
    id: "inv_004",
    merchantId: "mer_001",
    number: "INV-2026-0038",
    customerId: "cus_003",
    customerName: "Tanvir Ahmed",
    customerEmail: "tanvir@example.test",
    customerPhone: "01555667788",
    status: "DRAFT",
    items: [
      { id: "li_6", description: "Mouse", quantity: 1, unitPrice: 780 },
      { id: "li_7", description: "Mousepad", quantity: 1, unitPrice: 320 },
    ],
    taxRate: 0,
    discount: 0,
    currency: "BDT",
    dueDate: mockTime(-21),
    createdAt: mockTime(1),
    issuedAt: null,
    paidAt: null,
    notes: "Draft — waiting on the customer's address.",
    remindersSent: 0,
  },
  {
    id: "inv_005",
    merchantId: "mer_001",
    number: "INV-2026-0037",
    customerId: "cus_004",
    customerName: "Sadia Rahman",
    customerEmail: "sadia@example.test",
    customerPhone: "01966778899",
    status: "CANCELLED",
    items: [
      { id: "li_8", description: "Power bank", quantity: 1, unitPrice: 2_400 },
    ],
    taxRate: 0,
    discount: 0,
    currency: "BDT",
    dueDate: mockTime(-10),
    createdAt: mockTime(18),
    issuedAt: mockTime(17),
    paidAt: null,
    notes: "Customer cancelled the order.",
    remindersSent: 0,
  },
  {
    id: "inv_006",
    merchantId: "mer_001",
    number: "INV-2026-0036",
    customerId: "cus_005",
    customerName: "Rifat Hossain",
    customerEmail: "rifat@example.test",
    customerPhone: "01477889900",
    status: "SENT",
    items: [
      { id: "li_9", description: "USB-C cable", quantity: 2, unitPrice: 350 },
    ],
    taxRate: 0,
    discount: 0,
    currency: "BDT",
    dueDate: mockTime(-3),
    createdAt: mockTime(5),
    issuedAt: mockTime(5),
    paidAt: null,
    notes: "",
    remindersSent: 0,
  },
];

/* -------------------------------------------------------------------------- */
/* Payment links                                                               */
/* -------------------------------------------------------------------------- */

export interface MockPaymentLink {
  id: string;
  merchantId: string;
  /** Short code used in the public URL. */
  code: string;
  title: string;
  description: string;
  amount: number | null;
  /** Whether the customer chooses the amount. */
  flexible: boolean;
  status: "ACTIVE" | "DISABLED" | "EXPIRED";
  provider: PaymentProvider | "ANY";
  customerFields: { name: string; type: "text" | "email" | "phone"; required: boolean }[];
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  redirectUrl: string | null;
  createdAt: string;
  /** Revenue attributed to this link. */
  revenue: number;
}

export const MOCK_PAYMENT_LINKS: MockPaymentLink[] = [
  {
    id: "lnk_001",
    merchantId: "mer_001",
    code: "8K2M4Q",
    title: "Order #4417 — Wireless keyboard",
    description: "Two wireless keyboards and two USB-C hubs.",
    amount: 5500,
    flexible: false,
    status: "ACTIVE",
    provider: "ANY",
    customerFields: [
      { name: "Full name", type: "text", required: true },
      { name: "Phone number", type: "phone", required: true },
    ],
    usageLimit: 20,
    usageCount: 6,
    expiresAt: mockTime(-25),
    redirectUrl: "https://dhanmondi-electronics.test/order/4417",
    createdAt: mockTime(20),
    revenue: 33_000,
  },
  {
    id: "lnk_002",
    merchantId: "mer_001",
    code: "3X7P9K",
    title: "Delivery charge",
    description: "Pay the delivery charge for an existing order.",
    amount: 890,
    flexible: false,
    status: "ACTIVE",
    provider: "NAGAD",
    customerFields: [{ name: "Phone number", type: "phone", required: true }],
    usageLimit: null,
    usageCount: 14,
    expiresAt: null,
    redirectUrl: null,
    createdAt: mockTime(64),
    revenue: 12_460,
  },
  {
    id: "lnk_003",
    merchantId: "mer_001",
    code: "5N2W8T",
    title: "Warranty replacement",
    description: "Replacement charge for a warranty case.",
    amount: 560,
    flexible: false,
    status: "ACTIVE",
    provider: "ROCKET",
    customerFields: [
      { name: "Full name", type: "text", required: true },
      { name: "Phone number", type: "phone", required: true },
    ],
    usageLimit: null,
    usageCount: 3,
    expiresAt: null,
    redirectUrl: null,
    createdAt: mockTime(96),
    revenue: 1_680,
  },
  {
    id: "lnk_004",
    merchantId: "mer_001",
    code: "9V4Y6H",
    title: "Flash sale — 20% off",
    description: "Open-ended link for the November flash sale.",
    amount: null,
    flexible: true,
    status: "EXPIRED",
    provider: "ANY",
    customerFields: [{ name: "Phone number", type: "phone", required: false }],
    usageLimit: 100,
    usageCount: 100,
    expiresAt: mockTime(3, 8),
    redirectUrl: null,
    createdAt: mockTime(18),
    revenue: 124_500,
  },
  {
    id: "lnk_005",
    merchantId: "mer_001",
    code: "2J8D5L",
    title: "Custom amount",
    description: "Let the customer pay any amount.",
    amount: null,
    flexible: true,
    status: "ACTIVE",
    provider: "ANY",
    customerFields: [
      { name: "Full name", type: "text", required: true },
      { name: "Phone number", type: "phone", required: true },
    ],
    usageLimit: null,
    usageCount: 2,
    expiresAt: null,
    redirectUrl: null,
    createdAt: mockTime(9),
    revenue: 6_000,
  },
  {
    id: "lnk_006",
    merchantId: "mer_001",
    code: "7R3C1Q",
    title: "Wholesale deposit",
    description: "Deposit for a wholesale order.",
    amount: 25_000,
    flexible: false,
    status: "DISABLED",
    provider: "BKASH",
    customerFields: [
      { name: "Business name", type: "text", required: true },
      { name: "Phone number", type: "phone", required: true },
    ],
    usageLimit: 5,
    usageCount: 1,
    expiresAt: mockTime(-30),
    redirectUrl: null,
    createdAt: mockTime(52),
    revenue: 25_000,
  },
];

/* -------------------------------------------------------------------------- */
/* Brands                                                                      */
/* -------------------------------------------------------------------------- */

export interface MockBrand {
  id: string;
  merchantId: string;
  name: string;
  websiteUrl: string;
  /** Hex colour used for the checkout accent. */
  color: string;
  /** Logo uploaded through the brand form. Demo value. */
  logoText: string;
  logoColor: string;
  contactEmail: string;
  contactPhone: string;
  accountIds: string[];
  checkoutTheme: "LIGHT" | "DARK" | "SYSTEM";
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  /** Attributed revenue, in BDT. */
  revenue: number;
  transactionCount: number;
  webhookUrl: string | null;
  apiKeyName: string | null;
}

export const MOCK_BRANDS: MockBrand[] = [
  {
    id: "brd_001",
    merchantId: "mer_001",
    name: "Dhanmondi Electronics",
    websiteUrl: "https://dhanmondi-electronics.test",
    color: "#223b67",
    logoText: "DE",
    logoColor: "#223b67",
    contactEmail: "support@dhanmondi-electronics.test",
    contactPhone: "01712345678",
    accountIds: ["acc_001", "acc_002", "acc_003"],
    checkoutTheme: "LIGHT",
    status: "ACTIVE",
    createdAt: mockTime(200),
    revenue: 3_412_600,
    transactionCount: 1146,
    webhookUrl: "https://dhanmondi-electronics.test/api/zevapay",
    apiKeyName: "Storefront production",
  },
  {
    id: "brd_002",
    merchantId: "mer_001",
    name: "TechPoint Accessories",
    websiteUrl: "https://techpoint-accessories.test",
    color: "#0f7bc4",
    logoText: "TP",
    logoColor: "#0f7bc4",
    contactEmail: "hello@techpoint-accessories.test",
    contactPhone: "01822334455",
    accountIds: ["acc_001"],
    checkoutTheme: "LIGHT",
    status: "ACTIVE",
    createdAt: mockTime(118),
    revenue: 769_900,
    transactionCount: 138,
    webhookUrl: null,
    apiKeyName: null,
  },
  {
    id: "brd_003",
    merchantId: "mer_001",
    name: "Imported Parts",
    websiteUrl: "",
    color: "#8a1538",
    logoText: "IP",
    logoColor: "#8a1538",
    contactEmail: "parts@importedparts.test",
    contactPhone: "",
    accountIds: [],
    checkoutTheme: "DARK",
    status: "INACTIVE",
    createdAt: mockTime(64),
    revenue: 0,
    transactionCount: 0,
    webhookUrl: null,
    apiKeyName: null,
  },
];

/* -------------------------------------------------------------------------- */
/* API keys, request logs                                                      */
/* -------------------------------------------------------------------------- */

export interface MockApiKey {
  id: string;
  merchantId: string;
  name: string;
  /** Masked. The full secret is shown once, at creation time, and never again. */
  keyPrefix: string;
  environment: "LIVE" | "TEST";
  scopes: string[];
  status: "ACTIVE" | "REVOKED";
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export const MOCK_API_KEYS: MockApiKey[] = [
  {
    id: "key_001",
    merchantId: "mer_001",
    name: "Storefront production",
    keyPrefix: "zp_live_••••••••7K2M",
    environment: "LIVE",
    scopes: ["payments:read", "payments:write", "webhooks:read"],
    status: "ACTIVE",
    lastUsedAt: mockTime(0, 0, 14),
    createdAt: mockTime(120),
    expiresAt: null,
  },
  {
    id: "key_002",
    merchantId: "mer_001",
    name: "Reporting script",
    keyPrefix: "zp_live_••••••••3Q9D",
    environment: "LIVE",
    scopes: ["payments:read", "reports:read"],
    status: "ACTIVE",
    lastUsedAt: mockTime(0, 2, 30),
    createdAt: mockTime(64),
    expiresAt: null,
  },
  {
    id: "key_003",
    merchantId: "mer_001",
    name: "Local development",
    keyPrefix: "zp_test_••••••••8W4N",
    environment: "TEST",
    scopes: ["payments:read", "payments:write"],
    status: "ACTIVE",
    lastUsedAt: mockTime(2, 4, 0),
    createdAt: mockTime(30),
    expiresAt: mockTime(-5),
  },
  {
    id: "key_004",
    merchantId: "mer_001",
    name: "Old integration",
    keyPrefix: "zp_live_••••••••1T6B",
    environment: "LIVE",
    scopes: ["payments:read"],
    status: "REVOKED",
    lastUsedAt: mockTime(41),
    createdAt: mockTime(180),
    expiresAt: null,
  },
];

export interface MockApiLog {
  id: string;
  merchantId: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  ipAddress: string;
  createdAt: string;
  requestId: string;
  errorCode: string | null;
}

export const MOCK_API_LOGS: MockApiLog[] = [
  {
    id: "log_001",
    merchantId: "mer_001",
    method: "POST",
    path: "/api/v1/payments",
    statusCode: 201,
    durationMs: 142,
    ipAddress: "103.14.12.8",
    createdAt: mockTime(0, 0, 14),
    requestId: "req_9F2KQ1L8M3",
    errorCode: null,
  },
  {
    id: "log_002",
    merchantId: "mer_001",
    method: "GET",
    path: "/api/v1/payments?status=PENDING",
    statusCode: 200,
    durationMs: 64,
    ipAddress: "103.14.12.8",
    createdAt: mockTime(0, 0, 22),
    requestId: "req_M3Q7L9X2K4",
    errorCode: null,
  },
  {
    id: "log_003",
    merchantId: "mer_001",
    method: "POST",
    path: "/api/v1/payments/pay_1004/verify",
    statusCode: 422,
    durationMs: 88,
    ipAddress: "103.14.12.8",
    createdAt: mockTime(1, 2, 18),
    requestId: "req_K4D8P2L7Q6",
    errorCode: "VERIFICATION_FAILED",
  },
  {
    id: "log_004",
    merchantId: "mer_001",
    method: "GET",
    path: "/api/v1/reports/revenue",
    statusCode: 200,
    durationMs: 412,
    ipAddress: "103.14.12.8",
    createdAt: mockTime(0, 2, 30),
    requestId: "req_V6H2L9C4P8",
    errorCode: null,
  },
  {
    id: "log_005",
    merchantId: "mer_001",
    method: "POST",
    path: "/api/v1/webhooks",
    statusCode: 201,
    durationMs: 97,
    ipAddress: "103.14.12.8",
    createdAt: mockTime(3, 1, 5),
    requestId: "req_T2M4B6N8K2",
    errorCode: null,
  },
  {
    id: "log_006",
    merchantId: "mer_001",
    method: "DELETE",
    path: "/api/v1/api-keys/key_004",
    statusCode: 200,
    durationMs: 51,
    ipAddress: "103.14.12.8",
    createdAt: mockTime(41),
    requestId: "req_B7Y3L5P9T1",
    errorCode: null,
  },
  {
    id: "log_007",
    merchantId: "mer_001",
    method: "POST",
    path: "/api/v1/payments",
    statusCode: 429,
    durationMs: 12,
    ipAddress: "103.14.12.8",
    createdAt: mockTime(1, 6, 40),
    requestId: "req_C4N8W1K7D5",
    errorCode: "RATE_LIMITED",
  },
  {
    id: "log_008",
    merchantId: "mer_002",
    method: "POST",
    path: "/api/v1/payments",
    statusCode: 201,
    durationMs: 118,
    ipAddress: "103.14.12.41",
    createdAt: mockTime(0, 1, 3),
    requestId: "req_N8P2L4M7K9",
    errorCode: null,
  },
  {
    id: "log_009",
    merchantId: "mer_002",
    method: "GET",
    path: "/api/v1/merchant/transactions",
    statusCode: 200,
    durationMs: 71,
    ipAddress: "103.14.12.41",
    createdAt: mockTime(0, 2, 11),
    requestId: "req_W3K6D9Q1T2",
    errorCode: null,
  },
  {
    id: "log_010",
    merchantId: "mer_003",
    method: "POST",
    path: "/api/v1/payments",
    statusCode: 201,
    durationMs: 163,
    ipAddress: "49.12.44.7",
    createdAt: mockTime(0, 0, 48),
    requestId: "req_B5H8J2L4N6",
    errorCode: null,
  },
  {
    id: "log_011",
    merchantId: "mer_003",
    method: "POST",
    path: "/api/v1/payments/pay_2210/verify",
    statusCode: 422,
    durationMs: 95,
    ipAddress: "49.12.44.7",
    createdAt: mockTime(1, 3, 22),
    requestId: "req_R7M1C4V8Z3",
    errorCode: "VERIFICATION_FAILED",
  },
  {
    id: "log_012",
    merchantId: "mer_006",
    method: "GET",
    path: "/api/v1/reports/revenue",
    statusCode: 200,
    durationMs: 388,
    ipAddress: "45.33.19.220",
    createdAt: mockTime(0, 3, 5),
    requestId: "req_Y9F2G6H8J1",
    errorCode: null,
  },
  {
    id: "log_013",
    merchantId: "mer_006",
    method: "POST",
    path: "/api/v1/webhooks",
    statusCode: 500,
    durationMs: 2_410,
    ipAddress: "45.33.19.220",
    createdAt: mockTime(2, 4, 12),
    requestId: "req_T3X7C5B9N2",
    errorCode: "INTERNAL_ERROR",
  },
];

/* -------------------------------------------------------------------------- */
/* Webhooks                                                                    */
/* -------------------------------------------------------------------------- */

export const WEBHOOK_EVENTS = [
  "payment.created",
  "payment.pending",
  "payment.confirmed",
  "payment.failed",
  "payment.expired",
  "payment.refunded",
  "invoice.created",
  "invoice.paid",
  "device.offline",
] as const;

export type MockWebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export interface MockWebhook {
  id: string;
  merchantId: string;
  url: string;
  description: string;
  events: MockWebhookEvent[];
  /** Masked. The full signing secret is shown once, at creation time. */
  secret: string;
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
  lastDeliveryAt: string | null;
  /** Success rate over the last 100 deliveries, as a percentage. */
  successRate: number;
}

export const MOCK_WEBHOOKS: MockWebhook[] = [
  {
    id: "wh_001",
    merchantId: "mer_001",
    url: "https://dhanmondi-electronics.test/api/zevapay",
    description: "Production order handler",
    events: ["payment.created", "payment.confirmed", "payment.failed"],
    secret: "whsec_••••••••••••••••••••3K2M",
    status: "ACTIVE",
    createdAt: mockTime(150),
    lastDeliveryAt: mockTime(0, 0, 18),
    successRate: 99.2,
  },
  {
    id: "wh_002",
    merchantId: "mer_001",
    url: "https://techpoint-accessories.test/hooks/pay",
    description: "Second storefront",
    events: ["payment.confirmed", "payment.refunded"],
    secret: "whsec_••••••••••••••••••••8Q4N",
    status: "ACTIVE",
    createdAt: mockTime(96),
    lastDeliveryAt: mockTime(0, 2, 12),
    successRate: 94.1,
  },
  {
    id: "wh_003",
    merchantId: "mer_001",
    url: "https://hooks.zapier.com/hooks/catch/0000/demo",
    description: "Spreadsheet automation",
    events: ["payment.confirmed", "invoice.paid"],
    secret: "whsec_••••••••••••••••••••1T6B",
    status: "DISABLED",
    createdAt: mockTime(72),
    lastDeliveryAt: mockTime(12),
    successRate: 71.4,
  },
  {
    id: "wh_004",
    merchantId: "mer_002",
    url: "https://chattogramfashion.test/webhooks/zevapay",
    description: "Order fulfilment",
    events: ["payment.created", "payment.confirmed"],
    secret: "whsec_••••••••••••••••••••7L2A",
    status: "ACTIVE",
    createdAt: mockTime(140),
    lastDeliveryAt: mockTime(0, 2, 40),
    successRate: 98.6,
  },
  {
    id: "wh_005",
    merchantId: "mer_003",
    url: "https://teatraders.test/hooks/payment",
    description: "Export ledgers",
    events: ["payment.confirmed", "payment.refunded"],
    secret: "whsec_••••••••••••••••••••4M9P",
    status: "ACTIVE",
    createdAt: mockTime(388),
    lastDeliveryAt: mockTime(0, 0, 26),
    successRate: 99.8,
  },
  {
    id: "wh_006",
    merchantId: "mer_006",
    url: "https://hooks.bsllabs.test/zevapay",
    description: "Developer sandbox sink",
    events: ["payment.created", "payment.pending", "payment.confirmed"],
    secret: "whsec_••••••••••••••••••••5X3R",
    status: "ACTIVE",
    createdAt: mockTime(500),
    lastDeliveryAt: mockTime(0, 1, 52),
    successRate: 87.3,
  },
];

export interface MockWebhookDelivery {
  id: string;
  webhookId: string;
  event: MockWebhookEvent;
  statusCode: number | null;
  status: "DELIVERED" | "FAILED" | "PENDING" | "RETRYING";
  durationMs: number;
  createdAt: string;
  requestBody: string;
  responseBody: string;
  attempt: number;
}

export const MOCK_WEBHOOK_DELIVERIES: MockWebhookDelivery[] = [
  {
    id: "dlv_001",
    webhookId: "wh_001",
    event: "payment.confirmed",
    statusCode: 200,
    status: "DELIVERED",
    durationMs: 142,
    createdAt: mockTime(0, 0, 18),
    requestBody:
      '{\n  "id": "pay_1001",\n  "event": "payment.confirmed",\n  "amount": 2450,\n  "currency": "BDT",\n  "provider": "BKASH"\n}',
    responseBody:
      '{\n  "received": true,\n  "orderId": "ORD-4417"\n}',
    attempt: 1,
  },
  {
    id: "dlv_002",
    webhookId: "wh_002",
    event: "payment.confirmed",
    statusCode: 200,
    status: "DELIVERED",
    durationMs: 238,
    createdAt: mockTime(0, 2, 12),
    requestBody:
      '{\n  "id": "pay_1005",\n  "event": "payment.confirmed",\n  "amount": 18400,\n  "currency": "BDT",\n  "provider": "BKASH"\n}',
    responseBody:
      '{\n  "ok": true\n}',
    attempt: 1,
  },
  {
    id: "dlv_003",
    webhookId: "wh_003",
    event: "payment.confirmed",
    statusCode: 503,
    status: "FAILED",
    durationMs: 3_004,
    createdAt: mockTime(1, 4, 0),
    requestBody:
      '{\n  "id": "pay_1006",\n  "event": "payment.confirmed",\n  "amount": 3200,\n  "currency": "BDT",\n  "provider": "NAGAD"\n}',
    responseBody: "<html><body>503 Service Unavailable</body></html>",
    attempt: 3,
  },
  {
    id: "dlv_004",
    webhookId: "wh_001",
    event: "payment.created",
    statusCode: 200,
    status: "DELIVERED",
    durationMs: 98,
    createdAt: mockTime(0, 5, 48),
    requestBody:
      '{\n  "id": "pay_1003",\n  "event": "payment.created",\n  "amount": 12750,\n  "currency": "BDT",\n  "provider": "BKASH"\n}',
    responseBody:
      '{\n  "received": true\n}',
    attempt: 1,
  },
  {
    id: "dlv_005",
    webhookId: "wh_001",
    event: "payment.failed",
    statusCode: null,
    status: "RETRYING",
    durationMs: 0,
    createdAt: mockTime(1, 2, 20),
    requestBody:
      '{\n  "id": "pay_1004",\n  "event": "payment.failed",\n  "amount": 560,\n  "currency": "BDT",\n  "provider": "ROCKET"\n}',
    responseBody: "",
    attempt: 2,
  },
  {
    id: "dlv_006",
    webhookId: "wh_002",
    event: "payment.refunded",
    statusCode: 200,
    status: "DELIVERED",
    durationMs: 301,
    createdAt: mockTime(8, 3, 12),
    requestBody:
      '{\n  "id": "pay_1010",\n  "event": "payment.refunded",\n  "amount": 950,\n  "currency": "BDT",\n  "provider": "NAGAD"\n}',
    responseBody:
      '{\n  "ok": true\n}',
    attempt: 1,
  },
  {
    id: "dlv_007",
    webhookId: "wh_004",
    event: "payment.confirmed",
    statusCode: 200,
    status: "DELIVERED",
    durationMs: 176,
    createdAt: mockTime(0, 2, 40),
    requestBody:
      '{\n  "id": "pay_2214",\n  "event": "payment.confirmed",\n  "amount": 3750,\n  "currency": "BDT",\n  "provider": "BKASH"\n}',
    responseBody:
      '{\n  "received": true\n}',
    attempt: 1,
  },
  {
    id: "dlv_008",
    webhookId: "wh_005",
    event: "payment.confirmed",
    statusCode: 200,
    status: "DELIVERED",
    durationMs: 129,
    createdAt: mockTime(0, 0, 26),
    requestBody:
      '{\n  "id": "pay_3318",\n  "event": "payment.confirmed",\n  "amount": 52400,\n  "currency": "BDT",\n  "provider": "NAGAD"\n}',
    responseBody:
      '{\n  "ok": true\n}',
    attempt: 1,
  },
  {
    id: "dlv_009",
    webhookId: "wh_006",
    event: "payment.created",
    statusCode: 429,
    status: "FAILED",
    durationMs: 88,
    createdAt: mockTime(0, 3, 44),
    requestBody:
      '{\n  "id": "pay_6620",\n  "event": "payment.created",\n  "amount": 18400,\n  "currency": "BDT",\n  "provider": "ROCKET"\n}',
    responseBody:
      '{\n  "error": "Too many requests"\n}',
    attempt: 4,
  },
  {
    id: "dlv_010",
    webhookId: "wh_002",
    event: "payment.pending",
    statusCode: null,
    status: "PENDING",
    durationMs: 0,
    createdAt: mockTime(0, 1, 52),
    requestBody:
      '{\n  "id": "pay_1012",\n  "event": "payment.pending",\n  "amount": 1450,\n  "currency": "BDT",\n  "provider": "NAGAD"\n}',
    responseBody: "",
    attempt: 1,
  },
];

/* -------------------------------------------------------------------------- */
/* Notifications                                                               */
/* -------------------------------------------------------------------------- */

export const NOTIFICATION_CHANNELS = [
  { id: "email", label: "Email", description: "Sent to your account address." },
  { id: "dashboard", label: "Dashboard", description: "Shown in the notification centre." },
  { id: "sms", label: "SMS", description: "Sent to your registered mobile number." },
  { id: "telegram", label: "Telegram", description: "Posted to a Telegram bot chat." },
  { id: "discord", label: "Discord", description: "Posted to a Discord channel webhook." },
  { id: "slack", label: "Slack", description: "Posted to a Slack channel webhook." },
  { id: "webhook", label: "Webhook", description: "Delivered to a configured endpoint." },
] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number]["id"];

/**
 * A channel a merchant has set up.
 *
 * "Enabled" means the merchant wants this channel used at all. The event grid
 * decides *which* events travel on it. `destination` is where the messages
 * would go — the address, chat or endpoint — and is null when the channel has
 * not been configured yet.
 */
export interface MockNotificationChannelConfig {
  channel: NotificationChannel;
  enabled: boolean;
  destination: string | null;
  /** Why the channel cannot be used yet, when that is the case. */
  note: string | null;
}

export const MOCK_NOTIFICATION_CHANNELS: MockNotificationChannelConfig[] = [
  {
    channel: "email",
    enabled: true,
    destination: "owner@dhanmondi.test",
    note: null,
  },
  {
    channel: "dashboard",
    enabled: true,
    destination: "In-app notification centre",
    note: null,
  },
  {
    channel: "sms",
    enabled: true,
    destination: "+880 17XX-XXXXXX",
    note: null,
  },
  {
    channel: "telegram",
    enabled: true,
    destination: "Dhanmondi Electronics bot chat",
    note: null,
  },
  {
    channel: "discord",
    enabled: false,
    destination: null,
    note: "No Discord webhook has been added yet.",
  },
  {
    channel: "slack",
    enabled: false,
    destination: null,
    note: "No Slack webhook has been added yet.",
  },
  {
    channel: "webhook",
    enabled: true,
    destination: "2 endpoints",
    note: null,
  },
];

export const NOTIFICATION_EVENTS = [
  { id: "payment.received", label: "Payment received" },
  { id: "payment.confirmed", label: "Payment confirmed" },
  { id: "payment.failed", label: "Payment failed" },
  { id: "refund.updated", label: "Refund updated" },
  { id: "device.offline", label: "Device offline" },
  { id: "webhook.failed", label: "Webhook failed" },
  { id: "api.error", label: "API error" },
  { id: "invoice.overdue", label: "Invoice overdue" },
  { id: "security.alert", label: "Security alert" },
] as const;

export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number]["id"];

export interface MockNotificationSetting {
  event: NotificationEvent;
  channels: Record<NotificationChannel, boolean>;
}

export const MOCK_NOTIFICATION_SETTINGS: MockNotificationSetting[] = [
  {
    event: "payment.received",
    channels: {
      email: false,
      dashboard: true,
      sms: false,
      telegram: true,
      discord: false,
      slack: false,
      webhook: true,
    },
  },
  {
    event: "payment.confirmed",
    channels: {
      email: true,
      dashboard: true,
      sms: false,
      telegram: true,
      discord: true,
      slack: false,
      webhook: true,
    },
  },
  {
    event: "payment.failed",
    channels: {
      email: true,
      dashboard: true,
      sms: true,
      telegram: false,
      discord: false,
      slack: false,
      webhook: true,
    },
  },
  {
    event: "refund.updated",
    channels: {
      email: true,
      dashboard: true,
      sms: false,
      telegram: false,
      discord: false,
      slack: false,
      webhook: true,
    },
  },
  {
    event: "device.offline",
    channels: {
      email: false,
      dashboard: true,
      sms: false,
      telegram: true,
      discord: false,
      slack: false,
      webhook: false,
    },
  },
  {
    event: "webhook.failed",
    channels: {
      email: true,
      dashboard: true,
      sms: false,
      telegram: false,
      discord: false,
      slack: false,
      webhook: false,
    },
  },
  {
    event: "api.error",
    channels: {
      email: false,
      dashboard: true,
      sms: false,
      telegram: false,
      discord: false,
      slack: false,
      webhook: false,
    },
  },
  {
    event: "invoice.overdue",
    channels: {
      email: true,
      dashboard: true,
      sms: false,
      telegram: false,
      discord: false,
      slack: false,
      webhook: false,
    },
  },
  {
    event: "security.alert",
    channels: {
      email: true,
      dashboard: true,
      sms: true,
      telegram: false,
      discord: false,
      slack: false,
      webhook: false,
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Team                                                                        */
/* -------------------------------------------------------------------------- */

export type MockRole = "OWNER" | "ADMIN" | "MANAGER" | "SUPPORT" | "VIEWER";

export interface MockPermission {
  key: string;
  label: string;
  group: string;
}

export const MOCK_PERMISSIONS: MockPermission[] = [
  { key: "payments.view", label: "View payments", group: "Payments" },
  { key: "payments.review", label: "Review and approve payments", group: "Payments" },
  { key: "payments.refund", label: "Request refunds", group: "Payments" },
  { key: "accounts.manage", label: "Manage payment accounts", group: "Payments" },
  { key: "links.manage", label: "Manage payment links", group: "Collection" },
  { key: "invoices.manage", label: "Manage invoices", group: "Collection" },
  { key: "customers.manage", label: "Manage customers", group: "Collection" },
  { key: "devices.manage", label: "Manage devices", group: "Automation" },
  { key: "webhooks.manage", label: "Manage webhooks", group: "Automation" },
  { key: "apikeys.manage", label: "Manage API keys", group: "Automation" },
  { key: "reports.view", label: "View reports", group: "Business" },
  { key: "billing.manage", label: "Manage billing", group: "Business" },
  { key: "team.manage", label: "Manage team", group: "Business" },
  { key: "settings.manage", label: "Change settings", group: "General" },
  { key: "security.manage", label: "Manage security", group: "General" },
];

/** Default role → permission mapping. */
export const MOCK_ROLE_PERMISSIONS: Record<MockRole, string[]> = {
  OWNER: MOCK_PERMISSIONS.map((permission) => permission.key),
  ADMIN: MOCK_PERMISSIONS.map((permission) => permission.key).filter(
    (key) => key !== "billing.manage",
  ),
  MANAGER: [
    "payments.view",
    "payments.review",
    "payments.refund",
    "links.manage",
    "invoices.manage",
    "customers.manage",
    "reports.view",
  ],
  SUPPORT: ["payments.view", "payments.review", "customers.manage", "devices.manage"],
  VIEWER: ["payments.view", "reports.view"],
};

export interface MockTeamMember {
  id: string;
  merchantId: string;
  name: string;
  email: string;
  role: MockRole;
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
  lastLoginAt: string | null;
  joinedAt: string;
  /** Activity history, most recent first. */
  activity: { at: string; action: string }[];
}

export const MOCK_TEAM: MockTeamMember[] = [
  {
    id: "mem_001",
    merchantId: "mer_001",
    name: "Rakibul Hasan",
    email: "owner@dhanmondi.test",
    role: "OWNER",
    status: "ACTIVE",
    lastLoginAt: mockTime(0, 1, 12),
    joinedAt: mockTime(214),
    activity: [
      { at: mockTime(0, 1, 12), action: "Signed in" },
      { at: mockTime(0, 5, 48), action: "Opened a payment for review" },
      { at: mockTime(1, 3, 0), action: "Rejected a transaction" },
    ],
  },
  {
    id: "mem_002",
    merchantId: "mer_001",
    name: "Sadia Parvin",
    email: "sadia@dhanmondi.test",
    role: "ADMIN",
    status: "ACTIVE",
    lastLoginAt: mockTime(0, 3, 30),
    joinedAt: mockTime(180),
    activity: [
      { at: mockTime(0, 3, 30), action: "Signed in" },
      { at: mockTime(1, 2, 18), action: "Created a payment link" },
      { at: mockTime(2, 4, 0), action: "Updated the business profile" },
    ],
  },
  {
    id: "mem_003",
    merchantId: "mer_001",
    name: "Tanvir Ahmed",
    email: "tanvir@dhanmondi.test",
    role: "SUPPORT",
    status: "ACTIVE",
    lastLoginAt: mockTime(2, 1, 5),
    joinedAt: mockTime(96),
    activity: [
      { at: mockTime(2, 1, 5), action: "Signed in" },
      { at: mockTime(3, 8, 20), action: "Reviewed a transaction" },
    ],
  },
  {
    id: "mem_004",
    merchantId: "mer_001",
    name: "Nusrat Jahan",
    email: "nusrat@dhanmondi.test",
    role: "VIEWER",
    status: "INVITED",
    lastLoginAt: null,
    joinedAt: mockTime(2),
    activity: [{ at: mockTime(2), action: "Invitation sent" }],
  },
];

/** A custom role defined by the merchant. */
export interface MockCustomRole {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  permissions: string[];
  memberCount: number;
  createdAt: string;
}

export const MOCK_CUSTOM_ROLES: MockCustomRole[] = [
  {
    id: "role_001",
    merchantId: "mer_001",
    name: "Cashier",
    description: "Can create payment links and take payments at the counter.",
    permissions: ["payments.view", "links.manage", "customers.manage"],
    memberCount: 2,
    createdAt: mockTime(88),
  },
  {
    id: "role_002",
    merchantId: "mer_001",
    name: "Accountant",
    description: "Read-only access to payments and reports, plus CSV export.",
    permissions: ["payments.view", "reports.view"],
    memberCount: 1,
    createdAt: mockTime(40),
  },
];

/* -------------------------------------------------------------------------- */
/* Billing                                                                     */
/* -------------------------------------------------------------------------- */

export interface MockPlan {
  id: string;
  name: string;
  /** `null` means "talk to sales" — there is no list price. */
  monthlyPrice: number | null;
  /** `null` means "talk to sales" — there is no list price. */
  yearlyPrice: number | null;
  description: string;
  limits: {
    transactions: number | null;
    paymentLinks: number | null;
    devices: number | null;
    apiRequests: number | null;
    teamMembers: number | null;
    brands: number | null;
  };
  features: string[];
  popular?: boolean;
}

export const MOCK_PLANS: MockPlan[] = [
  {
    id: "FREE",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "For trying ZevaPay with a single payment account.",
    limits: {
      transactions: 100,
      paymentLinks: 3,
      devices: 1,
      apiRequests: 500,
      teamMembers: 1,
      brands: 1,
    },
    features: [
      "1 payment account",
      "1 Android device",
      "100 transactions per month",
      "Basic reports",
      "Community support",
    ],
  },
  {
    id: "STARTER",
    name: "Starter",
    monthlyPrice: 1_500,
    yearlyPrice: 15_000,
    description: "For a growing shop taking payments across several accounts.",
    limits: {
      transactions: 2_000,
      paymentLinks: 25,
      devices: 3,
      apiRequests: 10_000,
      teamMembers: 3,
      brands: 2,
    },
    features: [
      "3 payment accounts",
      "3 Android devices",
      "2,000 transactions per month",
      "Payment links and invoices",
      "Email support",
    ],
  },
  {
    id: "GROWTH",
    name: "Growth",
    monthlyPrice: 4_500,
    yearlyPrice: 45_000,
    description: "For a busy team that needs automation and reporting.",
    limits: {
      transactions: 15_000,
      paymentLinks: 200,
      devices: 10,
      apiRequests: 100_000,
      teamMembers: 10,
      brands: 5,
    },
    features: [
      "Unlimited payment links",
      "10 Android devices",
      "15,000 transactions per month",
      "Webhooks and API access",
      "Custom roles and permissions",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "BUSINESS",
    name: "Business",
    monthlyPrice: 12_000,
    yearlyPrice: 120_000,
    description: "For multi-brand operations with heavier usage.",
    limits: {
      transactions: 75_000,
      paymentLinks: null,
      devices: 40,
      apiRequests: 500_000,
      teamMembers: 40,
      brands: 20,
    },
    features: [
      "Unlimited transactions and links",
      "40 Android devices",
      "500,000 API requests per month",
      "Multi-brand management",
      "Advanced reports",
      "Dedicated support",
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    monthlyPrice: null,
    yearlyPrice: null,
    description: "Custom limits, a dedicated environment, and a signed agreement.",
    limits: {
      transactions: null,
      paymentLinks: null,
      devices: null,
      apiRequests: null,
      teamMembers: null,
      brands: null,
    },
    features: [
      "Unlimited everything",
      "Dedicated environment",
      "Custom retention and SLAs",
      "Solution architect",
      "Onboarding and migration help",
    ],
  },
];

export interface MockSubscription {
  planId: string;
  status: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELLED";
  billingCycle: "MONTHLY" | "YEARLY";
  renewsAt: string;
  startedAt: string;
  /** Usage in the current period. */
  usage: {
    transactions: number;
    apiRequests: number;
    devices: number;
    paymentLinks: number;
    teamMembers: number;
  };
}

export const MOCK_SUBSCRIPTION: MockSubscription = {
  planId: "GROWTH",
  status: "ACTIVE",
  billingCycle: "YEARLY",
  renewsAt: mockTime(-96),
  startedAt: mockTime(461),
  usage: {
    transactions: 8_420,
    apiRequests: 62_180,
    devices: 3,
    paymentLinks: 6,
    teamMembers: 4,
  },
};

export interface MockInvoiceRecord {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: "PAID" | "PENDING" | "REFUNDED";
  plan: string;
}

export const MOCK_BILLING_HISTORY: MockInvoiceRecord[] = [
  {
    id: "bil_001",
    number: "BIL-2026-0042",
    date: mockTime(96),
    amount: 45_000,
    status: "PAID",
    plan: "Growth (yearly)",
  },
  {
    id: "bil_002",
    number: "BIL-2025-0031",
    date: mockTime(461),
    amount: 45_000,
    status: "PAID",
    plan: "Growth (yearly)",
  },
  {
    id: "bil_003",
    number: "BIL-2025-0026",
    date: mockTime(551),
    amount: 54_000,
    status: "PAID",
    plan: "Growth (yearly)",
  },
  {
    id: "bil_004",
    number: "BIL-2025-0019",
    date: mockTime(641),
    amount: 12_000,
    status: "PAID",
    plan: "Business (monthly)",
  },
];

/* -------------------------------------------------------------------------- */
/* Admin                                                                       */
/* -------------------------------------------------------------------------- */

export interface MockProvider {
  id: string;
  name: string;
  code: "BKASH" | "NAGAD" | "ROCKET" | "UPAY";
  status: "ENABLED" | "DISABLED";
  /** Fee per transaction, as a percentage. Demo value. */
  feePercent: number;
  perTransactionLimit: number;
  dailyLimit: number;
  parserVersion: string;
  /** Integration health as a percentage. */
  health: number;
  accountTypes: string[];
  /** Transactions recorded in the last 30 days. */
  volume30d: number;
  errorRate: number;
}

export const MOCK_PROVIDERS: MockProvider[] = [
  {
    id: "prv_001",
    name: "bKash",
    code: "BKASH",
    status: "ENABLED",
    feePercent: 1.85,
    perTransactionLimit: 50_000,
    dailyLimit: 500_000,
    parserVersion: "2.4.1",
    health: 99.4,
    accountTypes: ["Personal", "Agent", "Merchant"],
    volume30d: 8_412,
    errorRate: 0.4,
  },
  {
    id: "prv_002",
    name: "Nagad",
    code: "NAGAD",
    status: "ENABLED",
    feePercent: 1.6,
    perTransactionLimit: 50_000,
    dailyLimit: 500_000,
    parserVersion: "2.4.1",
    health: 98.1,
    accountTypes: ["Personal", "Agent", "Merchant"],
    volume30d: 4_180,
    errorRate: 0.8,
  },
  {
    id: "prv_003",
    name: "Rocket",
    code: "ROCKET",
    status: "ENABLED",
    feePercent: 1.5,
    perTransactionLimit: 25_000,
    dailyLimit: 250_000,
    parserVersion: "2.3.9",
    health: 94.6,
    accountTypes: ["Personal", "Agent"],
    volume30d: 1_920,
    errorRate: 1.9,
  },
  {
    id: "prv_004",
    name: "Upay",
    code: "UPAY",
    status: "ENABLED",
    feePercent: 1.4,
    perTransactionLimit: 100_000,
    dailyLimit: 1_000_000,
    parserVersion: "1.9.2",
    health: 88.3,
    accountTypes: ["Business", "Merchant"],
    volume30d: 640,
    errorRate: 3.2,
  },
  {
    id: "prv_005",
    name: "Bank transfer (coming soon)",
    code: "BKASH",
    status: "DISABLED",
    feePercent: 0.8,
    perTransactionLimit: 1_000_000,
    dailyLimit: 5_000_000,
    parserVersion: "—",
    health: 0,
    accountTypes: ["Business"],
    volume30d: 0,
    errorRate: 0,
  },
];

export interface MockAuditLog {
  id: string;
  action: string;
  actorName: string | null;
  merchantName: string | null;
  target: string;
  ipAddress: string;
  createdAt: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
}

export const MOCK_AUDIT_LOGS: MockAuditLog[] = [
  {
    id: "aud_001",
    action: "merchant.suspended",
    actorName: "Zaynab Hossain",
    merchantName: "Khulna Motors",
    target: "mer_005",
    ipAddress: "103.14.12.8",
    createdAt: mockTime(21),
    severity: "CRITICAL",
  },
  {
    id: "aud_002",
    action: "merchant.approved",
    actorName: "Zaynab Hossain",
    merchantName: "Chattogram Fashion Hub",
    target: "mer_002",
    ipAddress: "103.14.12.8",
    createdAt: mockTime(148),
    severity: "INFO",
  },
  {
    id: "aud_003",
    action: "device.revoked",
    actorName: "Arif Chowdhury",
    merchantName: "Sylhet Tea Traders",
    target: "dev_002",
    ipAddress: "103.14.12.8",
    createdAt: mockTime(4, 3),
    severity: "WARNING",
  },
  {
    id: "aud_004",
    action: "user.role_changed",
    actorName: "Arif Chowdhury",
    merchantName: "Dhanmondi Electronics",
    target: "mem_003",
    ipAddress: "103.14.12.8",
    createdAt: mockTime(6, 8),
    severity: "WARNING",
  },
  {
    id: "aud_005",
    action: "provider.fee_updated",
    actorName: "Zaynab Hossain",
    merchantName: null,
    target: "prv_003",
    ipAddress: "103.14.12.8",
    createdAt: mockTime(11),
    severity: "INFO",
  },
  {
    id: "aud_006",
    action: "transaction.reviewed",
    actorName: "Arif Chowdhury",
    merchantName: "Sylhet Tea Traders",
    target: "txn_5013",
    ipAddress: "103.14.12.8",
    createdAt: mockTime(1, 6),
    severity: "INFO",
  },
  {
    id: "aud_007",
    action: "maintenance.enabled",
    actorName: "Zaynab Hossain",
    merchantName: null,
    target: "platform",
    ipAddress: "103.14.12.8",
    createdAt: mockTime(30, 2),
    severity: "CRITICAL",
  },
  {
    id: "aud_008",
    action: "plan.assigned",
    actorName: "Arif Chowdhury",
    merchantName: "Barishal Software Labs",
    target: "mer_006",
    ipAddress: "103.14.12.8",
    createdAt: mockTime(512),
    severity: "INFO",
  },
];

export interface MockAdminStaff {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "SUPPORT" | "VIEWER";
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
  lastLoginAt: string | null;
  createdAt: string;
}

export const MOCK_ADMIN_STAFF: MockAdminStaff[] = [
  {
    id: "stf_001",
    name: "Zaynab Hossain",
    email: "admin@zevapay.test",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    lastLoginAt: mockTime(0, 0, 45),
    createdAt: mockTime(520),
  },
  {
    id: "stf_002",
    name: "Arif Chowdhury",
    email: "arif@zevapay.test",
    role: "ADMIN",
    status: "ACTIVE",
    lastLoginAt: mockTime(0, 2, 10),
    createdAt: mockTime(310),
  },
  {
    id: "stf_003",
    name: "Nusrat Jahan",
    email: "nusrat@zevapay.test",
    role: "SUPPORT",
    status: "ACTIVE",
    lastLoginAt: mockTime(1, 4),
    createdAt: mockTime(142),
  },
  {
    id: "stf_004",
    name: "Farhan Kabir",
    email: "farhan@zevapay.test",
    role: "VIEWER",
    status: "INVITED",
    lastLoginAt: null,
    createdAt: mockTime(3),
  },
];

export interface MockSystemHealth {
  apiUptime: number;
  apiLatencyMs: number;
  databaseStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE";
  queueDepth: number;
  webhooksQueued: number;
  storageUsedGb: number;
  storageTotalGb: number;
  checkedAt: string;
}

/**
 * A notification the platform sent to merchants.
 *
 * The admin console watches the outbound side of notifications: what the
 * platform said, to whom, and whether it went out. Nothing here was actually
 * delivered — the backend has no notification service.
 */
export interface MockPlatformNotification {
  id: string;
  title: string;
  detail: string;
  channel: NotificationChannel;
  /** Who the message was addressed to, in plain words. */
  audience: string;
  status: "DELIVERED" | "QUEUED" | "FAILED";
  /** Null when the message is still queued. */
  sentAt: string | null;
  /** How many merchants the message reached. */
  recipients: number;
}

export const MOCK_PLATFORM_NOTIFICATIONS: MockPlatformNotification[] = [
  {
    id: "pnt_001",
    title: "Scheduled maintenance on the API",
    detail:
      "The API will be briefly unavailable on Nov 6 between 01:00 and 02:00 Asia/Dhaka.",
    channel: "email",
    audience: "All merchants",
    status: "DELIVERED",
    sentAt: mockTime(1, 3),
    recipients: 6,
  },
  {
    id: "pnt_002",
    title: "bKash parser updated to 2.4.1",
    detail:
      "The parser now reads the newer transaction message format. No action is needed.",
    channel: "dashboard",
    audience: "All merchants",
    status: "DELIVERED",
    sentAt: mockTime(2, 5),
    recipients: 6,
  },
  {
    id: "pnt_003",
    title: "Rocket integration degraded",
    detail:
      "Notifications from Rocket are arriving late. Records are still being matched.",
    channel: "sms",
    audience: "Merchants using Rocket",
    status: "DELIVERED",
    sentAt: mockTime(3, 1),
    recipients: 2,
  },
  {
    id: "pnt_004",
    title: "New plan: Business is now available",
    detail:
      "The Business plan adds multi-brand management and heavier API limits.",
    channel: "email",
    audience: "Merchants on Growth",
    status: "DELIVERED",
    sentAt: mockTime(6, 4),
    recipients: 2,
  },
  {
    id: "pnt_005",
    title: "Sandbox environment rollout",
    detail:
      "The sandbox environment is rolling out to a quarter of merchants this week.",
    channel: "dashboard",
    audience: "Random 25% of merchants",
    status: "QUEUED",
    sentAt: null,
    recipients: 0,
  },
  {
    id: "pnt_006",
    title: "Merchant verification backlog",
    detail:
      "Four merchant registrations are waiting for a document check. The reminder could not be sent.",
    channel: "email",
    audience: "Merchants in review",
    status: "FAILED",
    sentAt: mockTime(4, 2),
    recipients: 0,
  },
];

/**
 * A signed-in administrator session.
 *
 * The backend holds sessions for every user, including platform staff, but
 * there is no endpoint that lists them across the platform, so this is sample
 * data for the admin console.
 */
export interface MockAdminSession {
  id: string;
  staffId: string;
  staffName: string;
  device: string;
  ipAddress: string;
  createdAt: string;
  lastActiveAt: string;
  current: boolean;
}

export const MOCK_ADMIN_SESSIONS: MockAdminSession[] = [
  {
    id: "ses_001",
    staffId: "stf_001",
    staffName: "Zaynab Hossain",
    device: "Windows PC · Chrome 142",
    ipAddress: "103.14.12.8",
    createdAt: mockTime(0, 0, 45),
    lastActiveAt: mockTime(0, 0, 12),
    current: true,
  },
  {
    id: "ses_002",
    staffId: "stf_002",
    staffName: "Arif Chowdhury",
    device: "MacBook Pro · Safari 19",
    ipAddress: "103.14.12.41",
    createdAt: mockTime(0, 2, 10),
    lastActiveAt: mockTime(0, 1, 55),
    current: false,
  },
  {
    id: "ses_003",
    staffId: "stf_003",
    staffName: "Nusrat Jahan",
    device: "Android phone · Chrome Mobile 141",
    ipAddress: "49.12.44.7",
    createdAt: mockTime(1, 4),
    lastActiveAt: mockTime(1, 3, 41),
    current: false,
  },
];

export const MOCK_SYSTEM_HEALTH: MockSystemHealth = {
  apiUptime: 99.97,
  apiLatencyMs: 84,
  databaseStatus: "OPERATIONAL",
  queueDepth: 12,
  webhooksQueued: 3,
  storageUsedGb: 182.4,
  storageTotalGb: 500,
  checkedAt: mockTime(0, 0, 2),
};

export interface MockFeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercent: number;
  audience: string;
}

export const MOCK_FEATURE_FLAGS: MockFeatureFlag[] = [
  {
    id: "flag_001",
    name: "Multi-brand management",
    description: "Allow a merchant to run several brands under one account.",
    enabled: true,
    rolloutPercent: 100,
    audience: "All merchants on the Growth plan and above",
  },
  {
    id: "flag_002",
    name: "Hosted checkout",
    description: "Show the ZevaPay-hosted checkout page for payment links.",
    enabled: true,
    rolloutPercent: 60,
    audience: "Random 60% of merchants",
  },
  {
    id: "flag_003",
    name: "Invoice reminders",
    description: "Send automatic reminders when an invoice becomes overdue.",
    enabled: false,
    rolloutPercent: 0,
    audience: "None",
  },
  {
    id: "flag_004",
    name: "Sandbox environment",
    description: "Give merchants a separate sandbox with simulated payments.",
    enabled: true,
    rolloutPercent: 25,
    audience: "Random 25% of merchants",
  },
  {
    id: "flag_005",
    name: "Telegram notifications",
    description: "Deliver payment notifications to a Telegram bot chat.",
    enabled: true,
    rolloutPercent: 100,
    audience: "All merchants",
  },
];

/* -------------------------------------------------------------------------- */
/* Sandbox                                                                     */
/* -------------------------------------------------------------------------- */

export interface MockSandboxTransaction {
  id: string;
  reference: string;
  scenario: "success" | "failed" | "pending";
  amount: number;
  provider: PaymentProvider;
  createdAt: string;
  request: string;
  response: string;
}

export const MOCK_SANDBOX_TRANSACTIONS: MockSandboxTransaction[] = [
  {
    id: "sbx_001",
    reference: "SBX-0001",
    scenario: "success",
    amount: 1500,
    provider: "BKASH",
    createdAt: mockTime(0, 0, 30),
    request:
      'POST /api/v1/sandbox/payments\n{\n  "amount": 1500,\n  "currency": "BDT",\n  "provider": "BKASH",\n  "scenario": "success"\n}',
    response:
      '{\n  "id": "pay_sbx_0001",\n  "status": "CONFIRMED",\n  "amount": 1500,\n  "providerRef": "SBX7Q2M9K4L",\n  "sandbox": true\n}',
  },
  {
    id: "sbx_002",
    reference: "SBX-0002",
    scenario: "failed",
    amount: 800,
    provider: "NAGAD",
    createdAt: mockTime(0, 1, 5),
    request:
      'POST /api/v1/sandbox/payments\n{\n  "amount": 800,\n  "currency": "BDT",\n  "provider": "NAGAD",\n  "scenario": "failed"\n}',
    response:
      '{\n  "id": "pay_sbx_0002",\n  "status": "FAILED",\n  "error": {\n    "code": "VERIFICATION_FAILED",\n    "message": "No matching notification was found."\n  },\n  "sandbox": true\n}',
  },
  {
    id: "sbx_003",
    reference: "SBX-0003",
    scenario: "pending",
    amount: 3200,
    provider: "ROCKET",
    createdAt: mockTime(0, 2, 20),
    request:
      'POST /api/v1/sandbox/payments\n{\n  "amount": 3200,\n  "currency": "BDT",\n  "provider": "ROCKET",\n  "scenario": "pending"\n}',
    response:
      '{\n  "id": "pay_sbx_0003",\n  "status": "PENDING",\n  "message": "Waiting for a matching notification.",\n  "sandbox": true\n}',
  },
];

/* -------------------------------------------------------------------------- */
/* Settings and security                                                       */
/* -------------------------------------------------------------------------- */

export interface MockMerchantSettings {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  currency: "BDT";
  timezone: "Asia/Dhaka";
  language: "en" | "bn";
  /** Whether customer-facing labels appear in Bangla. */
  banglaLabels: boolean;
  checkoutInstructions: string;
  termsUrl: string;
  invoicePrefix: string;
  invoiceNextNumber: number;
}

export const MOCK_MERCHANT_SETTINGS: MockMerchantSettings = {
  businessName: "Dhanmondi Electronics",
  ownerName: "Rakibul Hasan",
  email: "owner@dhanmondi.test",
  phone: "01712345678",
  website: "https://dhanmondi-electronics.test",
  address: "House 42, Road 11, Dhanmondi",
  city: "Dhaka",
  postcode: "1209",
  country: "Bangladesh",
  currency: "BDT",
  timezone: "Asia/Dhaka",
  language: "en",
  banglaLabels: false,
  checkoutInstructions:
    "Send the payment to the number below, then enter the TrxID so we can match it to your order.",
  termsUrl: "https://dhanmondi-electronics.test/terms",
  invoicePrefix: "INV-2026-",
  invoiceNextNumber: 42,
};

export interface MockSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  createdAt: string;
  lastActiveAt: string;
  current: boolean;
}

export const MOCK_SESSIONS: MockSession[] = [
  {
    id: "ses_001",
    device: "Windows PC",
    browser: "Chrome 142",
    ipAddress: "103.14.12.8",
    createdAt: mockTime(2, 4),
    lastActiveAt: mockTime(0, 1, 12),
    current: true,
  },
  {
    id: "ses_002",
    device: "Android phone",
    browser: "Chrome Mobile 141",
    ipAddress: "103.14.12.41",
    createdAt: mockTime(11),
    lastActiveAt: mockTime(3, 2),
    current: false,
  },
  {
    id: "ses_003",
    device: "MacBook Pro",
    browser: "Safari 19",
    ipAddress: "49.12.44.7",
    createdAt: mockTime(26),
    lastActiveAt: mockTime(24),
    current: false,
  },
];

export interface MockLoginEvent {
  id: string;
  at: string;
  ipAddress: string;
  device: string;
  outcome: "SUCCESS" | "FAILED";
  reason: string | null;
}

export const MOCK_LOGIN_HISTORY: MockLoginEvent[] = [
  {
    id: "logi_001",
    at: mockTime(0, 1, 12),
    ipAddress: "103.14.12.8",
    device: "Windows PC · Chrome 142",
    outcome: "SUCCESS",
    reason: null,
  },
  {
    id: "logi_002",
    at: mockTime(1, 9, 30),
    ipAddress: "103.14.12.41",
    device: "Android phone · Chrome Mobile 141",
    outcome: "SUCCESS",
    reason: null,
  },
  {
    id: "logi_003",
    at: mockTime(4, 14, 5),
    ipAddress: "45.33.19.220",
    device: "Unknown · Firefox",
    outcome: "FAILED",
    reason: "Incorrect password",
  },
  {
    id: "logi_004",
    at: mockTime(9, 3, 18),
    ipAddress: "45.33.19.220",
    device: "Unknown · Firefox",
    outcome: "FAILED",
    reason: "Incorrect password",
  },
  {
    id: "logi_005",
    at: mockTime(12, 7, 55),
    ipAddress: "49.12.44.7",
    device: "MacBook Pro · Safari 19",
    outcome: "SUCCESS",
    reason: null,
  },
];

export interface MockSecurityEvent {
  id: string;
  at: string;
  title: string;
  detail: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
}

export const MOCK_SECURITY_EVENTS: MockSecurityEvent[] = [
  {
    id: "sec_001",
    at: mockTime(0, 1, 12),
    title: "Successful sign-in",
    detail: "Signed in from 103.14.12.8 using a remembered session.",
    severity: "INFO",
  },
  {
    id: "sec_002",
    at: mockTime(4, 14, 5),
    title: "Failed sign-in",
    detail: "Two failed sign-in attempts from 45.33.19.220.",
    severity: "WARNING",
  },
  {
    id: "sec_003",
    at: mockTime(6, 2),
    title: "API key created",
    detail: "A new live API key was issued.",
    severity: "INFO",
  },
  {
    id: "sec_004",
    at: mockTime(11),
    title: "Two-factor enabled",
    detail: "Two-factor authentication was turned on for this account.",
    severity: "INFO",
  },
];

/* -------------------------------------------------------------------------- */
/* Checkout                                                                    */
/* -------------------------------------------------------------------------- */

export interface MockCheckout {
  id: string;
  merchantName: string;
  merchantLogoText: string;
  merchantLogoColor: string;
  merchantColor: string;
  orderReference: string;
  description: string;
  amount: number;
  currency: "BDT";
  provider: PaymentProvider;
  /** The account the customer should send the money to. */
  accountNumber: string;
  accountLabel: string;
  expiresAt: string;
  status: "OPEN" | "EXPIRED" | "PAID";
  customerFields: { name: string; type: "text" | "email" | "phone"; required: boolean }[];
  termsAccepted: boolean;
  successUrl: string;
  instructions: string[];
}

export const MOCK_CHECKOUTS: MockCheckout[] = [
  {
    id: "ZEV-8K2M4Q7X",
    merchantName: "Dhanmondi Electronics",
    merchantLogoText: "DE",
    merchantLogoColor: "#223b67",
    merchantColor: "#223b67",
    orderReference: "ORD-4417",
    description: "2 × Wireless keyboard, 2 × USB-C hub",
    amount: 5500,
    currency: "BDT",
    provider: "BKASH",
    accountNumber: "01712345678",
    accountLabel: "Main counter bKash",
    expiresAt: mockTime(-1),
    status: "OPEN",
    customerFields: [
      { name: "Full name", type: "text", required: true },
      { name: "Phone number", type: "phone", required: true },
    ],
    termsAccepted: true,
    successUrl: "https://dhanmondi-electronics.test/order/4417",
    instructions: [
      "Open your bKash app and choose Send Money.",
      "Send ৳5,500 to the number shown below.",
      "Copy the TrxID from the confirmation screen.",
      "Paste the TrxID below so we can match it to your order.",
    ],
  },
  {
    id: "ZEV-3X7P9K2M",
    merchantName: "Dhanmondi Electronics",
    merchantLogoText: "DE",
    merchantLogoColor: "#223b67",
    merchantColor: "#223b67",
    orderReference: "ORD-4425",
    description: "Warranty replacement charge",
    amount: 560,
    currency: "BDT",
    provider: "ROCKET",
    accountNumber: "01712345678",
    accountLabel: "Delivery Rocket",
    expiresAt: mockTime(-2),
    status: "OPEN",
    customerFields: [
      { name: "Full name", type: "text", required: true },
      { name: "Phone number", type: "phone", required: true },
    ],
    termsAccepted: true,
    successUrl: "https://dhanmondi-electronics.test/order/4425",
    instructions: [
      "Open the Rocket app and choose Send Money.",
      "Send ৳560 to the number shown below.",
      "Copy the TrxID from the confirmation screen.",
      "Paste the TrxID below so we can match it to your order.",
    ],
  },
  {
    id: "ZEV-5N2W8T4B",
    merchantName: "Dhanmondi Electronics",
    merchantLogoText: "DE",
    merchantLogoColor: "#223b67",
    merchantColor: "#223b67",
    orderReference: "ORD-4390",
    description: "Flash sale — 20% off",
    amount: 1250,
    currency: "BDT",
    provider: "BKASH",
    accountNumber: "01712345678",
    accountLabel: "Main counter bKash",
    expiresAt: mockTime(3),
    status: "EXPIRED",
    customerFields: [{ name: "Phone number", type: "phone", required: true }],
    termsAccepted: true,
    successUrl: "https://dhanmondi-electronics.test/order/4390",
    instructions: [
      "Open your bKash app and choose Send Money.",
      "Send ৳1,250 to the number shown below.",
      "Copy the TrxID from the confirmation screen.",
      "Paste the TrxID below so we can match it to your order.",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Checkout configuration                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The merchant's checkout-page configuration.
 *
 * This is the single draft behind the checkout builder. There is one per
 * merchant, so it is a plain object rather than a collection.
 */
export interface MockCheckoutConfig {
  /** Which brand's identity the page uses. */
  brandId: string | null;
  /** Whether the merchant's logo is shown at the top. */
  showLogo: boolean;
  /** Whether the amount is shown to the customer. */
  showAmount: boolean;
  /** The order summary, shown when the merchant has one. */
  showOrderSummary: boolean;
  /** The payment methods offered, in the order they are offered. */
  methodOrder: PaymentProvider[];
  /** The numbered instructions shown above the payment details. */
  instructions: string[];
  /** Where the customer lands after a payment is recorded. */
  successUrl: string;
  /** Where the customer lands when a payment cannot be matched. */
  failedUrl: string;
  /** Whether the customer is asked to accept the terms. */
  collectTerms: boolean;
  /** Whether a TrxID is asked for. */
  collectTrxId: boolean;
  /** The page theme. */
  theme: "LIGHT" | "DARK" | "SYSTEM";
  /** The accent colour used for the pay button. */
  accentColor: string;
  /** When the draft was last saved. */
  updatedAt: string;
}

export const MOCK_CHECKOUT_CONFIG: MockCheckoutConfig = {
  brandId: "brd_001",
  showLogo: true,
  showAmount: true,
  showOrderSummary: true,
  methodOrder: ["BKASH", "NAGAD", "ROCKET", "UPAY"],
  instructions: [
    "Open your payment app and choose Send Money.",
    "Send the exact amount to the number shown below.",
    "Copy the TrxID from the confirmation screen.",
    "Paste the TrxID below so the payment can be matched to your order.",
  ],
  successUrl: "https://dhanmondi-electronics.test/order/complete",
  failedUrl: "https://dhanmondi-electronics.test/order/failed",
  collectTerms: false,
  collectTrxId: true,
  theme: "LIGHT",
  accentColor: "#223b67",
  updatedAt: mockTime(2),
};

/* -------------------------------------------------------------------------- */
/* Reports                                                                     */
/* -------------------------------------------------------------------------- */

export interface MockReportRow {
  id: string;
  label: string;
  detail: string;
  amount: number;
  count: number;
  share: number;
}

/**
 * A fixed two-day series ending on the mock anchor.
 *
 * Each point carries both a display label and an ISO date, so the overview
 * charts can be windowed by a date range without parsing the label.
 */
const MOCK_SERIES_DATES = [
  "2026-10-04",
  "2026-10-06",
  "2026-10-08",
  "2026-10-10",
  "2026-10-12",
  "2026-10-14",
  "2026-10-16",
  "2026-10-18",
  "2026-10-20",
  "2026-10-22",
  "2026-10-24",
  "2026-10-26",
  "2026-10-28",
  "2026-10-30",
  "2026-11-01",
  "2026-11-02",
];

export const MOCK_REVENUE_BY_DAY = [
  { label: "Oct 4", date: MOCK_SERIES_DATES[0], revenue: 42_300, transactions: 61 },
  { label: "Oct 6", date: MOCK_SERIES_DATES[1], revenue: 51_800, transactions: 74 },
  { label: "Oct 8", date: MOCK_SERIES_DATES[2], revenue: 38_400, transactions: 58 },
  { label: "Oct 10", date: MOCK_SERIES_DATES[3], revenue: 67_200, transactions: 92 },
  { label: "Oct 12", date: MOCK_SERIES_DATES[4], revenue: 59_600, transactions: 81 },
  { label: "Oct 14", date: MOCK_SERIES_DATES[5], revenue: 73_900, transactions: 104 },
  { label: "Oct 16", date: MOCK_SERIES_DATES[6], revenue: 61_400, transactions: 88 },
  { label: "Oct 18", date: MOCK_SERIES_DATES[7], revenue: 82_500, transactions: 117 },
  { label: "Oct 20", date: MOCK_SERIES_DATES[8], revenue: 71_200, transactions: 96 },
  { label: "Oct 22", date: MOCK_SERIES_DATES[9], revenue: 88_700, transactions: 124 },
  { label: "Oct 24", date: MOCK_SERIES_DATES[10], revenue: 64_300, transactions: 91 },
  { label: "Oct 26", date: MOCK_SERIES_DATES[11], revenue: 94_800, transactions: 132 },
  { label: "Oct 28", date: MOCK_SERIES_DATES[12], revenue: 79_600, transactions: 109 },
  { label: "Oct 30", date: MOCK_SERIES_DATES[13], revenue: 96_400, transactions: 138 },
  { label: "Nov 1", date: MOCK_SERIES_DATES[14], revenue: 103_200, transactions: 141 },
  { label: "Nov 2", date: MOCK_SERIES_DATES[15], revenue: 87_500, transactions: 118 },
];

export const MOCK_VOLUME_BY_DAY = MOCK_REVENUE_BY_DAY.map((point) => ({
  label: point.label,
  date: point.date,
  value: point.transactions,
}));

export const MOCK_REVENUE_BY_METHOD = [
  { method: "BKASH" as PaymentProvider, amount: 1_842_300, count: 486 },
  { method: "NAGAD" as PaymentProvider, amount: 968_400, count: 312 },
  { method: "ROCKET" as PaymentProvider, amount: 512_700, count: 148 },
  { method: "UPAY" as PaymentProvider, amount: 186_500, count: 41 },
];

export const MOCK_FEE_REPORT = [
  { label: "bKash", transactions: 486, gross: 1_842_300, fee: 34_073, net: 1_808_227 },
  { label: "Nagad", transactions: 312, gross: 968_400, fee: 15_494, net: 952_906 },
  { label: "Rocket", transactions: 148, gross: 512_700, fee: 7_691, net: 505_009 },
  { label: "Upay", transactions: 41, gross: 186_500, fee: 2_611, net: 183_889 },
];

/**
 * A reconciliation period.
 *
 * "Recorded" is what ZevaPay logged from notifications. "Settled" is what the
 * provider statement says. A difference is not an error — it is money that
 * has not been confirmed on the provider's side yet.
 */
export interface MockReconciliation {
  id: string;
  period: string;
  opening: number;
  recorded: number;
  settled: number;
  difference: number;
  status: "BALANCED" | "DIFFERENCE";
  note: string;
}

export const MOCK_RECONCILIATION: MockReconciliation[] = [
  {
    id: "rec_001",
    period: "October 2026",
    opening: 0,
    recorded: 1_042_400,
    settled: 1_009_800,
    difference: 32_600,
    status: "DIFFERENCE",
    note: "34 payments recorded but not yet matched to a provider statement.",
  },
  {
    id: "rec_002",
    period: "September 2026",
    opening: 0,
    recorded: 894_200,
    settled: 894_200,
    difference: 0,
    status: "BALANCED",
    note: "Everything recorded matched the provider statement.",
  },
  {
    id: "rec_003",
    period: "August 2026",
    opening: 0,
    recorded: 812_900,
    settled: 812_900,
    difference: 0,
    status: "BALANCED",
    note: "Everything recorded matched the provider statement.",
  },
];

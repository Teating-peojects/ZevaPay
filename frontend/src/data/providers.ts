import type { PaymentProvider } from "@/types/api";

/**
 * Display metadata for the mobile financial services (MFS) providers
 * ZevaPay supports. Colors are simple identifiers, not official brand marks.
 */
export const PROVIDERS = {
  BKASH: {
    id: "BKASH" as const,
    name: "bKash",
    shortName: "bK",
    /** Brand hex used for the identifier chip only. */
    color: "#E2136E",
    tint: "#FCE7F3",
    textColor: "#9D174D",
  },
  NAGAD: {
    id: "NAGAD" as const,
    name: "Nagad",
    shortName: "Ng",
    color: "#EE1C25",
    tint: "#FEE2E2",
    textColor: "#991B1B",
  },
  ROCKET: {
    id: "ROCKET" as const,
    name: "Rocket",
    shortName: "Rk",
    color: "#8A1538",
    tint: "#FCE8EE",
    textColor: "#701027",
  },
  UPAY: {
    id: "UPAY" as const,
    name: "Upay",
    shortName: "Up",
    color: "#0F7BC4",
    tint: "#E0F2FE",
    textColor: "#075985",
  },
} satisfies Record<
  PaymentProvider,
  {
    id: PaymentProvider;
    name: string;
    shortName: string;
    color: string;
    tint: string;
    textColor: string;
  }
>;

export const PROVIDER_LIST = Object.values(PROVIDERS);

export function getProvider(provider: PaymentProvider) {
  return PROVIDERS[provider];
}

export function providerName(provider: PaymentProvider): string {
  return PROVIDERS[provider].name;
}

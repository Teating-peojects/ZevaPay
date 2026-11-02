import { Badge } from "@/components/ui/badge";
import type {
  AccountStatus,
  DeviceStatus,
  MerchantStatus,
  TransactionStatus,
} from "@/types/api";

/**
 * Status badges. Every state the API can return has a label and a tone, so
 * a record can never render as an unknown value.
 */

const transactionConfig: Record<
  TransactionStatus,
  { label: string; tone: "success" | "warning" | "info" | "danger" }
> = {
  SUCCESS: { label: "Success", tone: "success" },
  PENDING: { label: "Pending", tone: "warning" },
  REVIEW: { label: "Review", tone: "info" },
  FAILED: { label: "Failed", tone: "danger" },
};

export function TransactionStatusBadge({
  status,
}: {
  status: TransactionStatus;
}) {
  const config = transactionConfig[status];
  return (
    <Badge tone={config.tone} dot>
      {config.label}
    </Badge>
  );
}

const accountConfig: Record<
  AccountStatus,
  { label: string; tone: "success" | "warning" | "danger" }
> = {
  ACTIVE: { label: "Active", tone: "success" },
  PENDING: { label: "Pending", tone: "warning" },
  SUSPENDED: { label: "Suspended", tone: "danger" },
};

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const config = accountConfig[status];
  return (
    <Badge tone={config.tone} dot>
      {config.label}
    </Badge>
  );
}

const deviceConfig: Record<
  DeviceStatus,
  { label: string; tone: "success" | "neutral" | "warning" }
> = {
  ONLINE: { label: "Online", tone: "success" },
  OFFLINE: { label: "Offline", tone: "neutral" },
  PENDING: { label: "Pending", tone: "warning" },
};

export function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  const config = deviceConfig[status];
  return (
    <Badge tone={config.tone} dot>
      {config.label}
    </Badge>
  );
}

const merchantConfig: Record<
  MerchantStatus,
  { label: string; tone: "success" | "warning" | "danger" }
> = {
  ACTIVE: { label: "Active", tone: "success" },
  PENDING_REVIEW: { label: "In Review", tone: "warning" },
  SUSPENDED: { label: "Suspended", tone: "danger" },
};

export function MerchantStatusBadge({ status }: { status: MerchantStatus }) {
  const config = merchantConfig[status];
  return (
    <Badge tone={config.tone} dot>
      {config.label}
    </Badge>
  );
}

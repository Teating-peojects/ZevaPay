"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  LogOut,
  Monitor,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { Switch } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { apiFetch, ApiError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";
import {
  mockFetchLoginHistory,
  mockFetchSecurityEvents,
  mockFetchSessions,
  mockFetchTwoFactorEnabled,
  mockRevokeSession,
  mockSetTwoFactorEnabled,
  type MockLoginEvent,
  type MockSecurityEvent,
  type MockSession,
} from "@/mock";
import type { ApiSession } from "@/types/api";

/**
 * The security page.
 *
 * Two sources are combined here, and the page is careful about the join.
 *
 * The real API knows which sessions are live (`GET /api/v1/auth/sessions`),
 * because the server holds the session records. It does not know about
 * sign-in history, two-factor state or security events — there is no such
 * model on the backend — so those come from the demo layer and are labelled
 * as such.
 */
export default function SecurityPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [liveSessions, setLiveSessions] = React.useState<ApiSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = React.useState(true);
  const [sessionsError, setSessionsError] = React.useState<string | null>(null);

  const [demoSessions, setDemoSessions] = React.useState<MockSession[]>(() =>
    mockFetchSessions(),
  );
  const [loginHistory, setLoginHistory] = React.useState<MockLoginEvent[]>(() =>
    mockFetchLoginHistory(),
  );
  const [events, setEvents] = React.useState<MockSecurityEvent[]>(() =>
    mockFetchSecurityEvents(),
  );
  const [twoFactor, setTwoFactor] = React.useState<boolean>(() =>
    mockFetchTwoFactorEnabled(),
  );

  const [pendingRevoke, setPendingRevoke] = React.useState<MockSession | null>(
    null,
  );
  const [revoking, setRevoking] = React.useState(false);
  const [deactivateOpen, setDeactivateOpen] = React.useState(false);
  const [deactivating, setDeactivating] = React.useState(false);

  const [reloadToken, setReloadToken] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setSessionsLoading(true);
      setSessionsError(null);

      try {
        const response = await apiFetch<{ sessions: ApiSession[] }>(
          "/api/v1/auth/sessions",
        );
        if (cancelled) return;
        setLiveSessions(response.sessions);
      } catch (error) {
        if (cancelled) return;
        setSessionsError(
          error instanceof ApiError
            ? error.message
            : "The session list could not be loaded.",
        );
      } finally {
        if (!cancelled) setSessionsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  function handleToggleTwoFactor(enabled: boolean) {
    mockSetTwoFactorEnabled(enabled);
    setTwoFactor(enabled);
    setEvents(mockFetchSecurityEvents());

    toast({
      title: enabled
        ? "Two-factor turned on"
        : "Two-factor turned off",
      description: enabled
        ? "You will be asked for a code the next time you sign in. This is a demo setting — the backend has no two-factor state."
        : "Your account is protected by a password alone. This is a demo setting.",
      tone: "warning",
    });
  }

  function handleRevokeSession() {
    if (!pendingRevoke) return;
    setRevoking(true);
    mockRevokeSession(pendingRevoke.id);
    setDemoSessions(mockFetchSessions());
    setRevoking(false);
    setPendingRevoke(null);

    toast({
      title: "Session signed out",
      description:
        "The demo session was removed from this browser. Nothing was revoked on a server.",
      tone: "info",
    });
  }

  function handleDeactivate() {
    setDeactivating(true);
    setDeactivateOpen(false);
    setDeactivating(false);

    toast({
      title: "Nothing was deactivated",
      description:
        "The backend has no account deactivation, and no real account was closed. This is a demonstration of the confirmation flow.",
      tone: "warning",
    });
  }

  const historyColumns: Column<MockLoginEvent>[] = [
    {
      key: "at",
      header: "When",
      render: (row) => (
        <span className="text-[13px] text-ink-soft">
          {formatDateTime(row.at)}
        </span>
      ),
      sortValue: (row) => row.at,
    },
    {
      key: "device",
      header: "Device",
      render: (row) => (
        <span className="text-[13px] text-ink-soft">{row.device}</span>
      ),
      sortValue: (row) => row.device,
    },
    {
      key: "ip",
      header: "IP address",
      render: (row) => (
        <span className="font-mono text-[12px] text-ink-muted">
          {row.ipAddress}
        </span>
      ),
      sortValue: (row) => row.ipAddress,
    },
    {
      key: "outcome",
      header: "Outcome",
      render: (row) => (
        <Badge tone={row.outcome === "SUCCESS" ? "success" : "danger"} dot>
          {row.outcome === "SUCCESS" ? "Signed in" : "Failed"}
        </Badge>
      ),
      sortValue: (row) => row.outcome,
    },
    {
      key: "reason",
      header: "Detail",
      align: "right",
      render: (row) => (
        <span className="text-[12px] text-ink-muted">
          {row.reason ?? "—"}
        </span>
      ),
      sortValue: (row) => row.reason ?? "",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Security"
        description="Sign-in protection, active sessions and account history."
        actions={<DemoBadge label="Demo security data" />}
      />

      <DemoNotice title="Partly real, partly demo">
        Active sessions come from the real API, because the server holds the
        session records. Two-factor state, sign-in history and the security
        log have no backend model yet, so they are sample data.
      </DemoNotice>

      {/* Two-factor */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-ink-muted" aria-hidden="true" />
            <CardTitle>Two-factor authentication</CardTitle>
          </div>
          <CardDescription>
            Ask for a one-time code in addition to your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg border border-line bg-elevated px-4 py-3">
            <Switch
              id="two-factor"
              checked={twoFactor}
              onCheckedChange={handleToggleTwoFactor}
              label="Require a one-time code at sign-in"
              description={
                twoFactor
                  ? "Your account asks for a code after the password."
                  : "Your account is protected by a password alone."
              }
            />
          </div>

          <Alert tone="warning" title="A demo setting">
            The backend stores no two-factor state on the user record, so this
            switch only changes what this page shows. No code is ever sent, and
            the code field on the sign-in screen is not wired to this switch.
          </Alert>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-ink-muted" aria-hidden="true" />
            <CardTitle>Password</CardTitle>
          </div>
          <CardDescription>
            Changing your password signs out every other session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/settings")}
          >
            <KeyRound className="size-3.5" aria-hidden="true" />
            Change password
          </Button>
        </CardContent>
      </Card>

      {/* Live sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="size-4 text-ink-muted" aria-hidden="true" />
            <CardTitle>Active sessions</CardTitle>
          </div>
          <CardDescription>
            The sessions the server currently considers live.
          </CardDescription>
          <div className="mt-2 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setReloadToken((token) => token + 1)}
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <p className="text-[13px] text-ink-muted">Loading sessions…</p>
          ) : sessionsError ? (
            <Alert tone="danger">{sessionsError}</Alert>
          ) : liveSessions.length === 0 ? (
            <p className="text-[13px] text-ink-muted">
              No active sessions were found.
            </p>
          ) : (
            <ul className="divide-y divide-line rounded-lg border border-line">
              {liveSessions.map((session) => (
                <li
                  key={session.id}
                  className="flex flex-col gap-1 px-4 py-3 text-[13px] sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <span className="min-w-0 truncate text-ink-soft">
                    {session.userAgent ?? "Unknown device"}
                  </span>
                  <span className="shrink-0 text-ink-muted">
                    {session.ipAddress ?? "Unknown IP"} · started{" "}
                    {formatDateTime(session.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">
            Signing out of every other session is done on the Settings page,
            where the password form lives.
          </p>
        </CardContent>
      </Card>

      {/* Demo sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LogOut className="size-4 text-ink-muted" aria-hidden="true" />
            <CardTitle>Other signed-in devices</CardTitle>
          </div>
          <CardDescription>
            Sample sessions, with a way to sign one out.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <DemoBadge label="Demo sessions" />

          {demoSessions.length === 0 ? (
            <p className="text-[13px] text-ink-muted">
              No other devices are signed in.
            </p>
          ) : (
            <ul className="divide-y divide-line rounded-lg border border-line">
              {demoSessions.map((session) => (
                <li
                  key={session.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink">
                      {session.device}
                    </p>
                    <p className="text-[12px] text-ink-muted">
                      {session.browser} · {session.ipAddress} · active{" "}
                      {formatDateTime(session.lastActiveAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {session.current ? (
                      <Badge tone="success" dot>
                        This device
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => setPendingRevoke(session)}
                      >
                        Sign out
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Sign-in history */}
      <Card>
        <CardHeader>
          <CardTitle>Sign-in history</CardTitle>
          <CardDescription>
            Where and when you have signed in, including failures.
          </CardDescription>
          <div className="mt-2 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setLoginHistory(mockFetchLoginHistory())}
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Reload history
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={historyColumns}
            rows={loginHistory}
            showSearch
            searchPlaceholder="Search by IP or device"
            emptyTitle="No sign-ins recorded"
            emptyDescription="Sign-in attempts appear here once there are any."
            emptyIcon={ShieldAlert}
            hideExport
          />
        </CardContent>
      </Card>

      {/* Security events */}
      <Card>
        <CardHeader>
          <CardTitle>Security log</CardTitle>
          <CardDescription>
            Changes that affect how your account is protected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-start gap-3 rounded-lg border border-line px-4 py-3"
              >
                <span
                  className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${
                    event.severity === "CRITICAL"
                      ? "bg-danger-tint text-danger-fg"
                      : event.severity === "WARNING"
                        ? "bg-warning-tint text-warning-fg"
                        : "bg-info-tint text-info-fg"
                  }`}
                >
                  {event.severity === "INFO" ? (
                    <ShieldCheck className="size-3.5" aria-hidden="true" />
                  ) : (
                    <TriangleAlert className="size-3.5" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-ink">{event.title}</p>
                  <p className="mt-0.5 text-[13px] text-ink-muted">
                    {event.detail}
                  </p>
                  <p className="mt-0.5 text-[12px] text-ink-faint">
                    {formatDateTime(event.at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-danger-line">
        <CardHeader>
          <CardTitle>Deactivate account</CardTitle>
          <CardDescription>
            Close this merchant account and stop accepting payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Alert tone="danger" title="This cannot be undone">
            Deactivating hides your account and signs out every device. Your
            transaction history is kept for the records you are required to
            keep.
          </Alert>
          <div>
            <Button
              variant="danger"
              type="button"
              onClick={() => setDeactivateOpen(true)}
            >
              <TriangleAlert className="size-4" aria-hidden="true" />
              Deactivate account
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingRevoke !== null}
        title="Sign out this device?"
        description={`${pendingRevoke?.device ?? "This device"} will be signed out. This is a demo session, so nothing is revoked on a server.`}
        confirmLabel="Sign out"
        loading={revoking}
        onConfirm={handleRevokeSession}
        onCancel={() => setPendingRevoke(null)}
      />

      <ConfirmDialog
        open={deactivateOpen}
        title="Deactivate your account?"
        description="Your merchant account would be deactivated and every device signed out. This is a demonstration — the backend has no account deactivation, so no real account is closed."
        confirmLabel="Deactivate account"
        loading={deactivating}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateOpen(false)}
      />
    </div>
  );
}

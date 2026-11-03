"use client";

import * as React from "react";
import { Eye, LogOut, MonitorSmartphone, UserPlus, UserX, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { Drawer } from "@/components/ui/drawer";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { formatDateTime, formatNumber, formatRelativeTime } from "@/lib/format";
import { useMockTable } from "@/hooks/use-mock-table";
import {
  mockFetchAdminSessions,
  mockFetchAdminStaff,
  mockInviteAdminStaff,
  mockRemoveAdminStaff,
  mockRevokeAdminSession,
  mockUpdateAdminStaff,
  type MockAdminSession,
  type MockAdminStaff,
} from "@/mock";
import type { AdminStaffValues } from "@/lib/schemas";
import { StaffForm } from "./staff-form";

const ROLE_LABELS: Record<MockAdminStaff["role"], string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  SUPPORT: "Support",
  VIEWER: "Viewer",
};

const STAFF_TONES: Record<
  MockAdminStaff["status"],
  "success" | "warning" | "danger"
> = {
  ACTIVE: "success",
  INVITED: "warning",
  SUSPENDED: "danger",
};

/**
 * Platform staff.
 *
 * The backend has no endpoint for the platform's own staff list or for the
 * sessions of an administrator, so this screen reads from the mock layer.
 */
export default function AdminStaffPage() {
  const { toast } = useToast();
  const [tab, setTab] = React.useState("staff");
  const [formOpen, setFormOpen] = React.useState(false);
  const [inviting, setInviting] = React.useState(false);
  const [selected, setSelected] = React.useState<MockAdminStaff | null>(null);
  const [pendingRemoval, setPendingRemoval] =
    React.useState<MockAdminStaff | null>(null);
  const [removing, setRemoving] = React.useState(false);
  const [pendingRevoke, setPendingRevoke] =
    React.useState<MockAdminSession | null>(null);
  const [revoking, setRevoking] = React.useState(false);

  const staff = useMockTable<MockAdminStaff>({
    fetch: (options) => mockFetchAdminStaff(options),
    pageSize: 10,
    initialSort: { sort: "createdAt", order: "asc" },
  });

  const sessions = useMockTable<MockAdminSession>({
    fetch: (options) => mockFetchAdminSessions(options),
    pageSize: 10,
    initialSort: { sort: "lastActiveAt", order: "desc" },
  });

  function handleInvite(values: AdminStaffValues) {
    setInviting(true);

    mockInviteAdminStaff({
      name: values.name,
      email: values.email,
      role: values.role,
    });

    toast({
      title: "Invitation recorded",
      description:
        "The staff member was added to the list. The backend cannot send an invitation email yet, so they will need a password set before they can sign in.",
      tone: "success",
    });

    setFormOpen(false);
    staff.refresh();
  }

  function handleRemove() {
    if (!pendingRemoval) return;
    setRemoving(true);

    mockRemoveAdminStaff(pendingRemoval.id);

    toast({
      title: "Staff member removed",
      description: `${pendingRemoval.name} was removed from the platform staff list.`,
      tone: "success",
    });

    setPendingRemoval(null);
    setSelected(null);
    setRemoving(false);
    staff.refresh();
  }

  function handleToggleSuspension(member: MockAdminStaff) {
    const next = member.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    mockUpdateAdminStaff(member.id, { status: next });

    toast({
      title: next === "ACTIVE" ? "Access restored" : "Access suspended",
      description:
        next === "ACTIVE"
          ? `${member.name} can sign in to the console again.`
          : `${member.name} can no longer sign in to the console.`,
      tone: next === "ACTIVE" ? "success" : "warning",
    });

    setSelected(null);
    staff.refresh();
  }

  function handleRevokeSession() {
    if (!pendingRevoke) return;
    setRevoking(true);

    mockRevokeAdminSession(pendingRevoke.id);

    toast({
      title: "Session ended",
      description:
        "The session was removed from the list. The backend is not told, because it has no endpoint for this.",
      tone: "success",
    });

    setPendingRevoke(null);
    setRevoking(false);
    sessions.refresh();
  }

  const staffColumns: Column<MockAdminStaff>[] = [
    {
      key: "name",
      header: "Name",
      render: (member) => (
        <span className="block">
          <span className="block text-[13px] font-medium text-ink">
            {member.name}
          </span>
          <span className="block text-[12px] text-ink-muted">{member.email}</span>
        </span>
      ),
      sortValue: (member) => member.name,
    },
    {
      key: "role",
      header: "Role",
      render: (member) => (
        <Badge tone={member.role === "SUPER_ADMIN" ? "brand" : "neutral"}>
          {ROLE_LABELS[member.role]}
        </Badge>
      ),
      sortValue: (member) => member.role,
    },
    {
      key: "status",
      header: "Status",
      render: (member) => (
        <Badge tone={STAFF_TONES[member.status]} dot>
          {member.status === "ACTIVE"
            ? "Active"
            : member.status === "INVITED"
              ? "Invited"
              : "Suspended"}
        </Badge>
      ),
      sortValue: (member) => member.status,
    },
    {
      key: "lastLoginAt",
      header: "Last sign-in",
      align: "right",
      render: (member) => (
        <span className="text-[13px] text-ink-muted">
          {member.lastLoginAt
            ? formatRelativeTime(member.lastLoginAt)
            : "Never signed in"}
        </span>
      ),
      sortValue: (member) => member.lastLoginAt ?? "",
    },
    {
      key: "createdAt",
      header: "Added",
      align: "right",
      render: (member) => (
        <span className="text-[13px] text-ink-muted">
          {formatDateTime(member.createdAt)}
        </span>
      ),
      sortValue: (member) => member.createdAt,
    },
  ];

  const sessionColumns: Column<MockAdminSession>[] = [
    {
      key: "staffName",
      header: "Staff member",
      render: (session) => (
        <span className="text-[13px] font-medium text-ink">
          {session.staffName}
        </span>
      ),
      sortValue: (session) => session.staffName,
    },
    {
      key: "device",
      header: "Device",
      render: (session) => (
        <span className="text-[13px] text-ink-soft">{session.device}</span>
      ),
      sortValue: (session) => session.device,
    },
    {
      key: "ipAddress",
      header: "IP address",
      render: (session) => (
        <span className="font-mono text-[12px] text-ink-muted">
          {session.ipAddress}
        </span>
      ),
      sortValue: (session) => session.ipAddress,
    },
    {
      key: "lastActiveAt",
      header: "Last active",
      align: "right",
      render: (session) => (
        <span className="text-[13px] text-ink-muted">
          {formatRelativeTime(session.lastActiveAt)}
        </span>
      ),
      sortValue: (session) => session.lastActiveAt,
    },
    {
      key: "current",
      header: "Session",
      render: (session) =>
        session.current ? (
          <Badge tone="success" dot>
            This device
          </Badge>
        ) : (
          <Badge tone="neutral" dot>
            Other device
          </Badge>
        ),
      sortValue: (session) => (session.current ? 1 : 0),
    },
  ];

  const staffRows = staff.rows;
  const active = staffRows.filter((row) => row.status === "ACTIVE").length;
  const invited = staffRows.filter((row) => row.status === "INVITED").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff"
        description="People who can sign in to the ZevaPay platform console."
        actions={
          <div className="flex items-center gap-2">
            <DemoBadge label="Demo staff" />
            <Button onClick={() => setFormOpen(true)}>
              <UserPlus className="size-4" aria-hidden="true" />
              Invite staff
            </Button>
          </div>
        }
      />

      <DemoNotice title="Sample staff list">
        The backend has no endpoint for the platform&apos;s own staff list, and
        no way to list an administrator&apos;s sessions across the platform.
        The people and sessions below are sample records. Inviting someone
        adds a record — no invitation email is sent.
      </DemoNotice>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Staff on this page"
          value={formatNumber(staffRows.length)}
          hint="Members of the platform team"
          icon={Users}
        />
        <StatCard
          label="Active"
          value={formatNumber(active)}
          hint="Can sign in to the console"
          icon={Users}
          tone="success"
        />
        <StatCard
          label="Invited"
          value={formatNumber(invited)}
          hint="Have not signed in yet"
          icon={UserPlus}
          tone={invited > 0 ? "warning" : "neutral"}
        />
        <StatCard
          label="Open sessions"
          value={formatNumber(sessions.total)}
          hint="Across the platform staff"
          icon={MonitorSmartphone}
        />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "staff", label: "Staff", icon: Users },
          { id: "sessions", label: "Sessions", icon: MonitorSmartphone },
        ]}
      />

      <TabPanel id="staff" value={tab}>
        <DataTable
          columns={staffColumns}
          rows={staffRows}
          loading={staff.loading}
          error={staff.error ?? undefined}
          showSearch
          searchPlaceholder="Search by name or email"
          filters={[
            {
              id: "status",
              label: "All roles",
              options: [
                { value: "SUPER_ADMIN", label: "Super admin" },
                { value: "ADMIN", label: "Admin" },
                { value: "SUPPORT", label: "Support" },
                { value: "VIEWER", label: "Viewer" },
              ],
            },
            {
              id: "state",
              label: "All states",
              options: [
                { value: "ACTIVE", label: "Active" },
                { value: "INVITED", label: "Invited" },
                { value: "SUSPENDED", label: "Suspended" },
              ],
            },
          ]}
          emptyTitle="No staff yet"
          emptyDescription="Invite someone so they can help run the platform."
          emptyIcon={Users}
          actions={(member) => [
            {
              label: "View staff member",
              icon: Eye,
              onSelect: () => setSelected(member),
            },
            {
              label:
                member.status === "SUSPENDED"
                  ? "Restore access"
                  : "Suspend access",
              icon: UserX,
              variant: member.status === "SUSPENDED" ? undefined : ("danger" as const),
              onSelect: () => handleToggleSuspension(member),
            },
            {
              label: "Remove from staff",
              icon: UserX,
              variant: "danger",
              onSelect: () => setPendingRemoval(member),
            },
          ]}
          onRowClick={(member) => setSelected(member)}
          hideExport
          server={{
            total: staff.total,
            page: staff.page,
            pageSize: staff.pageSize,
            query: staff.query,
            filters: staff.filters,
            sort: staff.sort,
            onPageChange: staff.setPage,
            onQueryChange: staff.setQuery,
            onFilterChange: staff.setFilter,
            onSortChange: staff.setSort,
          }}
        />
      </TabPanel>

      <TabPanel id="sessions" value={tab}>
        <div className="flex flex-col gap-4">
          <DataTable
            columns={sessionColumns}
            rows={sessions.rows}
            loading={sessions.loading}
            error={sessions.error ?? undefined}
            showSearch
            searchPlaceholder="Search by name, device, or IP"
            emptyTitle="No open sessions"
            emptyDescription="Sessions appear here when staff sign in to the console."
            emptyIcon={MonitorSmartphone}
            actions={(session) => [
              {
                label: "End session",
                icon: LogOut,
                variant: "danger",
                onSelect: () => setPendingRevoke(session),
              },
            ]}
            hideExport
            server={{
              total: sessions.total,
              page: sessions.page,
              pageSize: sessions.pageSize,
              query: sessions.query,
              filters: sessions.filters,
              sort: sessions.sort,
              onPageChange: sessions.setPage,
              onQueryChange: sessions.setQuery,
              onFilterChange: sessions.setFilter,
              onSortChange: sessions.setSort,
            }}
          />

          <p className="text-[12px] leading-relaxed text-ink-muted">
            Ending a session removes it from the list. The backend stores
            sessions but has no endpoint that lists or revokes them across the
            platform, so nothing is changed on the server.
          </p>
        </div>
      </TabPanel>

      <StaffForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleInvite}
        saving={inviting}
      />

      <Drawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Staff member"
        description={selected?.name}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)} type="button">
              Close
            </Button>
            <Button
              type="button"
              variant={selected?.status === "SUSPENDED" ? "primary" : "danger"}
              onClick={() => {
                if (selected) handleToggleSuspension(selected);
              }}
            >
              {selected?.status === "SUSPENDED" ? (
                "Restore access"
              ) : (
                "Suspend access"
              )}
            </Button>
          </>
        }
      >
        {selected ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1 rounded-lg border border-line bg-elevated px-4 py-4">
              <span className="text-[13px] text-ink-muted">Name</span>
              <span className="text-lg font-semibold tracking-tight text-ink">
                {selected.name}
              </span>
              <span className="text-[13px] text-ink-muted">{selected.email}</span>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge tone={selected.role === "SUPER_ADMIN" ? "brand" : "neutral"}>
                  {ROLE_LABELS[selected.role]}
                </Badge>
                <Badge tone={STAFF_TONES[selected.status]} dot>
                  {selected.status === "ACTIVE"
                    ? "Active"
                    : selected.status === "INVITED"
                      ? "Invited"
                      : "Suspended"}
                </Badge>
              </div>
            </div>

            <dl className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Staff ID</dt>
                <dd className="font-mono font-medium text-ink">{selected.id}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Last sign-in</dt>
                <dd className="font-medium text-ink">
                  {selected.lastLoginAt
                    ? formatDateTime(selected.lastLoginAt)
                    : "Never signed in"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Added</dt>
                <dd className="font-medium text-ink">
                  {formatDateTime(selected.createdAt)}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={pendingRemoval !== null}
        title="Remove from staff?"
        description={`${pendingRemoval?.name} will be removed from the platform staff list. They will not be able to sign in to the console.`}
        confirmLabel="Remove from staff"
        loading={removing}
        onConfirm={handleRemove}
        onCancel={() => setPendingRemoval(null)}
      />

      <ConfirmDialog
        open={pendingRevoke !== null}
        title="End this session?"
        description={`${pendingRevoke?.staffName} will be signed out of ${pendingRevoke?.device}.`}
        confirmLabel="End session"
        loading={revoking}
        onConfirm={handleRevokeSession}
        onCancel={() => setPendingRevoke(null)}
      />
    </div>
  );
}

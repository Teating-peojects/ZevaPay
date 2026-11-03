"use client";

import * as React from "react";
import {
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
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
import { Modal } from "@/components/ui/modal";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { apiFetch, ApiError } from "@/lib/api-client";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  ROLE_LABELS,
  toTeamRole,
} from "@/lib/team-roles";
import {
  mockCreateCustomRole,
  mockDeleteCustomRole,
  mockFetchCustomRoles,
  mockFetchPermissions,
  mockFetchRolePermissions,
  mockInviteTeamMember,
  type MockCustomRole,
  type MockPermission,
  type MockRole,
} from "@/mock";
import type { ApiUser } from "@/types/api";
import { CustomRoleForm, InviteForm } from "./invite-form";
import { BUILT_IN_ROLES, RoleMatrix } from "./role-matrix";

/**
 * A team member as the page shows them.
 *
 * The list comes from the real users API. The mock layer's `MockTeamMember`
 * has an activity trail the API does not provide, so the two are kept apart:
 * this shape is what the page renders.
 */
interface TeamRow {
  id: string;
  name: string;
  email: string;
  role: MockRole;
  roleLabel: string;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  /** True when the member came from the mock invite list, not the API. */
  invited: boolean;
}

/**
 * The team page.
 *
 * The member list is real: it comes from `GET /api/v1/merchant/team`, which
 * returns the users attached to this merchant. Two things are not real, and
 * the page says which is which:
 *
 *  - inviting someone, because the backend can create a user but this
 *    prototype does not send the invitation email;
 *  - custom roles, because the backend has no role store at all.
 */
export default function TeamPage() {
  const { toast } = useToast();

  const [members, setMembers] = React.useState<TeamRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState("members");

  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const [inviting, setInviting] = React.useState(false);

  const [roleOpen, setRoleOpen] = React.useState(false);
  const [roleError, setRoleError] = React.useState<string | null>(null);
  const [creatingRole, setCreatingRole] = React.useState(false);

  const [customRoles, setCustomRoles] = React.useState<MockCustomRole[]>(() =>
    mockFetchCustomRoles({ pageSize: 50 }).rows,
  );
  const [pendingRemoval, setPendingRemoval] = React.useState<MockCustomRole | null>(
    null,
  );
  const [removing, setRemoving] = React.useState(false);

  const permissions = React.useMemo<MockPermission[]>(
    () => mockFetchPermissions(),
    [],
  );
  const rolePermissions = React.useMemo(() => mockFetchRolePermissions(), []);

  const [reloadToken, setReloadToken] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);

      try {
        const response = await apiFetch<{ users: ApiUser[] }>(
          "/api/v1/merchant/team",
        );
        if (cancelled) return;

        setMembers(
          response.users.map((user) => {
            const role = toTeamRole(user.role);
            return {
              id: user.id,
              name: user.fullName,
              email: user.email,
              role,
              roleLabel: ROLE_LABELS[role],
              active: user.isActive,
              lastLoginAt: user.lastLoginAt,
              createdAt: user.createdAt,
              invited: false,
            };
          }),
        );
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof ApiError
            ? error.message
            : "The team list could not be loaded.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  function handleInvite(input: { name: string; email: string; role: MockRole }) {
    setInviting(true);
    setInviteError(null);

    const invited = mockInviteTeamMember(input);

    // The mock invite is added to the list straight away. It is marked as
    // invited so the reader can tell it apart from a real account.
    setMembers((current) => [
      ...current,
      {
        id: invited.id,
        name: invited.name,
        email: invited.email,
        role: invited.role,
        roleLabel: ROLE_LABELS[invited.role],
        active: true,
        lastLoginAt: null,
        createdAt: invited.joinedAt,
        invited: true,
      },
    ]);

    setInviting(false);
    setInviteOpen(false);

    toast({
      title: "Invitation recorded",
      description:
        "No email was sent. The invitation is a demo record so you can see how the member list behaves.",
      tone: "warning",
    });
  }

  function handleCreateRole(input: {
    name: string;
    description: string;
    permissions: string[];
  }) {
    setCreatingRole(true);
    setRoleError(null);

    const created = mockCreateCustomRole(input);
    setCustomRoles(mockFetchCustomRoles({ pageSize: 50 }).rows);

    setCreatingRole(false);
    setRoleOpen(false);

    toast({
      title: `Custom role created: ${created.name}`,
      description:
        "Custom roles are demo only — the backend has no role store to assign it to.",
      tone: "warning",
    });
  }

  function handleRemoveRole() {
    if (!pendingRemoval) return;
    setRemoving(true);
    mockDeleteCustomRole(pendingRemoval.id);
    setCustomRoles(mockFetchCustomRoles({ pageSize: 50 }).rows);
    setPendingRemoval(null);
    setRemoving(false);
    toast({
      title: "Custom role removed",
      description: "The demo role is no longer in your list.",
      tone: "info",
    });
  }

  const columns: Column<TeamRow>[] = [
    {
      key: "name",
      header: "Member",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-ink">{row.name}</p>
          <p className="truncate text-[12px] text-ink-muted">{row.email}</p>
        </div>
      ),
      sortValue: (row) => row.name,
    },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Badge tone={row.role === "OWNER" ? "brand" : "neutral"}>
            {row.roleLabel}
          </Badge>
          {row.invited ? <Badge tone="warning">Invited</Badge> : null}
        </div>
      ),
      sortValue: (row) => row.role,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge tone={row.active ? "success" : "danger"} dot>
          {row.active ? "Active" : "Disabled"}
        </Badge>
      ),
      sortValue: (row) => (row.active ? 1 : 0),
    },
    {
      key: "lastLogin",
      header: "Last seen",
      align: "right",
      render: (row) => (
        <span className="text-[13px] text-ink-muted">
          {row.lastLoginAt ? formatDateTime(row.lastLoginAt) : "Never signed in"}
        </span>
      ),
      sortValue: (row) => row.lastLoginAt ?? "",
    },
  ];

  const ownerCount = members.filter((row) => row.role === "OWNER").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Team"
        description="Who can see and change your business."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DemoBadge label="Demo roles and invites" />
            <Button
              size="sm"
              onClick={() => {
                setInviteError(null);
                setInviteOpen(true);
              }}
            >
              <UserPlus className="size-3.5" aria-hidden="true" />
              Invite member
            </Button>
          </div>
        }
      />

      <DemoNotice title="Real members, demo roles">
        The member list is read from the real users API, so it shows the
        accounts that actually belong to this merchant. Invitations are demo
        records, and custom roles have no backend to live in — both are stored
        in the demo dataset only.
      </DemoNotice>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Team members"
          value={String(members.length)}
          hint={`${ownerCount} owner${ownerCount === 1 ? "" : "s"}`}
          tone="info"
          icon={Users}
        />
        <StatCard
          label="Built-in roles"
          value={String(BUILT_IN_ROLES.length)}
          hint="Owner, Admin, Manager, Support, Viewer"
          tone="neutral"
          icon={ShieldCheck}
        />
        <StatCard
          label="Custom roles"
          value={String(customRoles.length)}
          hint="demo only"
          tone="warning"
          icon={ShieldCheck}
        />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "members", label: "Members", icon: Users },
          { id: "matrix", label: "Role permissions", icon: ShieldCheck },
          { id: "custom", label: "Custom roles", count: customRoles.length },
        ]}
      />

      <TabPanel id="members" value={tab}>
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              Everyone attached to this merchant account.
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
            <DataTable
              columns={columns}
              rows={members}
              loading={loading}
              error={loadError ?? undefined}
              showSearch
              searchPlaceholder="Search by name or email"
              emptyTitle="No members yet"
              emptyDescription="Invite a colleague to get started."
              emptyIcon={Users}
              hideExport
            />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel id="matrix" value={tab}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {BUILT_IN_ROLES.map((entry) => (
              <div
                key={entry.role}
                className="surface rounded-xl border p-4 shadow-card"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold text-ink">{entry.label}</p>
                  <Badge tone={entry.role === "OWNER" ? "brand" : "neutral"}>
                    {entry.role}
                  </Badge>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                  {entry.blurb}
                </p>
                <p className="mt-2 text-[12px] text-ink-faint">
                  {rolePermissions[entry.role].length} of{" "}
                  {permissions.length} permissions
                </p>
              </div>
            ))}
          </div>

          <Alert tone="info" title="What a role can do is set by the backend">
            This matrix is the reference the product describes. The backend
            enforces a smaller set of roles — owner, admin, operator and
            viewer — so an operator covers both the Manager and Support columns
            here. The difference is in the permissions the backend grants, not
            in what the interface shows.
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Permission matrix</CardTitle>
              <CardDescription>
                Every permission, and which built-in role holds it.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <RoleMatrix
                permissions={permissions}
                rolePermissions={rolePermissions}
              />
            </CardContent>
          </Card>
        </div>
      </TabPanel>

      <TabPanel id="custom" value={tab}>
        <Card>
          <CardHeader>
            <CardTitle>Custom roles</CardTitle>
            <CardDescription>
              Roles you define, each holding a set of permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert tone="warning" title="Custom roles are a demo">
              The backend has no role store, so a custom role cannot be assigned
              to anyone and does not change what a member can do. The role
              definitions below are stored in the demo dataset so the shape of
              the feature is visible.
            </Alert>

            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  setRoleError(null);
                  setRoleOpen(true);
                }}
              >
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                New custom role
              </Button>
            </div>

            {customRoles.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line-strong px-5 py-8 text-center">
                <p className="text-[13px] font-medium text-ink">
                  No custom roles yet
                </p>
                <p className="mt-1 text-[13px] text-ink-muted">
                  Create one to give a colleague exactly the access they need.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {customRoles.map((role) => (
                  <li
                    key={role.id}
                    className="flex flex-col gap-3 rounded-lg border border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-semibold text-ink">
                          {role.name}
                        </p>
                        <Badge tone="brand">Custom</Badge>
                      </div>
                      <p className="mt-1 text-[13px] text-ink-muted">
                        {role.description || "No description."}
                      </p>
                      <p className="mt-1 text-[12px] text-ink-faint">
                        {role.permissions.length} permissions ·{" "}
                        {role.memberCount} member
                        {role.memberCount === 1 ? "" : "s"} · created{" "}
                        {formatDate(role.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      className="shrink-0"
                      onClick={() => setPendingRemoval(role)}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Invite */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite a team member"
        description="They will get access to this merchant account."
      >
        <InviteForm
          error={inviteError}
          saving={inviting}
          onInvite={handleInvite}
        />
      </Modal>

      {/* Custom role */}
      <Modal
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        title="Create a custom role"
        description="Pick the permissions this role should carry."
        size="lg"
      >
        <CustomRoleForm
          permissions={permissions}
          saving={creatingRole}
          error={roleError}
          onSave={handleCreateRole}
          onCancel={() => setRoleOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={pendingRemoval !== null}
        title="Delete this custom role?"
        description={`"${pendingRemoval?.name}" will be removed from this browser session. It was a demo role, so no member loses access.`}
        confirmLabel="Delete role"
        loading={removing}
        onConfirm={handleRemoveRole}
        onCancel={() => setPendingRemoval(null)}
      />
    </div>
  );
}

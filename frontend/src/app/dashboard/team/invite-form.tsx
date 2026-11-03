"use client";

import * as React from "react";
import { Mail, UserPlus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";
import { INVITABLE_ROLES } from "@/lib/team-roles";
import type { MockRole } from "@/mock";
import { PermissionPicker } from "./role-matrix";

/**
 * The invite form.
 *
 * It is deliberately plain: a name, an email address and a role. The backend
 * accepts only admin, operator and viewer when it creates a user, so the role
 * list here is the set the API will actually accept.
 */
export function InviteForm({
  error,
  saving,
  onInvite,
}: {
  error: string | null;
  saving: boolean;
  onInvite: (input: { name: string; email: string; role: MockRole }) => void;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<MockRole>("VIEWER");
  const [localError, setLocalError] = React.useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (name.trim().length < 2) {
      setLocalError("Enter the person's name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLocalError("Enter a valid email address.");
      return;
    }

    setLocalError(null);
    onInvite({ name: name.trim(), email: email.trim().toLowerCase(), role });
  }

  const selected = INVITABLE_ROLES.find((entry) => entry.role === role);

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {localError || error ? (
        <Alert tone="danger">{localError ?? error}</Alert>
      ) : null}

      <div>
        <Label htmlFor="invite-name" required>
          Full name
        </Label>
        <Input
          id="invite-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Sadia Parvin"
          autoComplete="off"
        />
      </div>

      <div>
        <Label htmlFor="invite-email" required>
          Email address
        </Label>
        <Input
          id="invite-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="colleague@yourbusiness.test"
          autoComplete="off"
        />
      </div>

      <div>
        <Label htmlFor="invite-role" required>
          Role
        </Label>
        <Select
          id="invite-role"
          value={role}
          onChange={(event) => setRole(event.target.value as MockRole)}
        >
          {INVITABLE_ROLES.map((entry) => (
            <option key={entry.role} value={entry.role}>
              {entry.label}
            </option>
          ))}
        </Select>
        {selected?.note ? (
          <p className="mt-1.5 text-[13px] text-ink-muted">{selected.note}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" loading={saving}>
          <UserPlus className="size-4" aria-hidden="true" />
          Send invitation
        </Button>
      </div>

      <p className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-muted">
        <Mail className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        No email is sent from this prototype. The invitation is recorded in the
        demo dataset so you can see how the member list behaves.
      </p>
    </form>
  );
}

/**
 * The custom role editor.
 *
 * A custom role is a name, a description and a set of permissions drawn from
 * the same catalogue the built-in roles use.
 */
export function CustomRoleForm({
  permissions,
  onSave,
  saving,
  error,
  onCancel,
}: {
  permissions: { key: string; label: string; group: string }[];
  onSave: (input: {
    name: string;
    description: string;
    permissions: string[];
  }) => void;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
}) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [localError, setLocalError] = React.useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (name.trim().length < 2) {
      setLocalError("Give the role a name.");
      return;
    }
    if (selected.length === 0) {
      setLocalError("Choose at least one permission.");
      return;
    }

    setLocalError(null);
    onSave({
      name: name.trim(),
      description: description.trim(),
      permissions: selected,
    });
  }

  function toggle(key: string) {
    setSelected((current) =>
      current.includes(key)
        ? current.filter((entry) => entry !== key)
        : [...current, key],
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {localError || error ? (
        <Alert tone="danger">{localError ?? error}</Alert>
      ) : null}

      <div>
        <Label htmlFor="role-name" required>
          Role name
        </Label>
        <Input
          id="role-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Cashier"
          autoComplete="off"
        />
      </div>

      <div>
        <Label htmlFor="role-description">What the role is for</Label>
        <Input
          id="role-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Can create payment links and take payments at the counter."
          autoComplete="off"
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-[13px] font-medium text-ink-soft">
          Permissions
        </legend>
        <div className="max-h-72 overflow-y-auto rounded-lg border border-line p-3">
          <PermissionPicker
            permissions={permissions}
            selected={selected}
            onToggle={toggle}
          />
        </div>
      </fieldset>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Create role
        </Button>
      </div>
    </form>
  );
}

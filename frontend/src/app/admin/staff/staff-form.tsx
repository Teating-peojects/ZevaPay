"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";
import { adminStaffSchema, type AdminStaffValues } from "@/lib/schemas";

/**
 * The admin console's "invite a staff member" form.
 *
 * The record it creates lives in the demo layer. No invitation email is
 * sent — there is no mail service behind this — so the page says so.
 */
export function StaffForm({
  open,
  onClose,
  onSave,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (values: AdminStaffValues) => void;
  saving: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminStaffValues>({
    resolver: zodResolver(adminStaffSchema),
    defaultValues: { name: "", email: "", role: "VIEWER" },
  });

  function close() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Invite a staff member"
      description="Adds someone to the platform staff list."
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={close} type="button">
            Cancel
          </Button>
          <Button type="submit" form="invite-staff-form" loading={saving}>
            Send invitation
          </Button>
        </>
      }
    >
      <form
        id="invite-staff-form"
        onSubmit={handleSubmit(onSave)}
        noValidate
      >
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="staff-name" required>
              Name
            </Label>
            <Input
              id="staff-name"
              error={errors.name?.message}
              {...register("name")}
            />
          </div>

          <div>
            <Label htmlFor="staff-email" required>
              Email
            </Label>
            <Input
              id="staff-email"
              type="email"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div>
            <Label htmlFor="staff-role" required>
              Role
            </Label>
            <Select
              id="staff-role"
              error={errors.role?.message}
              {...register("role")}
            >
              <option value="SUPER_ADMIN">Super admin — full control</option>
              <option value="ADMIN">Admin — runs the platform</option>
              <option value="SUPPORT">Support — helps merchants</option>
              <option value="VIEWER">Viewer — read only</option>
            </Select>
          </div>
        </div>
      </form>
    </Modal>
  );
}

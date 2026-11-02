"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Monitor, Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/format";
import { apiFetch, ApiError } from "@/lib/api-client";
import {
  changePasswordSchema,
  merchantProfileSchema,
  type ChangePasswordValues,
  type MerchantProfileValues,
} from "@/lib/schemas";
import type { ApiMerchant, ApiSession, ApiUser } from "@/types/api";
import { ApiKeysCard } from "./api-keys-card";

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [merchant, setMerchant] = React.useState<ApiMerchant | null>(null);
  const [sessions, setSessions] = React.useState<ApiSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [passwordOpen, setPasswordOpen] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  const profileForm = useForm<MerchantProfileValues>({
    resolver: zodResolver(merchantProfileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      businessName: "",
    },
  });

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [reloadToken, setReloadToken] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      try {
        const [sessionResponse, settingsResponse, sessionsResponse] =
          await Promise.all([
            apiFetch<{ user: ApiUser; merchant: ApiMerchant | null }>(
              "/api/v1/auth/me",
            ),
            apiFetch<{ merchant: ApiMerchant }>("/api/v1/merchant/settings"),
            apiFetch<{ sessions: ApiSession[] }>("/api/v1/auth/sessions"),
          ]);

        if (cancelled) return;

        setMerchant(settingsResponse.merchant);
        setSessions(sessionsResponse.sessions);

        profileForm.reset({
          fullName: sessionResponse.user.fullName,
          email: sessionResponse.user.email,
          phone: sessionResponse.user.phone ?? "",
          businessName: settingsResponse.merchant.businessName,
        });
      } catch {
        if (cancelled) return;
        toast({
          title: "Could not load your settings",
          description: "Please refresh the page and try again.",
          tone: "error",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchSettings();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadToken]);

  async function onSaveProfile(values: MerchantProfileValues) {
    try {
      await apiFetch("/api/v1/auth/profile", {
        method: "PATCH",
        body: {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
        },
      });
      await apiFetch("/api/v1/merchant/settings", {
        method: "PATCH",
        body: { businessName: values.businessName },
      });

      toast({
        title: "Profile updated",
        description: "Your details were saved.",
        tone: "success",
      });
      setReloadToken((token) => token + 1);
    } catch (error) {
      if (error instanceof ApiError) {
        const fields = error.fieldErrors;
        if (fields.fullName) {
          profileForm.setError("fullName", { message: fields.fullName });
        }
        if (fields.email) {
          profileForm.setError("email", { message: fields.email });
        }
        if (fields.phone) {
          profileForm.setError("phone", { message: fields.phone });
        }
        if (fields.businessName) {
          profileForm.setError("businessName", { message: fields.businessName });
        }
        toast({
          title: "Could not save the profile",
          description: error.message,
          tone: "error",
        });
        return;
      }
      toast({
        title: "Could not save the profile",
        description: "Please try again.",
        tone: "error",
      });
    }
  }

  async function onChangePassword(values: ChangePasswordValues) {
    setPasswordError(null);

    try {
      await apiFetch("/api/v1/auth/change-password", {
        method: "POST",
        body: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      });

      toast({
        title: "Password updated",
        description:
          "Your password was changed and every other session was signed out. Please sign in again.",
        tone: "success",
      });
      passwordForm.reset();
      setPasswordOpen(false);
      router.push("/login");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = error.fieldErrors;
        if (fieldErrors.currentPassword) {
          passwordForm.setError("currentPassword", {
            message: fieldErrors.currentPassword,
          });
        }
        if (fieldErrors.newPassword) {
          passwordForm.setError("newPassword", {
            message: fieldErrors.newPassword,
          });
        }
        setPasswordError(error.message);
        return;
      }
      setPasswordError("We could not reach the server. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, security, and API access."
      />

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            The business details shown across your ZevaPay account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit(onSaveProfile)}
            noValidate
          >
            <div className="flex flex-col gap-5">
              <div>
                <Label htmlFor="profile-full-name" required>
                  Full name
                </Label>
                <Input
                  id="profile-full-name"
                  disabled={loading}
                  error={profileForm.formState.errors.fullName?.message}
                  {...profileForm.register("fullName")}
                />
              </div>

              <div>
                <Label htmlFor="profile-email" required>
                  Email
                </Label>
                <Input
                  id="profile-email"
                  type="email"
                  disabled={loading}
                  error={profileForm.formState.errors.email?.message}
                  {...profileForm.register("email")}
                />
              </div>

              <div>
                <Label htmlFor="profile-phone">Mobile number</Label>
                <Input
                  id="profile-phone"
                  inputMode="numeric"
                  placeholder="01712345678"
                  disabled={loading}
                  error={profileForm.formState.errors.phone?.message}
                  {...profileForm.register("phone")}
                />
              </div>

              <div>
                <Label htmlFor="profile-business" required>
                  Business name
                </Label>
                <Input
                  id="profile-business"
                  disabled={loading}
                  error={profileForm.formState.errors.businessName?.message}
                  {...profileForm.register("businessName")}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={profileForm.formState.isSubmitting}
                >
                  Save changes
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Password and session details for your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                <KeyRound
                  className="size-4 text-ink-soft"
                  aria-hidden="true"
                />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">Password</p>
                <p className="mt-0.5 text-[13px] text-ink-muted">
                  Changing your password signs out every other session.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setPasswordOpen(true)}
              className="shrink-0"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              Change password
            </Button>
          </div>

          <div className="rounded-lg border border-neutral-200">
            <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
              <Monitor
                className="size-4 shrink-0 text-ink-muted"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-ink">Active sessions</p>
            </div>
            {sessions.length === 0 ? (
              <p className="px-4 py-4 text-[13px] text-ink-muted">
                No active sessions were found.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {sessions.map((session) => (
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
          </div>
        </CardContent>
      </Card>

      {/* API configuration */}
      <ApiKeysCard />

      {/* Change password modal */}
      <Modal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Change password"
        description="Changing your password signs out every other session."
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setPasswordOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="change-password-form"
              loading={passwordForm.formState.isSubmitting}
            >
              Update password
            </Button>
          </>
        }
      >
        <form
          id="change-password-form"
          onSubmit={passwordForm.handleSubmit(onChangePassword)}
          noValidate
        >
          {passwordError ? (
            <Alert tone="danger" className="mb-5">
              {passwordError}
            </Alert>
          ) : null}

          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="current-password" required>
                Current password
              </Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                error={
                  passwordForm.formState.errors.currentPassword?.message
                }
                {...passwordForm.register("currentPassword")}
              />
            </div>
            <div>
              <Label htmlFor="new-password" required>
                New password
              </Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                error={passwordForm.formState.errors.newPassword?.message}
                hint="At least 10 characters, one uppercase letter, one lowercase letter, and one number."
                {...passwordForm.register("newPassword")}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password" required>
                Confirm new password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                error={
                  passwordForm.formState.errors.confirmPassword?.message
                }
                {...passwordForm.register("confirmPassword")}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Merchant status, shown for context. */}
      {merchant ? (
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Where your merchant record currently stands.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-3 text-[13px] sm:flex-row sm:flex-wrap sm:gap-x-12">
              <div>
                <dt className="text-ink-muted">Status</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {merchant.status.replace("_", " ")}
                </dd>
              </div>
              <div>
                <dt className="text-ink-muted">Plan</dt>
                <dd className="mt-0.5 font-medium text-ink">{merchant.plan}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Country</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {merchant.country}
                </dd>
              </div>
              <div>
                <dt className="text-ink-muted">Registered</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {formatDateTime(merchant.registrationDate)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

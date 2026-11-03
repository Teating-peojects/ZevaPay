import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { TwoFactorForm } from "./two-factor-form";

export const metadata: Metadata = {
  title: "Two-factor verification",
  description: "Confirm the second factor for your ZevaPay account.",
};

export default function TwoFactorPage() {
  return (
    <AuthShell
      title="Two-factor verification"
      subtitle="One more step before you reach your dashboard."
      footer={
        <>
          Having trouble?{" "}
          <Link
            href="/contact"
            className="font-medium text-brand-link underline underline-offset-2 hover:text-brand-link-hover"
          >
            Contact support
          </Link>
        </>
      }
    >
      <TwoFactorForm />
    </AuthShell>
  );
}

import Link from "next/link";
import { ArrowRight, Activity, Settings2, ToggleLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DemoBadge } from "@/components/ui/demo-badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AREAS = [
  { title: "System health", description: "Sample service status, resource readings and recent incidents.", href: "/admin/health", icon: Activity },
  { title: "Feature flags", description: "Review demo rollout flags and their audiences.", href: "/admin/feature-flags", icon: ToggleLeft },
  { title: "Platform settings", description: "Manage your administrator profile and inspect platform limits.", href: "/admin/settings", icon: Settings2 },
];

export default function AdminSystemPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="System settings" description="Platform operations and configuration." actions={<DemoBadge label="Sample controls" />} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {AREAS.map(({ title, description, href, icon: Icon }) => (
          <Link key={href} href={href} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-link">
            <Card className="h-full transition-colors group-hover:border-brand-link/40">
              <CardHeader>
                <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-brand-tint text-brand-link"><Icon className="size-4" aria-hidden="true" /></div>
                <CardTitle className="flex items-center justify-between gap-3">{title}<ArrowRight className="size-4 text-ink-faint transition-transform group-hover:translate-x-0.5" /></CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      <p className="text-xs text-ink-muted">Operational values and feature flags shown in these screens are sample data until platform configuration APIs are available.</p>
    </div>
  );
}

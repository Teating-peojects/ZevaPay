import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const footerSections = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Supported methods", href: "/#supported" },
    ],
  },
  {
    title: "Dashboards",
    links: [
      { label: "Merchant portal", href: "/dashboard" },
      { label: "Admin portal", href: "/admin" },
      { label: "Login", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Logo href="/" showTagline />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              Simple payment management for Bangladeshi merchants using bKash,
              Nagad, Rocket, and Upay.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-[13px] font-semibold tracking-wide text-ink uppercase">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-ink-muted">
            © 2026 ZevaPay. All rights reserved.
          </p>
          <p className="text-[13px] text-ink-muted">
            ZevaPay records notifications. It does not settle payments.
          </p>
        </div>
      </div>
    </footer>
  );
}

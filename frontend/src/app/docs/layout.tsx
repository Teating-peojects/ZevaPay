import type { Metadata } from "next";
import { PublicLayout } from "@/components/marketing/public-layout";
import { DocsSearch } from "@/components/docs/docs-search";
import { DocsSidebar } from "@/components/docs/docs-sidebar";

export const metadata: Metadata = {
  title: {
    default: "Developer docs",
    template: "%s | ZevaPay docs",
  },
  description:
    "The ZevaPay developer documentation: how the API is authenticated, how a payment is requested, what a webhook contains, and every error code the API can return.",
};

/**
 * The shell every documentation page lives in.
 *
 * The sidebar is fixed and the content column scrolls beside it, so a reader
 * who lands on a deep-linked heading still has the whole table of contents
 * one click away.
 */
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:py-14">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 flex flex-col gap-6">
            <DocsSearch />
            <DocsSidebar />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-8 lg:hidden">
            <DocsSearch />
          </div>

          {children}
        </div>
      </div>
    </PublicLayout>
  );
}

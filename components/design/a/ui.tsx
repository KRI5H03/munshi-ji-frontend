import Link from "next/link";
import { ChevronDown, FileText, Plus, Settings, Tag, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { btnPrimary } from "@/components/ui/kit";
import { business } from "@/lib/mock";

const BASE = "/design/a";

const NAV = [
  { slug: "bills", label: "Bills", short: "Bills", icon: FileText },
  { slug: "customers", label: "Customers", short: "Customers", icon: Users },
  { slug: "items", label: "Items", short: "Items", icon: Tag },
  { slug: "settings", label: "Firm settings", short: "Firm", icon: Settings },
] as const;

export type Section = (typeof NAV)[number]["slug"] | "new-bill";

function FirmSwitch({ className }: { className?: string }) {
  return (
    <Link
      href="/design"
      className={cn(
        "flex min-h-12 items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-2 text-left hover:bg-muted",
        className,
      )}
    >
      <span className="min-w-0">
        <span className="block truncate font-bold">{business.name}</span>
        <span className="block text-muted-foreground">Switch firm</span>
      </span>
      <ChevronDown className="size-5 shrink-0" aria-hidden />
    </Link>
  );
}

export function AShell({ active, children }: { active: Section; children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100dvh-2.25rem)] lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-[calc(100dvh-2.25rem)] flex-col gap-2 border-r border-border bg-card p-4 lg:flex">
        <FirmSwitch className="mb-4" />
        <Link
          href={`${BASE}/new-bill`}
          aria-current={active === "new-bill" ? "page" : undefined}
          className={cn(btnPrimary, "mb-4 justify-start", active === "new-bill" && "ring-3 ring-ring/30")}
        >
          <Plus className="size-5" aria-hidden />
          New bill
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ slug, label, icon: Icon }) => (
            <Link
              key={slug}
              href={`${BASE}/${slug}`}
              aria-current={active === slug ? "page" : undefined}
              className={cn(
                "flex h-12 items-center gap-3 rounded-lg px-4 text-lg font-medium hover:bg-muted",
                active === slug && "bg-accent font-semibold text-accent-foreground hover:bg-accent",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
          <FirmSwitch className="min-w-0 flex-1" />
          <Link href={`${BASE}/new-bill`} className={btnPrimary}>
            <Plus className="size-5" aria-hidden />
            New bill
          </Link>
        </header>
        <main className="px-4 pt-6 pb-28 lg:px-8 lg:pt-8 lg:pb-12">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t border-border bg-card lg:hidden">
        {NAV.map(({ slug, short, icon: Icon }) => (
          <Link
            key={slug}
            href={`${BASE}/${slug}`}
            aria-current={active === slug ? "page" : undefined}
            className={cn(
              "flex h-16 flex-col items-center justify-center gap-1 text-base font-medium text-muted-foreground",
              active === slug && "font-semibold text-accent-foreground",
            )}
          >
            <Icon className="size-5" aria-hidden />
            {short}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export * from "@/components/ui/kit";

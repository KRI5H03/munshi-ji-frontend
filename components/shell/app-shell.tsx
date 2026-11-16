"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, LogOut, Menu, Plus } from "lucide-react";
import { toast } from "sonner";
import { btnPrimary } from "@/components/ui/kit";
import { PHONE_BAR_SLOTS, SECTIONS, activeTab, sectionFor } from "@/components/shell/nav";
import { clearSession, currentBusiness, useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

function FirmSwitch({ className }: { className?: string }) {
  const session = useSession();
  const firm = currentBusiness(session);
  const many = (session?.businesses.length ?? 0) > 1;
  const body = (
    <>
      <span className="min-w-0">
        <span className="block truncate font-bold">{firm?.name ?? " "}</span>
        <span className={cn("block text-muted-foreground", !many && "capitalize")}>
          {many ? "Switch firm" : (firm?.role ?? " ")}
        </span>
      </span>
      {many && <ChevronsUpDown className="size-5 shrink-0" aria-hidden />}
    </>
  );
  const box =
    "flex min-h-12 items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-2 text-left";
  return many ? (
    <Link href="/firms" className={cn(box, "hover:bg-muted", className)}>
      {body}
    </Link>
  ) : (
    <div className={cn(box, className)}>{body}</div>
  );
}

function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return () => {
    clearSession();
    queryClient.clear();
    toast.success("Logged out");
    router.replace("/login");
  };
}

function SectionTabs({ pathname }: { pathname: string }) {
  const section = sectionFor(pathname);
  if (!section || section.tabs.length === 0) return null;
  const current = activeTab(section, pathname);
  return (
    <nav aria-label={section.label} className="border-b border-border bg-card px-4 lg:px-8">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {section.tabs.map((tab) => {
          const active = tab === current;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-12 items-center border-b-[3px] border-transparent px-4 font-medium whitespace-nowrap text-muted-foreground transition-colors duration-150 hover:text-foreground",
                  active && "border-primary font-semibold text-accent-foreground hover:text-accent-foreground",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function PhoneBar({ pathname, onLogout }: { pathname: string | null; onLogout: () => void }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const active = pathname ? sectionFor(pathname) : undefined;
  // "More" always exists on the phone: it holds the sections that do not fit, and Log out.
  const shown = SECTIONS.slice(0, PHONE_BAR_SLOTS - 1);
  const rest = SECTIONS.slice(PHONE_BAR_SLOTS - 1);
  const item = "flex h-16 flex-col items-center justify-center gap-1 font-medium text-muted-foreground";

  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-20 lg:hidden">
      {moreOpen && (
        <div className="border-t border-border bg-card p-2 shadow-[0_-8px_24px_rgb(0_0_0/0.08)]">
          {rest.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMoreOpen(false)}
              className="flex h-12 items-center gap-3 rounded-lg px-4 text-lg font-medium hover:bg-muted"
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={onLogout}
            className="flex h-12 w-full items-center gap-3 rounded-lg px-4 text-lg font-medium hover:bg-muted"
          >
            <LogOut className="size-5" aria-hidden />
            Log out
          </button>
        </div>
      )}
      <nav
        aria-label="Main"
        className="grid border-t border-border bg-card"
        style={{ gridTemplateColumns: `repeat(${shown.length + 1}, minmax(0, 1fr))` }}
      >
        {shown.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            aria-current={s === active ? "page" : undefined}
            onClick={() => setMoreOpen(false)}
            className={cn(item, s === active && "font-semibold text-accent-foreground")}
          >
            <s.icon className="size-5" aria-hidden />
            {s.short}
          </Link>
        ))}
        <button
          type="button"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((open) => !open)}
          className={cn(
            item,
            (moreOpen || (active && rest.includes(active))) && "font-semibold text-accent-foreground",
          )}
        >
          <Menu className="size-5" aria-hidden />
          More
        </button>
      </nav>
    </div>
  );
}

/**
 * Reads the current address. Wrapped in Suspense wherever it is used: on a page whose
 * id is only known at request time (like /bills/[id]) the address cannot be prerendered,
 * so the fallback (the same UI with nothing highlighted) is prerendered instead.
 */
function WithPathname({ render }: { render: (pathname: string | null) => React.ReactNode }) {
  return render(usePathname());
}

function Live({ render }: { render: (pathname: string | null) => React.ReactNode }) {
  return (
    <Suspense fallback={render(null)}>
      <WithPathname render={render} />
    </Suspense>
  );
}

function SidebarNav({ pathname, onLogout }: { pathname: string | null; onLogout: () => void }) {
  const active = pathname ? sectionFor(pathname) : undefined;
  const onNewBill = pathname === "/bills/new";
  return (
    <>
      <Link
        href="/bills/new"
        aria-current={onNewBill ? "page" : undefined}
        className={cn(btnPrimary, "mb-4 shrink-0 justify-start", onNewBill && "ring-3 ring-ring/30")}
      >
        <Plus className="size-5" aria-hidden />
        New bill
      </Link>
      <nav aria-label="Main" className="flex flex-col gap-1">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            aria-current={s === active ? "page" : undefined}
            className={cn(
              "flex h-12 shrink-0 items-center gap-3 rounded-lg px-4 text-lg font-medium hover:bg-muted",
              s === active && "bg-accent font-semibold text-accent-foreground hover:bg-accent",
            )}
          >
            <s.icon className="size-5" aria-hidden />
            {s.label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        onClick={onLogout}
        className="mt-auto flex h-12 shrink-0 items-center gap-3 rounded-lg px-4 text-lg font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <LogOut className="size-5" aria-hidden />
        Log out
      </button>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const logout = useLogout();

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      <aside className="no-print sticky top-0 hidden h-dvh flex-col gap-2 overflow-y-auto border-r border-border bg-card p-4 lg:flex">
        <FirmSwitch className="mb-4" />
        <Live render={(pathname) => <SidebarNav pathname={pathname} onLogout={logout} />} />
      </aside>

      <div className="min-w-0">
        <header className="no-print flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
          <FirmSwitch className="min-w-0 flex-1" />
          <Link href="/bills/new" className={btnPrimary}>
            <Plus className="size-5" aria-hidden />
            New bill
          </Link>
        </header>
        <Live render={(pathname) => (pathname ? <SectionTabs pathname={pathname} /> : null)} />
        <main className="px-4 pt-6 pb-28 lg:px-8 lg:pt-8 lg:pb-12">{children}</main>
      </div>

      <Live render={(pathname) => <PhoneBar pathname={pathname} onLogout={logout} />} />
    </div>
  );
}

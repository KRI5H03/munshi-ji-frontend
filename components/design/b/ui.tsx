import { useId } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/money";
import { TODAY, business } from "@/lib/mock";

const BASE = "/design/b";

const NAV = [
  { slug: "bills", label: "Bills", keys: "Alt+1" },
  { slug: "customers", label: "Customers", keys: "Alt+2" },
  { slug: "items", label: "Items", keys: "Alt+3" },
  { slug: "settings", label: "Firm", keys: "Alt+4" },
] as const;

export type Section = (typeof NAV)[number]["slug"] | "new-bill";

/** Focus is a yellow fill and a black edge, never a soft ring. */
const focusCls = "focus-visible:border-black focus-visible:bg-accent focus-visible:ring-0";
export const focusedCls = "border-black bg-accent outline-2 -outline-offset-2 outline-black";
export const inputCls = cn(
  "h-11 rounded-none border-input bg-white px-2 text-base md:text-base transition-none",
  focusCls,
);
export const selectCls =
  "h-11 w-full border border-input bg-white px-2 text-base outline-none focus-visible:border-black focus-visible:bg-accent";
export const btn =
  "inline-flex h-11 items-center justify-center gap-2 border border-black bg-white px-4 text-base font-semibold whitespace-nowrap outline-none hover:bg-muted focus-visible:bg-accent";
export const btnPrimary = cn(btn, "border-primary bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black");
export const mono = "font-mono";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn("border border-current px-1.5 font-mono text-[15px] leading-6 font-medium", className)}>
      {children}
    </kbd>
  );
}

export type KeyHint = [keys: string, label: string];

export function BShell({
  active,
  keys,
  children,
}: {
  active: Section;
  keys: KeyHint[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-2.25rem)] flex-col">
      <header className="border-b-2 border-black">
        <div className="flex flex-wrap items-stretch">
          <Link
            href={`${BASE}/login`}
            className="flex h-11 min-w-0 flex-1 items-center gap-2 px-3 font-bold md:flex-none md:border-r md:border-border"
          >
            <span className="truncate">{business.name}</span>
            <span aria-hidden>▾</span>
            <span className="sr-only">Switch firm</span>
          </Link>
          <Link
            href={`${BASE}/new-bill`}
            aria-current={active === "new-bill" ? "page" : undefined}
            className={cn(
              "flex h-11 items-center gap-2 bg-primary px-4 font-semibold text-primary-foreground",
              active === "new-bill" && "underline decoration-2 underline-offset-4",
            )}
          >
            New bill
            <Kbd className="hidden md:inline">Ctrl+N</Kbd>
          </Link>
          <nav className="order-last grid w-full grid-cols-4 border-t border-border md:order-none md:flex md:w-auto md:border-t-0">
            {NAV.map(({ slug, label, keys: k }) => (
              <Link
                key={slug}
                href={`${BASE}/${slug}`}
                aria-current={active === slug ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center justify-center gap-2 px-3 font-medium hover:bg-muted md:border-r md:border-border md:px-4",
                  active === slug && "bg-black font-semibold text-white hover:bg-black",
                )}
              >
                {label}
                <Kbd className="hidden lg:inline">{k}</Kbd>
              </Link>
            ))}
          </nav>
          <p className={cn(mono, "ml-auto hidden h-11 items-center px-3 text-muted-foreground xl:flex")}>
            FY 2026-27, {formatDate(TODAY)}
          </p>
        </div>
      </header>

      <main className="flex-1 p-3 md:p-4 md:pb-16">{children}</main>

      <footer className="fixed inset-x-0 bottom-0 hidden h-11 items-center gap-5 overflow-hidden border-t-2 border-black bg-white px-4 md:flex">
        {keys.map(([k, label]) => (
          <span key={k} className="flex items-center gap-2 whitespace-nowrap">
            <Kbd>{k}</Kbd>
            {label}
          </span>
        ))}
      </footer>
    </div>
  );
}

/** A ruled pane with an inverted title strip. */
export function Pane({
  title,
  right,
  className,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("border border-black", className)}>
      <div className="flex min-h-9 items-center justify-between gap-3 bg-black px-3 py-1 text-white">
        <h2 className="font-semibold">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

/** Label on the left, field on the right; stacks on a phone. */
export function Row({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-x-3 gap-y-1 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:items-center">
      <label htmlFor={htmlFor} className="font-medium">
        {label}
      </label>
      {children}
      {(error || hint) && (
        <p className={cn("sm:col-start-2", error ? "font-semibold text-destructive" : "text-muted-foreground")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function Field({
  label,
  error,
  hint,
  focused,
  className,
  ...props
}: React.ComponentProps<"input"> & { label: string; error?: string; hint?: string; focused?: boolean }) {
  const id = useId();
  return (
    <Row label={label} htmlFor={id} error={error} hint={hint}>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(inputCls, focused && focusedCls, error && "border-destructive", className)}
        {...props}
      />
    </Row>
  );
}

export const th = "border-b border-black bg-muted px-2 py-2 text-left font-semibold whitespace-nowrap";
export const td = "border-b border-border px-2 py-2";
export const selectedRow = "bg-accent";

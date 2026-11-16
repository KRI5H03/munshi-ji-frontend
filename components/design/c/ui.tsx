import { useId } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { business } from "@/lib/mock";

const BASE = "/design/c";

const NAV = [
  { slug: "bills", label: "Bills" },
  { slug: "customers", label: "Customers" },
  { slug: "items", label: "Items" },
  { slug: "settings", label: "Firm" },
] as const;

export type Section = (typeof NAV)[number]["slug"];

export const inputCls =
  "h-14 rounded-md border-input bg-card px-4 text-lg md:text-lg transition-colors duration-150 focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground";
export const selectCls =
  "h-14 w-full rounded-md border border-input bg-card px-3 text-lg outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground";
export const btn =
  "inline-flex h-14 items-center justify-center gap-2 rounded-md px-6 text-lg font-bold whitespace-nowrap outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2";
/** Red is kept for the one main action on a screen, and the grand total. */
export const btnPrimary = cn(btn, "bg-primary text-primary-foreground hover:bg-primary/90");
export const btnPlain = cn(btn, "border-2 border-foreground bg-card text-foreground hover:bg-muted");
export const mono = "font-mono";

/** The everyday shell: firm, four plain tabs, one New bill button. */
export function CShell({ active, children }: { active: Section; children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100dvh-2.25rem)]">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4">
          <Link href={`${BASE}/login`} className="min-w-0 py-2 leading-tight md:pr-4">
            <span className="block truncate font-bold">{business.name}</span>
            <span className="block text-base text-muted-foreground underline underline-offset-4">Change firm</span>
          </Link>
          <nav className="hidden self-stretch md:flex">
            {NAV.map(({ slug, label }) => (
              <Link
                key={slug}
                href={`${BASE}/${slug}`}
                aria-current={active === slug ? "page" : undefined}
                className={cn(
                  "flex items-center border-b-4 border-transparent px-5 pt-1 text-muted-foreground hover:text-foreground",
                  active === slug && "border-foreground font-bold text-foreground",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link href={`${BASE}/new-bill`} className={cn(btnPrimary, "my-3 ml-auto h-12 md:h-14")}>
            New bill
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-8 pb-32 md:pb-16">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t border-border bg-card md:hidden">
        {NAV.map(({ slug, label }) => (
          <Link
            key={slug}
            href={`${BASE}/${slug}`}
            aria-current={active === slug ? "page" : undefined}
            className={cn(
              "flex h-16 items-center justify-center border-t-4 border-transparent text-base text-muted-foreground",
              active === slug && "border-foreground font-bold text-foreground",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

/** One job on the screen: no tabs, a way back, and the actions pinned to the bottom. */
export function CTask({
  title,
  backHref,
  backLabel,
  actions,
  children,
}: {
  title: string;
  backHref: string;
  backLabel: string;
  actions: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100dvh-2.25rem)]">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4">
          <h1 className="text-2xl font-bold">{title}</h1>
          <Link href={backHref} className="flex h-12 items-center underline underline-offset-4">
            {backLabel}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-48 sm:pb-36">{children}</main>
      <div className="fixed inset-x-0 bottom-0 border-t-2 border-foreground bg-card">
        <div className="mx-auto max-w-3xl px-4 py-3">{actions}</div>
      </div>
    </div>
  );
}

export function Sheet({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("rounded-md border border-border bg-card", className)} {...props} />;
}

export function FieldShell({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 block font-bold">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-2 border-l-4 border-destructive pl-3 font-bold text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-2 text-base text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  className,
  inputClassName,
  ...props
}: React.ComponentProps<"input"> & {
  label: string;
  hint?: string;
  error?: string;
  inputClassName?: string;
}) {
  const id = useId();
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} error={error} className={className}>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(inputCls, error && "border-2 border-destructive", inputClassName)}
        {...props}
      />
    </FieldShell>
  );
}

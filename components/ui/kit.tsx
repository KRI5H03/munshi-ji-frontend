import { useId } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const inputCls =
  "h-12 rounded-lg border-input bg-card px-4 text-base md:text-base transition-colors duration-150";
export const selectCls =
  "h-12 w-full rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
export const btn =
  "inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-base font-semibold whitespace-nowrap outline-none transition-colors duration-150 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60";
export const btnPrimary = cn(btn, "bg-primary text-primary-foreground hover:bg-primary/90");
export const btnOutline = cn(btn, "border border-input bg-card text-foreground hover:bg-muted");
export const btnDanger = cn(btn, "border border-destructive/40 bg-card text-destructive hover:bg-destructive/5");

/**
 * Top of every page: title (and a short line under it) on the left, actions on the right.
 * List pages pass their actions with the primary one last, the only filled button.
 * Create and edit pages pass `back`, a link above the title to the section's list.
 */
export function PageHeader({
  title,
  sub,
  back,
  actions,
}: {
  title: string;
  sub?: string;
  back?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {back && <div className="mb-3">{back}</div>}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {sub && <p className="mt-1 text-lg text-muted-foreground">{sub}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("rounded-xl border border-border bg-card p-5 sm:p-6", className)} {...props} />;
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
      <Label htmlFor={htmlFor} className="mb-2 text-base font-medium">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="mt-2 font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-2 text-muted-foreground">{hint}</p>
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
      <Input id={id} aria-invalid={error ? true : undefined} className={cn(inputCls, inputClassName)} {...props} />
    </FieldShell>
  );
}

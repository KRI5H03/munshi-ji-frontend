"use client";

import { CircleAlert, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, btnOutline, inputCls } from "@/components/ui/kit";
import { errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";

/** The search box at the top of a list. Esc or the X clears it. */
export function ListSearch({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <search className="relative block">
      <Search
        className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onChange("");
        }}
        maxLength={100}
        aria-label={label}
        placeholder={placeholder}
        className={cn(inputCls, "pr-12 pl-12 [&::-webkit-search-cancel-button]:hidden")}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" aria-hidden />
        </button>
      )}
    </search>
  );
}

/** Nothing to show: say why, and offer the next step. */
export function ListMessage({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <Card className="flex flex-col items-start gap-4">
      <p className="text-xl font-bold">{title}</p>
      {children}
    </Card>
  );
}

/** The list could not be loaded. */
export function ListError({ what, error, onRetry }: { what: string; error: unknown; onRetry: () => void }) {
  return (
    <Card className="flex flex-col items-start gap-4 border-destructive/30" role="alert">
      <p className="flex items-start gap-3 text-lg font-medium text-destructive">
        <CircleAlert className="mt-1 size-5 shrink-0" aria-hidden />
        {what} could not be loaded. {errorMessage(error)}
      </p>
      <button type="button" className={btnOutline} onClick={onRetry}>
        Try again
      </button>
    </Card>
  );
}

/** Grey rows while a list loads: a table on wider screens, cards on a phone. */
export function ListPlaceholder({ label, columns }: { label: string; columns: string[] }) {
  return (
    <div role="status" aria-label={label}>
      <Card className="hidden p-0 sm:block sm:p-0">
        <div className="h-12 border-b border-border bg-muted/60" />
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-6 border-b border-border px-6 py-4 last:border-b-0">
            {columns.map((width, j) => (
              <span key={j} className={cn("h-5 animate-pulse rounded-md bg-muted", width)} />
            ))}
          </div>
        ))}
      </Card>
      <ul className="grid gap-3 sm:hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CircleAlert, Plus, Search, X } from "lucide-react";
import { PrimaryAction } from "@/components/shell/list-actions";
import { GuardedLink } from "@/components/shell/navigation-guard";
import { Card, PageHeader, btnOutline, btnPrimary, inputCls } from "@/components/ui/kit";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useFirmId } from "@/hooks/use-firm-id";
import { errorMessage } from "@/lib/api/client";
import { SALES_LIMIT, listSales } from "@/lib/api/sales";
import { formatDate, formatRupees, todayIso } from "@/lib/money";
import { keys } from "@/lib/query";
import type { SaleRow } from "@/lib/types";
import { cn } from "@/lib/utils";

function useSales(search: string) {
  const firmId = useFirmId();
  return useQuery({
    queryKey: keys.salesSearch(firmId ?? "", search),
    queryFn: ({ signal }) => listSales(search, signal),
    enabled: Boolean(firmId),
    // While a new search loads, keep showing the last result instead of flashing placeholders.
    placeholderData: keepPreviousData,
  });
}

function todaysBills(sales: SaleRow[], today: string): SaleRow[] {
  return sales.filter((s) => s.date === today && s.status === "active");
}

function Today() {
  // The unsearched list: shared with the list below when the search box is empty.
  const { data, isError } = useSales("");
  // The date is read only once bills are here, which is always in the browser, never while prerendering.
  const todays = data && todaysBills(data, todayIso());
  const count = todays?.length;
  const total = todays?.reduce((sum, s) => sum + s.grandTotal, 0);

  const value = (text: string | undefined) =>
    text === undefined ? (
      isError ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        <span aria-hidden className="mt-2 block h-8 w-28 animate-pulse rounded-md bg-muted" />
      )
    ) : (
      text
    );

  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-busy={data === undefined && !isError}>
      <Card>
        <p className="text-muted-foreground">Bills today</p>
        <p className="num mt-1 text-3xl font-bold">{value(count?.toString())}</p>
      </Card>
      <Card>
        <p className="text-muted-foreground">Sales today</p>
        <p className="num mt-1 text-3xl font-bold">{value(total === undefined ? undefined : formatRupees(total))}</p>
      </Card>
    </div>
  );
}

function Amount({ sale, className }: { sale: SaleRow; className?: string }) {
  const cancelled = sale.status === "cancelled";
  return (
    <span className={cn("num font-bold whitespace-nowrap", cancelled && "text-muted-foreground line-through", className)}>
      {formatRupees(sale.grandTotal)}
    </span>
  );
}

function CancelledLabel() {
  return (
    <span className="inline-flex items-center rounded-md border border-destructive/30 bg-destructive/5 px-2 text-sm font-semibold text-destructive">
      Cancelled
    </span>
  );
}

function BillsTable({ sales }: { sales: SaleRow[] }) {
  return (
    <Card className="hidden overflow-hidden p-0 sm:block sm:p-0">
      <table className="w-full text-left">
        <thead className="border-b border-border bg-muted/60 text-muted-foreground">
          <tr>
            <th className="px-6 py-3 font-semibold">Bill no.</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Customer</th>
            <th className="px-4 py-3 text-right font-semibold">Amount</th>
            <th className="px-6 py-3">
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sales.map((s) => (
            <tr key={s.id}>
              <td className="num px-6 py-3 text-lg font-bold whitespace-nowrap">{s.invoiceNo}</td>
              <td className="num px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDate(s.date)}</td>
              <td className="px-4 py-3">
                <span className="flex flex-wrap items-center gap-2">
                  {s.billedToName}
                  {s.status === "cancelled" && <CancelledLabel />}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Amount sale={s} className="text-lg" />
              </td>
              <td className="px-6 py-3 text-right">
                <GuardedLink href={`/bills/${s.id}`} className={btnOutline} aria-label={`Open or print bill ${s.invoiceNo}`}>
                  Open / Print
                </GuardedLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function BillCards({ sales }: { sales: SaleRow[] }) {
  return (
    <ul className="grid gap-3 sm:hidden">
      {sales.map((s) => (
        <li key={s.id}>
          <GuardedLink
            href={`/bills/${s.id}`}
            className="block rounded-xl border border-border bg-card p-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="flex items-baseline justify-between gap-3">
              <span className="num text-lg font-bold">{s.invoiceNo}</span>
              <Amount sale={s} className="text-lg" />
            </span>
            <span className="mt-1 block">{s.billedToName}</span>
            <span className="mt-1 flex items-center justify-between gap-3">
              <span className="num text-muted-foreground">{formatDate(s.date)}</span>
              {s.status === "cancelled" && <CancelledLabel />}
            </span>
          </GuardedLink>
        </li>
      ))}
    </ul>
  );
}

function Placeholder() {
  return (
    <div role="status" aria-label="Loading bills">
      <Card className="hidden p-0 sm:block sm:p-0">
        <div className="h-12 border-b border-border bg-muted/60" />
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-6 border-b border-border px-6 py-4 last:border-b-0">
            <span className="h-5 w-24 animate-pulse rounded-md bg-muted" />
            <span className="h-5 w-24 animate-pulse rounded-md bg-muted" />
            <span className="h-5 flex-1 animate-pulse rounded-md bg-muted" />
            <span className="h-5 w-24 animate-pulse rounded-md bg-muted" />
            <span className="h-12 w-32 animate-pulse rounded-lg bg-muted" />
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

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="flex flex-col items-start gap-4">
      <div>
        <p className="text-xl font-bold">{title}</p>
      </div>
      {children}
    </Card>
  );
}

export function BillsList() {
  const [text, setText] = useState("");
  const search = useDebouncedValue(text.trim(), 300);
  const { data, error, isError, isPending, isFetching, isPlaceholderData, refetch } = useSales(search);
  const typing = text.trim() !== search;

  let body: React.ReactNode;
  if (isError && !data) {
    body = (
      <Card className="flex flex-col items-start gap-4 border-destructive/30" role="alert">
        <p className="flex items-start gap-3 text-lg font-medium text-destructive">
          <CircleAlert className="mt-1 size-5 shrink-0" aria-hidden />
          Bills could not be loaded. {errorMessage(error)}
        </p>
        <button type="button" className={btnOutline} onClick={() => refetch()}>
          Try again
        </button>
      </Card>
    );
  } else if (isPending || !data) {
    body = <Placeholder />;
  } else if (data.length === 0 && search) {
    body = (
      <Message title={`No bill matches “${search}”`}>
        <p className="text-muted-foreground">Search by customer name or bill number, like 12/2026-27.</p>
        <button type="button" className={btnOutline} onClick={() => setText("")}>
          Clear search
        </button>
      </Message>
    );
  } else if (data.length === 0) {
    body = (
      <Message title="No bills yet">
        <p className="text-muted-foreground">Bills you make will be listed here, newest first.</p>
        <GuardedLink href="/bills/new" className={btnPrimary}>
          <Plus className="size-5" aria-hidden />
          Make your first bill
        </GuardedLink>
      </Message>
    );
  } else {
    body = (
      <div className={cn("transition-opacity duration-150", isPlaceholderData && "opacity-60")}>
        <BillsTable sales={data} />
        <BillCards sales={data} />
        {data.length >= SALES_LIMIT && (
          <p className="mt-4 text-muted-foreground">
            Showing the latest {SALES_LIMIT} bills. Search to find older ones.
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Bills" sub="Newest first" actions={<PrimaryAction sectionHref="/bills" />} />

      <Today />

      <search className="relative mt-6 block">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setText("");
          }}
          maxLength={100}
          aria-label="Search bills"
          placeholder="Search customer name or bill number"
          className={cn(inputCls, "pr-12 pl-12 [&::-webkit-search-cancel-button]:hidden")}
        />
        {text && (
          <button
            type="button"
            onClick={() => setText("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" aria-hidden />
          </button>
        )}
      </search>
      <p className="sr-only" role="status">
        {typing || (isFetching && isPlaceholderData) ? "Searching" : data ? `${data.length} bills shown` : ""}
      </p>

      <div className="mt-6">{body}</div>
    </>
  );
}

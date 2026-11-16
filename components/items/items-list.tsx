"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { AdjustStockButton } from "@/components/items/adjust-stock";
import { StockText } from "@/components/items/stock-badge";
import { PrimaryAction } from "@/components/shell/list-actions";
import { GuardedLink } from "@/components/shell/navigation-guard";
import { Card, PageHeader, btnOutline, btnPrimary } from "@/components/ui/kit";
import { ListError, ListMessage, ListPlaceholder, ListSearch } from "@/components/ui/list-states";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useFirmId } from "@/hooks/use-firm-id";
import { ITEMS_LIMIT, listItems } from "@/lib/api/items";
import { keys } from "@/lib/query";
import type { Item } from "@/lib/types";
import { cn } from "@/lib/utils";

function ItemsTable({ firmId, items }: { firmId: string; items: Item[] }) {
  return (
    <Card className="hidden overflow-hidden p-0 sm:block sm:p-0">
      <table className="w-full text-left">
        <thead className="border-b border-border bg-muted/60 text-muted-foreground">
          <tr>
            <th className="px-6 py-3 font-semibold">Item</th>
            <th className="px-4 py-3 font-semibold">Design no.</th>
            <th className="px-4 py-3 font-semibold">HSN</th>
            <th className="px-4 py-3 text-right font-semibold">In stock</th>
            <th className="px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((i) => (
            <tr key={i.id}>
              <td className="px-6 py-3 text-lg font-bold">{i.description}</td>
              <td className="num px-4 py-3 whitespace-nowrap">{i.designNo}</td>
              <td className="num px-4 py-3 whitespace-nowrap text-muted-foreground">{i.hsnCode}</td>
              <td className="px-4 py-3 text-right text-lg">
                <StockText qty={i.stockQty} unit={i.unit} />
              </td>
              <td className="px-6 py-3">
                <span className="flex justify-end gap-2">
                  <AdjustStockButton firmId={firmId} item={i} />
                  <GuardedLink
                    href={`/items/${i.id}`}
                    className={btnOutline}
                    aria-label={`Edit ${i.description}, ${i.designNo}`}
                  >
                    Edit
                  </GuardedLink>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ItemCards({ firmId, items }: { firmId: string; items: Item[] }) {
  return (
    <ul className="grid gap-3 sm:hidden">
      {items.map((i) => (
        <li key={i.id} className="rounded-xl border border-border bg-card">
          <GuardedLink
            href={`/items/${i.id}`}
            aria-label={`Edit ${i.description}, ${i.designNo}`}
            className="block rounded-t-xl p-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="flex items-baseline justify-between gap-3">
              <span className="text-lg font-bold">{i.description}</span>
              <StockText qty={i.stockQty} unit={i.unit} className="text-lg" />
            </span>
            <span className="num mt-1 block text-muted-foreground">
              {i.designNo}, HSN {i.hsnCode}
            </span>
          </GuardedLink>
          <div className="border-t border-border px-4 py-3">
            <AdjustStockButton firmId={firmId} item={i} className="h-11 w-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ItemsList() {
  const firmId = useFirmId();
  const [text, setText] = useState("");
  const search = useDebouncedValue(text.trim(), 300);
  const { data, error, isError, isPending, isPlaceholderData, refetch } = useQuery({
    queryKey: keys.itemsSearch(firmId ?? "", search),
    queryFn: ({ signal }) => listItems(search, signal),
    enabled: Boolean(firmId),
    placeholderData: keepPreviousData,
  });

  let body: React.ReactNode;
  if (isError && !data) {
    body = <ListError what="Items" error={error} onRetry={() => refetch()} />;
  } else if (isPending || !data) {
    body = <ListPlaceholder label="Loading items" columns={["flex-1", "w-24", "w-24", "w-24", "h-12 w-20"]} />;
  } else if (data.length === 0 && search) {
    body = (
      <ListMessage title={`No item matches “${search}”`}>
        <p className="text-muted-foreground">Search by item name or design no., like BC-101.</p>
        <button type="button" className={btnOutline} onClick={() => setText("")}>
          Clear search
        </button>
      </ListMessage>
    );
  } else if (data.length === 0) {
    body = (
      <ListMessage title="No items yet">
        <p className="text-muted-foreground">Add the goods you sell, with the stock you have now.</p>
        <GuardedLink href="/items/new" className={btnPrimary}>
          <Plus className="size-5" aria-hidden />
          Add your first item
        </GuardedLink>
      </ListMessage>
    );
  } else {
    body = (
      <div className={cn("transition-opacity duration-150", isPlaceholderData && "opacity-60")}>
        <ItemsTable firmId={firmId ?? ""} items={data} />
        <ItemCards firmId={firmId ?? ""} items={data} />
        {data.length >= ITEMS_LIMIT && (
          <p className="mt-4 text-muted-foreground">Showing the first {ITEMS_LIMIT}, A to Z. Search to find others.</p>
        )}
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Items"
        sub="Stock goes down by itself when you save a bill"
        actions={<PrimaryAction sectionHref="/items" />}
      />
      <ListSearch value={text} onChange={setText} label="Search items" placeholder="Search item name or design no." />
      <p className="sr-only" role="status">
        {data ? `${data.length} shown` : ""}
      </p>
      <div className="mt-6">{body}</div>
    </>
  );
}

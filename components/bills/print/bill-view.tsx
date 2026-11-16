"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CircleAlert, Printer } from "lucide-react";
import { CancelBillButton } from "@/components/bills/print/cancel-bill";
import { PrintSheet } from "@/components/bills/print/print-sheet";
import { Card, btnOutline, btnPrimary } from "@/components/ui/kit";
import { ListError } from "@/components/ui/list-states";
import { useFirmId } from "@/hooks/use-firm-id";
import { getProfile } from "@/lib/api/business";
import { isApiError } from "@/lib/api/client";
import { getSale } from "@/lib/api/sales";
import { formatDate, formatRupees } from "@/lib/money";
import { COPIES } from "@/lib/print";
import { keys } from "@/lib/query";
import { currentBusiness, useSession } from "@/lib/session";

export function BillViewPlaceholder() {
  return (
    <div role="status" aria-label="Loading bill" className="grid gap-4">
      <Card className="h-24 animate-pulse" />
      <div className="sheets">
        <div className="sheet animate-pulse" />
      </div>
    </div>
  );
}

/** When it was cancelled, in the person's own time zone. */
function cancelledOn(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function BillViewLoaded({ firmId, id }: { firmId: string; id: string }) {
  const isOwner = currentBusiness(useSession())?.role === "owner";
  const sale = useQuery({ queryKey: keys.sale(firmId, id), queryFn: ({ signal }) => getSale(id, signal) });
  const firm = useQuery({
    queryKey: keys.profile(firmId),
    queryFn: ({ signal }) => getProfile(signal),
    staleTime: 5 * 60_000,
  });

  const invoiceNo = sale.data?.invoice.invoiceNo;
  // The page title becomes the file name when "Save as PDF" is chosen in the print window.
  useEffect(() => {
    if (!invoiceNo) return;
    const before = document.title;
    document.title = `Bill ${invoiceNo.replace("/", "-")} — Munshi Ji`;
    return () => {
      document.title = before;
    };
  }, [invoiceNo]);

  const failed = sale.error ?? firm.error;
  if (failed) {
    if (sale.error && isApiError(sale.error) && (sale.error.status === 404 || sale.error.code === "INVALID_ID")) {
      return (
        <Card className="flex max-w-2xl flex-col items-start gap-4">
          <p className="text-xl font-bold">This bill was not found</p>
          <p className="text-muted-foreground">The link may be wrong, or the bill belongs to another firm.</p>
          <Link href="/bills" className={btnOutline}>
            Go to bills
          </Link>
        </Card>
      );
    }
    return (
      <ListError
        what="This bill"
        error={failed}
        onRetry={() => {
          if (sale.error) void sale.refetch();
          if (firm.error) void firm.refetch();
        }}
      />
    );
  }
  if (!sale.data || !firm.data) return <BillViewPlaceholder />;

  const { invoice } = sale.data;
  const cancelled = invoice.status === "cancelled";

  return (
    <>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="num text-3xl font-bold tracking-tight">Bill {invoice.invoiceNo}</h1>
          <p className="mt-1 text-lg text-muted-foreground">
            {invoice.billedToName}, {formatDate(invoice.date)}, <span className="num">{formatRupees(invoice.grandTotal)}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isOwner && !cancelled && <CancelBillButton firmId={firmId} invoice={invoice} />}
          <button type="button" autoFocus onClick={() => window.print()} className={btnPrimary}>
            <Printer className="size-5" aria-hidden />
            Print
          </button>
        </div>
      </div>

      {cancelled && (
        <p
          role="status"
          className="no-print mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 font-medium text-destructive"
        >
          <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <span>
            Cancelled on {cancelledOn(invoice.cancelledAt)}
            {invoice.cancelReason ? `. Reason: ${invoice.cancelReason}` : ""}. It prints with a large CANCELLED mark
            on every copy, and is not counted in today’s sales.
          </span>
        </p>
      )}

      <p className="no-print mb-3 text-muted-foreground">
        Prints on A4 as {COPIES.length} pages: {COPIES.join(", ")}.
      </p>
      <div className="sheets">
        {COPIES.map((copy) => (
          <PrintSheet key={copy} firm={firm.data} sale={sale.data} copy={copy} />
        ))}
      </div>
    </>
  );
}

/** Reads the bill id from the address. Rendered inside Suspense, since the id is only known when the page opens. */
export function BillView() {
  const firmId = useFirmId();
  const { id } = useParams<{ id: string }>();
  if (!firmId) return <BillViewPlaceholder />;
  return <BillViewLoaded key={firmId} firmId={firmId} id={id} />;
}

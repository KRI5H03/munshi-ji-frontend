import Link from "next/link";
import { PrintSheetC } from "@/components/design/c/print-sheet";
import { btnPrimary, mono } from "@/components/design/c/ui";
import { PrintButton } from "@/components/design/print-button";
import { cn } from "@/lib/utils";
import { bill, business } from "@/lib/mock";
import { COPIES } from "@/lib/print";

export default function PrintC() {
  return (
    <>
      <div className="no-print sticky top-0 z-10 border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <p className="mr-auto leading-tight">
            <span className={cn(mono, "block text-xl font-bold")}>Bill {bill.invoice.invoiceNo}</span>
            <span className="block text-base text-muted-foreground">
              Prints 3 pages: one for the customer, one for transport, one for you
            </span>
          </p>
          <Link href="/design/c/bills" className="flex h-12 items-center underline underline-offset-4">
            Back to bills
          </Link>
          <PrintButton className={btnPrimary}>Print</PrintButton>
        </div>
      </div>
      <div className="sheets">
        {COPIES.map((copy, i) => (
          <PrintSheetC key={copy} firm={business} sale={bill} copy={copy} page={i + 1} pages={COPIES.length} />
        ))}
      </div>
    </>
  );
}

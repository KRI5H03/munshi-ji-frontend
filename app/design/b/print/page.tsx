import Link from "next/link";
import { PrintSheetB } from "@/components/design/b/print-sheet";
import { Kbd, btn, btnPrimary, mono } from "@/components/design/b/ui";
import { PrintButton } from "@/components/design/print-button";
import { cn } from "@/lib/utils";
import { bill, business } from "@/lib/mock";
import { COPIES } from "@/lib/print";

export default function PrintB() {
  return (
    <>
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b-2 border-black bg-white p-2">
        <Link href="/design/b/bills" className={btn}>
          Back <Kbd className="hidden md:inline">Esc</Kbd>
        </Link>
        <p className="mr-auto px-2">
          <b className={mono}>Bill {bill.invoice.invoiceNo}</b>, 3 pages: Original, Duplicate, Triplicate
        </p>
        <PrintButton className={cn(btnPrimary)}>
          Print <Kbd className="hidden md:inline">Ctrl+P</Kbd>
        </PrintButton>
      </div>
      <div className="sheets">
        {COPIES.map((copy, i) => (
          <PrintSheetB key={copy} firm={business} sale={bill} copy={copy} page={i + 1} pages={COPIES.length} />
        ))}
      </div>
    </>
  );
}

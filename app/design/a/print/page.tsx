import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { PrintSheetA } from "@/components/design/a/print-sheet";
import { btnOutline, btnPrimary } from "@/components/design/a/ui";
import { PrintButton } from "@/components/design/print-button";
import { bill, business } from "@/lib/mock";
import { COPIES } from "@/lib/print";

export default function PrintA() {
  return (
    <>
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Link href="/design/a/bills" className={btnOutline}>
          <ArrowLeft className="size-5" aria-hidden />
          Bills
        </Link>
        <p className="mr-auto">
          <span className="num font-bold">Bill {bill.invoice.invoiceNo}</span>
          <span className="block text-muted-foreground">3 pages: Original, Duplicate, Triplicate</span>
        </p>
        <PrintButton className={btnPrimary}>
          <Printer className="size-5" aria-hidden />
          Print
        </PrintButton>
      </div>
      <div className="sheets">
        {COPIES.map((copy) => (
          <PrintSheetA key={copy} firm={business} sale={bill} copy={copy} />
        ))}
      </div>
    </>
  );
}

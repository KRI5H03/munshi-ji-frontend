import Link from "next/link";
import { CShell, Sheet, inputCls, mono } from "@/components/design/c/ui";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDate, formatRupees } from "@/lib/money";
import { TODAY, sales, todaySales, todayTotal } from "@/lib/mock";

export default function BillsC() {
  return (
    <CShell active="bills">
      <h1 className="text-4xl font-bold">Bills</h1>
      <p className="mt-3 text-xl">
        Today you made {todaySales.length} bills for{" "}
        <b className={cn(mono, "whitespace-nowrap")}>{formatRupees(todayTotal)}</b>.
      </p>

      <Input
        type="search"
        aria-label="Find a bill"
        placeholder="Find a bill by customer name or bill number"
        className={cn(inputCls, "mt-8")}
      />

      <h2 className="mt-8 mb-3 font-bold">Today, {formatDate(TODAY)}</h2>
      <Sheet>
        <ul className="divide-y divide-border">
          {sales.map((s) => (
            <li key={s.id}>
              <Link
                href="/design/c/print"
                className="flex min-h-20 items-center justify-between gap-4 px-5 py-3 transition-colors duration-150 hover:bg-muted"
              >
                <span className="min-w-0">
                  <span className="block text-xl font-bold">{s.billedToName}</span>
                  <span className={cn(mono, "block text-base text-muted-foreground")}>Bill {s.invoiceNo}</span>
                </span>
                <span className={cn(mono, "text-xl font-bold whitespace-nowrap")}>{formatRupees(s.grandTotal)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Sheet>
      <p className="mt-4 text-base text-muted-foreground">
        Tap a bill to open or print it. The latest 100 bills are shown; search to find older ones.
      </p>
    </CShell>
  );
}

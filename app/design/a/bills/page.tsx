import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { AShell, Card, PageHead, btnOutline, btnPrimary, inputCls } from "@/components/design/a/ui";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDate, formatRupees } from "@/lib/money";
import { sales, todaySales, todayTotal } from "@/lib/mock";

export default function BillsA() {
  return (
    <AShell active="bills">
      <PageHead
        title="Bills"
        sub="2026-27, newest first"
        action={
          <Link href="/design/a/new-bill" className={cn(btnPrimary, "hidden lg:inline-flex")}>
            <Plus className="size-5" aria-hidden />
            New bill
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-muted-foreground">Bills today</p>
          <p className="num mt-1 text-3xl font-bold">{todaySales.length}</p>
        </Card>
        <Card>
          <p className="text-muted-foreground">Sales today</p>
          <p className="num mt-1 text-3xl font-bold">{formatRupees(todayTotal)}</p>
        </Card>
      </div>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          aria-label="Search bills"
          placeholder="Search customer name or bill number"
          className={cn(inputCls, "pl-12")}
        />
      </div>

      {/* Desktop: table */}
      <Card className="mt-6 hidden overflow-hidden p-0 sm:block sm:p-0">
        <table className="w-full text-left">
          <thead className="border-b border-border bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-semibold">Bill no.</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 text-right font-semibold">Amount</th>
              <th className="px-6 py-3 text-right font-semibold">
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sales.map((s) => (
              <tr key={s.id}>
                <td className="num px-6 py-3 text-lg font-bold whitespace-nowrap">{s.invoiceNo}</td>
                <td className="num px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDate(s.date)}</td>
                <td className="px-4 py-3">{s.billedToName}</td>
                <td className="num px-4 py-3 text-right text-lg font-bold whitespace-nowrap">
                  {formatRupees(s.grandTotal)}
                </td>
                <td className="px-6 py-3 text-right">
                  <Link href="/design/a/print" className={btnOutline}>
                    Open / Print
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Phone: one card per bill */}
      <ul className="mt-6 grid gap-3 sm:hidden">
        {sales.map((s) => (
          <li key={s.id}>
            <Link href="/design/a/print" className="block rounded-xl border border-border bg-card p-4">
              <span className="flex items-baseline justify-between gap-3">
                <span className="num text-lg font-bold">{s.invoiceNo}</span>
                <span className="num text-lg font-bold">{formatRupees(s.grandTotal)}</span>
              </span>
              <span className="mt-1 block">{s.billedToName}</span>
              <span className="num block text-muted-foreground">{formatDate(s.date)}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-muted-foreground">Showing the latest 100 bills. Search to find older ones.</p>
    </AShell>
  );
}

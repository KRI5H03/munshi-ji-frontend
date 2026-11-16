import Link from "next/link";
import { BShell, Kbd, Pane, btn, btnPrimary, inputCls, mono, selectedRow, td, th } from "@/components/design/b/ui";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  formatBp,
  formatDate,
  formatPaise,
  formatPercentMilli,
  formatRupees,
  formatSigned,
} from "@/lib/money";
import { bill, sales, todaySales, todayTotal } from "@/lib/mock";

export default function BillsB() {
  const { invoice, lines } = bill;
  const half = formatBp(lines[0].gstRateBp / 2);

  return (
    <BShell
      active="bills"
      keys={[
        ["↑ ↓", "Move"],
        ["Enter", "Open"],
        ["Ctrl+P", "Print"],
        ["/", "Search"],
        ["Ctrl+N", "New bill"],
      ]}
    >
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_27rem]">
        <Pane
          title="Bills, 2026-27"
          right={
            <span className={cn(mono, "text-right")}>
              Today: {todaySales.length} bills, {formatRupees(todayTotal)}
            </span>
          }
        >
          <div className="flex items-center gap-2 border-b border-black p-2">
            <Kbd>/</Kbd>
            <Input
              type="search"
              aria-label="Search bills"
              placeholder="Search party or bill no."
              className={inputCls}
            />
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className={th}>Bill no.</th>
                <th className={cn(th, "hidden sm:table-cell")}>Date</th>
                <th className={th}>Party</th>
                <th className={cn(th, "text-right")}>Amount ₹</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const selected = s.id === invoice.id;
                return (
                  <tr key={s.id} aria-selected={selected} className={cn(selected && selectedRow)}>
                    <td className={cn(td, mono, "font-semibold whitespace-nowrap")}>
                      <Link href="/design/b/print" className="underline-offset-4 hover:underline">
                        {s.invoiceNo}
                      </Link>
                      <span className="block font-normal text-muted-foreground sm:hidden">{formatDate(s.date)}</span>
                    </td>
                    <td className={cn(td, mono, "hidden whitespace-nowrap sm:table-cell")}>{formatDate(s.date)}</td>
                    <td className={td}>{s.billedToName}</td>
                    <td className={cn(td, mono, "text-right font-semibold whitespace-nowrap")}>
                      {formatPaise(s.grandTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="px-2 py-2 text-muted-foreground">Latest 100 bills. Search for older ones.</p>
        </Pane>

        <Pane title={`Bill ${invoice.invoiceNo}`} right={<span className={mono}>{formatDate(invoice.date)}</span>}>
          <div className="border-b border-border px-3 py-2">
            <p className="font-bold">{invoice.billedToName}</p>
            <p className="text-muted-foreground">{invoice.billedToAddress}</p>
            <p className={cn(mono, "text-muted-foreground")}>GSTIN {invoice.billedToGstin}</p>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className={th}>Item</th>
                <th className={cn(th, "text-right")}>Qty</th>
                <th className={cn(th, "text-right")}>Rate</th>
                <th className={cn(th, "text-right")}>Amount</th>
              </tr>
            </thead>
            <tbody className={mono}>
              {lines.map((l) => (
                <tr key={l.id}>
                  <td className={cn(td, "font-sans")}>
                    {l.description}
                    <span className={cn(mono, "block text-muted-foreground")}>{l.designNo}</span>
                  </td>
                  <td className={cn(td, "text-right align-top")}>{l.qty}</td>
                  <td className={cn(td, "text-right align-top")}>{formatPaise(l.rate)}</td>
                  <td className={cn(td, "text-right align-top")}>{formatPaise(l.gross)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className={cn(mono, "grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-3 py-2")}>
            <dt className="font-sans">Gross</dt>
            <dd className="text-right">{formatPaise(invoice.gross)}</dd>
            {invoice.discounts.map((d) => (
              <div key={d.seq} className="col-span-2 grid grid-cols-subgrid">
                <dt className="font-sans">Less {formatPercentMilli(d.percentMilli)}</dt>
                <dd className="text-right">{formatPaise(-d.amount)}</dd>
              </div>
            ))}
            <dt className="font-sans">Taxable</dt>
            <dd className="text-right">{formatPaise(invoice.taxable)}</dd>
            <dt className="font-sans">CGST {half}</dt>
            <dd className="text-right">{formatPaise(invoice.cgst)}</dd>
            <dt className="font-sans">SGST {half}</dt>
            <dd className="text-right">{formatPaise(invoice.sgst)}</dd>
            <dt className="font-sans">Round off</dt>
            <dd className="text-right">{formatSigned(invoice.roundOff)}</dd>
          </dl>
          <p className="flex items-baseline justify-between gap-3 border-y-2 border-black px-3 py-2 font-bold">
            Total
            <span className={cn(mono, "text-2xl")}>{formatRupees(invoice.grandTotal)}</span>
          </p>
          <div className="grid grid-cols-2 gap-2 p-2">
            <Link href="/design/b/print" className={cn(btnPrimary, "justify-between")}>
              Print <Kbd>Ctrl+P</Kbd>
            </Link>
            <Link href="/design/b/print" className={cn(btn, "justify-between")}>
              Open <Kbd>Enter</Kbd>
            </Link>
          </div>
        </Pane>
      </div>
    </BShell>
  );
}

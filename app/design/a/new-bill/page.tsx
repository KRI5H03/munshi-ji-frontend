import { Check, Trash2 } from "lucide-react";
import { AShell, Card, Field, PageHead, btnOutline, btnPrimary, inputCls } from "@/components/design/a/ui";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { amountInWords } from "@/lib/amount-in-words";
import { formatBp, formatPaise, formatPercentMilli, formatRupees, formatSigned } from "@/lib/money";
import { bill, contacts, items } from "@/lib/mock";

const COLS = "@xl:grid-cols-[1.5rem_minmax(0,1fr)_5.5rem_7.5rem_7rem_3rem]";

export default function NewBillA() {
  const { invoice, lines } = bill;
  const customer = contacts[1];
  const halfRate = formatBp(lines[0].gstRateBp / 2);

  return (
    <AShell active="new-bill">
      <PageHead title="New bill" sub="The bill number is given when you save" />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-6">
          <Card className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Customer"
              defaultValue={customer.name}
              hint={`${customer.city}, GSTIN ${customer.gstin}`}
            />
            <div>
              <Field label="Bill date" type="date" defaultValue={invoice.date} />
              <p className="mt-2 flex items-center gap-2 font-medium text-green-800">
                <Check className="size-5" aria-hidden />
                Same state (UP), so CGST + SGST
              </p>
            </div>
          </Card>

          <Card className="@container p-0 sm:p-0">
            <div
              className={cn(
                "hidden gap-3 border-b border-border bg-muted/60 px-6 py-3 font-semibold text-muted-foreground @xl:grid",
                COLS,
              )}
            >
              <span>#</span>
              <span>Item</span>
              <span className="text-right">Qty (pcs)</span>
              <span className="text-right">Rate (₹)</span>
              <span className="text-right">Amount (₹)</span>
              <span />
            </div>

            {lines.map((line) => (
              <div
                key={line.id}
                className={cn(
                  "grid grid-cols-[1fr_1fr_3rem] items-center gap-3 border-b border-border px-4 py-4 @xl:px-6",
                  COLS,
                )}
              >
                <span className="num hidden text-muted-foreground @xl:block">{line.lineNo}</span>
                <div className="col-span-3 min-w-0 @xl:col-span-1">
                  <p className="text-lg font-bold">{line.description}</p>
                  <p className="text-muted-foreground">
                    {line.designNo}, HSN {line.hsnCode}, {items[0].stockQty} in stock
                  </p>
                </div>
                <label className="block">
                  <span className="mb-1 block text-muted-foreground @xl:sr-only">Qty (pcs)</span>
                  <Input inputMode="numeric" defaultValue={line.qty} className={cn(inputCls, "num text-right")} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-muted-foreground @xl:sr-only">Rate (₹)</span>
                  <Input
                    inputMode="decimal"
                    defaultValue={formatPaise(line.rate)}
                    className={cn(inputCls, "num text-right")}
                  />
                </label>
                <p className="num order-last col-span-3 text-right text-lg font-bold @xl:order-none @xl:col-span-1">
                  <span className="font-normal text-muted-foreground @xl:hidden">Amount </span>
                  {formatPaise(line.gross)}
                </p>
                <button
                  type="button"
                  aria-label={`Remove ${line.description}`}
                  className="flex size-12 items-center justify-center self-end rounded-lg text-destructive hover:bg-destructive/5 @xl:self-center"
                >
                  <Trash2 className="size-5" aria-hidden />
                </button>
              </div>
            ))}

            <div className={cn("grid items-center gap-3 px-4 py-4 @xl:px-6", COLS)}>
              <span className="num hidden text-muted-foreground @xl:block">{lines.length + 1}</span>
              <Input
                aria-label="Add item"
                placeholder="Search item by name or design no."
                className={cn(inputCls, "border-dashed @xl:col-span-5")}
              />
            </div>
          </Card>

          <Card>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Discount 1 (%)"
                inputMode="decimal"
                defaultValue="10"
                inputClassName="num"
              />
              <Field label="Discount 2 (%), optional" inputMode="decimal" placeholder="e.g. 4.762" inputClassName="num" />
            </div>
            <p className="mt-3 text-muted-foreground">Discount 2 is applied after discount 1.</p>
          </Card>

          <Card className="p-0 sm:p-0">
            <details>
              <summary className="flex min-h-14 cursor-pointer items-center px-5 text-lg font-semibold sm:px-6">
                Transport details (optional)
              </summary>
              <div className="grid gap-5 border-t border-border p-5 sm:grid-cols-2 sm:p-6">
                <Field label="Transport" />
                <Field label="GR/RR no." />
                <Field label="Vehicle no." />
                <Field label="Station" />
              </div>
            </details>
          </Card>
        </div>

        <Card className="xl:sticky xl:top-6">
          <h2 className="text-xl font-bold">Total</h2>
          <dl className="num mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 text-lg">
            <dt>Gross</dt>
            <dd className="text-right">{formatRupees(invoice.gross)}</dd>
            {invoice.discounts.map((d) => (
              <div key={d.seq} className="col-span-2 grid grid-cols-subgrid">
                <dt>Discount {formatPercentMilli(d.percentMilli)}</dt>
                <dd className="text-right">{formatRupees(-d.amount)}</dd>
              </div>
            ))}
            <dt>Taxable</dt>
            <dd className="text-right">{formatRupees(invoice.taxable)}</dd>
            <dt>CGST {halfRate}</dt>
            <dd className="text-right">{formatRupees(invoice.cgst)}</dd>
            <dt>SGST {halfRate}</dt>
            <dd className="text-right">{formatRupees(invoice.sgst)}</dd>
            <dt>Round off</dt>
            <dd className="text-right">{formatSigned(invoice.roundOff)}</dd>
          </dl>
          <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-border pt-4">
            <span className="text-lg font-bold">Grand total</span>
            <span className="num text-3xl font-bold">{formatRupees(invoice.grandTotal)}</span>
          </div>
          <p className="mt-2 text-muted-foreground">{amountInWords(invoice.grandTotal)}</p>

          <button type="button" className={cn(btnPrimary, "mt-6 h-14 w-full text-lg")}>
            Save bill
          </button>
          <button type="button" className={cn(btnOutline, "mt-3 w-full")}>
            Save and print
          </button>
          <p className="mt-4 text-muted-foreground">This is a preview. The saved bill shows the final figures.</p>
        </Card>
      </div>
    </AShell>
  );
}

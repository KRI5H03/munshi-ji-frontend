import { CTask, Sheet, btnPlain, btnPrimary, inputCls, mono } from "@/components/design/c/ui";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { amountInWords } from "@/lib/amount-in-words";
import { formatBp, formatPaise, formatRupees, formatSigned } from "@/lib/money";
import { bill, business, contacts, items } from "@/lib/mock";

const numInput = cn(inputCls, mono, "px-2 text-right");
const totalRow = "flex items-center justify-between gap-4";

export default function NewBillC() {
  const { invoice, lines } = bill;
  const customer = contacts[1];
  const half = formatBp(lines[0].gstRateBp / 2);

  return (
    <CTask
      title="New bill"
      backHref="/design/c/bills"
      backLabel="Cancel"
      actions={
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="mr-auto leading-tight">
            <span className="block text-base text-muted-foreground">Total to pay</span>
            <span className={cn(mono, "text-2xl font-bold")}>{formatRupees(invoice.grandTotal)}</span>
          </p>
          <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
            <button type="button" className={cn(btnPlain, "px-4")}>
              Save only
            </button>
            <button type="button" className={cn(btnPrimary, "px-4")}>
              Save and print
            </button>
          </div>
        </div>
      }
    >
      {/* The bill itself: filled in where it will print. */}
      <Sheet>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-foreground p-5">
          <div>
            <p className="text-2xl font-bold">{business.name}</p>
            <p className="text-base text-muted-foreground">{business.address}</p>
          </div>
          <label className="block">
            <span className="mb-2 block font-bold">Date</span>
            <Input type="date" defaultValue={invoice.date} className={cn(inputCls, mono, "w-48")} />
          </label>
        </div>

        <div className="border-b border-border p-5">
          <label htmlFor="c-party" className="mb-2 block font-bold">
            Bill to
          </label>
          <Input id="c-party" defaultValue={customer.name} className={cn(inputCls, "text-xl font-bold md:text-xl")} />
          <p className="mt-2 text-base text-muted-foreground">
            {customer.city}. <span className={mono}>GSTIN {customer.gstin}</span>. Same state as you, so CGST and SGST.
          </p>
        </div>

        <div className="@container border-b border-border">
          <div className="hidden grid-cols-[minmax(0,1fr)_6rem_8rem_8rem] gap-3 border-b border-border px-5 py-2 text-base font-bold @xl:grid">
            <span>Item</span>
            <span className="text-right">Pieces</span>
            <span className="text-right">Rate ₹</span>
            <span className="text-right">Amount ₹</span>
          </div>

          {lines.map((l) => (
            <div
              key={l.id}
              className="grid grid-cols-2 items-center gap-3 border-b border-border px-5 py-4 @xl:grid-cols-[minmax(0,1fr)_6rem_8rem_8rem]"
            >
              <div className="col-span-2 flex items-start justify-between gap-3 @xl:col-span-1">
                <div>
                  <p className="text-xl font-bold">{l.description}</p>
                  <p className={cn(mono, "text-base text-muted-foreground")}>
                    {l.designNo}, {items[0].stockQty} left
                  </p>
                </div>
                <button type="button" className="h-11 shrink-0 text-base underline underline-offset-4">
                  Remove
                </button>
              </div>
              <label>
                <span className="mb-1 block text-base font-bold @xl:sr-only">Pieces</span>
                <Input inputMode="numeric" defaultValue={l.qty} className={numInput} />
              </label>
              <label>
                <span className="mb-1 block text-base font-bold @xl:sr-only">Rate ₹</span>
                <Input inputMode="decimal" defaultValue={formatPaise(l.rate)} className={numInput} />
              </label>
              <p className={cn(mono, "col-span-2 text-right text-xl font-bold @xl:col-span-1")}>
                <span className="font-sans text-base font-normal text-muted-foreground @xl:hidden">Amount ₹ </span>
                {formatPaise(l.gross)}
              </p>
            </div>
          ))}

          <div className="p-5">
            <label htmlFor="c-add" className="mb-2 block font-bold">
              Add another item
            </label>
            <Input id="c-add" placeholder="Type the item name or design number" className={inputCls} />
          </div>
        </div>

        <div className="ml-auto grid max-w-md gap-3 p-5">
          <p className={totalRow}>
            Gross <span className={mono}>{formatPaise(invoice.gross)}</span>
          </p>
          <div className={totalRow}>
            <label htmlFor="c-d1" className="flex items-center gap-2">
              Less discount
              <Input id="c-d1" inputMode="decimal" defaultValue="10" className={cn(numInput, "h-12 w-20")} />%
            </label>
            <span className={mono}>{formatPaise(-invoice.discounts[0].amount)}</span>
          </div>
          <div className={totalRow}>
            <label htmlFor="c-d2" className="flex items-center gap-2">
              Then discount
              <Input id="c-d2" inputMode="decimal" placeholder="0" className={cn(numInput, "h-12 w-20")} />%
            </label>
            <span className={cn(mono, "text-muted-foreground")}>0.00</span>
          </div>
          <p className={cn(totalRow, "border-t border-border pt-3")}>
            Taxable <span className={mono}>{formatPaise(invoice.taxable)}</span>
          </p>
          <p className={totalRow}>
            CGST {half} <span className={mono}>{formatPaise(invoice.cgst)}</span>
          </p>
          <p className={totalRow}>
            SGST {half} <span className={mono}>{formatPaise(invoice.sgst)}</span>
          </p>
          <p className={totalRow}>
            Round off <span className={mono}>{formatSigned(invoice.roundOff)}</span>
          </p>
          <p className={cn(totalRow, "border-t-2 border-foreground pt-3 text-xl font-bold")}>
            Grand total
            <span className={cn(mono, "text-3xl text-primary")}>{formatRupees(invoice.grandTotal)}</span>
          </p>
        </div>
        <p className="border-t border-border px-5 py-4">{amountInWords(invoice.grandTotal)}</p>
      </Sheet>

      <Sheet className="mt-6">
        <details>
          <summary className="flex min-h-16 cursor-pointer items-center px-5 font-bold">
            Sending by transport? Add the details
          </summary>
          <div className="grid gap-5 border-t border-border p-5 sm:grid-cols-2">
            {["Transport", "GR/RR no.", "Vehicle no.", "Station"].map((name) => (
              <label key={name}>
                <span className="mb-2 block font-bold">{name}</span>
                <Input className={inputCls} />
              </label>
            ))}
          </div>
        </details>
      </Sheet>

      <p className="mt-4 text-base text-muted-foreground">
        The bill number is given when you save. Figures here are a preview; the saved bill shows the final ones.
      </p>
    </CTask>
  );
}

import { Card, btnPrimary } from "@/components/ui/kit";
import { amountInWords } from "@/lib/amount-in-words";
import type { BillPreview } from "@/lib/bill/calc";
import { formatBp, formatPercentMilli, formatRupees, formatSigned } from "@/lib/money";
import { cn } from "@/lib/utils";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", strong && "font-semibold")}>
      <dt>{label}</dt>
      <dd className="num text-right whitespace-nowrap">{value}</dd>
    </div>
  );
}

/** The bill's total as you type, worked out with the server's rules. The saved bill shows the server's figures. */
export function TotalsPanel({
  preview,
  interState,
  hasLines,
  dateHasNoRule,
  incompleteLines,
  saving,
  shortcut,
  error,
}: {
  preview: BillPreview | null;
  interState: boolean;
  hasLines: boolean;
  dateHasNoRule: boolean;
  incompleteLines: number;
  saving: boolean;
  shortcut: string;
  error: React.ReactNode;
}) {
  return (
    <Card className="xl:sticky xl:top-6" aria-labelledby="bill-total-title">
      <h2 id="bill-total-title" className="text-xl font-bold">
        Total
      </h2>

      {preview ? (
        <>
          <dl className="mt-4 grid gap-3 text-lg">
            <Row label="Gross" value={formatRupees(preview.gross)} />
            {preview.discounts.map((d) => (
              <Row
                key={d.seq}
                label={`Discount ${formatPercentMilli(d.percentMilli)}`}
                value={formatRupees(-d.amount)}
              />
            ))}
            <Row label="Taxable" value={formatRupees(preview.taxable)} strong />
            {preview.rates.flatMap((r) =>
              interState
                ? [<Row key={`i${r.gstRateBp}`} label={`IGST ${formatBp(r.gstRateBp)}`} value={formatRupees(r.igst)} />]
                : [
                    <Row key={`c${r.gstRateBp}`} label={`CGST ${formatBp(r.gstRateBp / 2)}`} value={formatRupees(r.cgst)} />,
                    <Row key={`s${r.gstRateBp}`} label={`SGST ${formatBp(r.gstRateBp / 2)}`} value={formatRupees(r.sgst)} />,
                  ],
            )}
            <Row label="Round off" value={formatSigned(preview.roundOff)} />
          </dl>
          <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-border pt-4">
            <span className="text-lg font-bold">Grand total</span>
            <output className="num text-3xl font-bold" aria-live="polite">
              {formatRupees(preview.grandTotal)}
            </output>
          </div>
          <p className="mt-2 text-muted-foreground">{amountInWords(preview.grandTotal)}</p>
          {incompleteLines > 0 && (
            <p className="mt-3 font-medium text-amber-800">
              {incompleteLines === 1 ? "1 item has" : `${incompleteLines} items have`} no pieces or rate yet and
              {incompleteLines === 1 ? " is" : " are"} not counted.
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 text-lg text-muted-foreground">
          {dateHasNoRule
            ? "There is no GST rule for this date. Check the bill date."
            : hasLines
              ? "Enter pieces and rate to see the total."
              : "Add an item to see the total."}
        </p>
      )}

      {error}

      <button type="submit" disabled={saving} className={cn(btnPrimary, "mt-6 h-14 w-full text-lg")}>
        {saving ? "Saving" : "Save bill"}
        {!saving && (
          <kbd className="ml-2 hidden rounded sm:inline border border-primary-foreground/40 px-1.5 font-sans text-sm font-medium">
            {shortcut}
          </kbd>
        )}
      </button>
      <p className="mt-3 text-muted-foreground">
        Saving gives the bill its number and opens it for printing. The saved bill shows the final figures.
      </p>
    </Card>
  );
}

import { amountInWords } from "@/lib/amount-in-words";
import {
  formatBp,
  formatDate,
  formatPaise,
  formatPercentMilli,
  formatPhone,
  formatRupees,
  formatSigned,
} from "@/lib/money";
import { stateName } from "@/lib/states";
import type { Business, SaleDetail } from "@/lib/types";

const th = "border-y-[1.5pt] border-black px-1 py-1.5 font-bold first:pl-0 last:pr-0";
const td = "border-b border-neutral-500 px-1 py-1.5 first:pl-0 last:pr-0";

/** Direction C: an open bill. Rules only where they separate things, large type, the total easy to find. */
export function PrintSheetC({
  firm,
  sale,
  copy,
  page,
  pages,
}: {
  firm: Business;
  sale: SaleDetail;
  copy: string;
  page: number;
  pages: number;
}) {
  const { invoice, lines, taxSummary } = sale;
  const sameState = invoice.igst === 0;

  return (
    <article className="sheet text-[11pt]" style={{ padding: "14mm" }}>
      <header className="border-b-[3pt] border-black pb-3">
        <div className="flex items-baseline justify-between">
          <p className="font-bold">Tax invoice</p>
          <p className="font-bold">{copy}</p>
        </div>
        <p className="mt-2 text-[26pt] leading-none font-bold">{firm.name}</p>
        <p className="mt-2">{firm.address}</p>
        <p>
          GSTIN <b className="font-mono">{firm.gstin}</b>
          {firm.phone && `, phone ${formatPhone(firm.phone)}`}
        </p>
      </header>

      <div className="mt-5 grid grid-cols-[1fr_62mm] gap-8">
        <div>
          <p>Bill to</p>
          <p className="text-[15pt] font-bold">{invoice.billedToName}</p>
          {invoice.billedToAddress && <p>{invoice.billedToAddress}</p>}
          <p>
            {invoice.billedToGstin ? (
              <>
                GSTIN <span className="font-mono">{invoice.billedToGstin}</span>
              </>
            ) : (
              "No GSTIN"
            )}
            , state code {invoice.billedToStateCode}
          </p>
          {invoice.billedToPhone && <p>Phone {formatPhone(invoice.billedToPhone)}</p>}
          <p className="mt-2">
            Shipped to: {invoice.shippedToName ?? "same as above"}
            {invoice.transport && `, by ${invoice.transport}`}
            {invoice.grRrNo && `, GR/RR ${invoice.grRrNo}`}
            {invoice.vehicleNo && `, vehicle ${invoice.vehicleNo}`}
            {invoice.station && `, station ${invoice.station}`}
          </p>
        </div>
        <div>
          <p>Bill number</p>
          <p className="font-mono text-[20pt] leading-tight font-bold">{invoice.invoiceNo}</p>
          <p className="mt-2 font-bold">{formatDate(invoice.date)}</p>
          <p>
            Place of supply: {stateName(invoice.placeOfSupply)} ({invoice.placeOfSupply})
          </p>
          <p>Reverse charge: {invoice.reverseCharge ? "yes" : "no"}</p>
        </div>
      </div>

      <table className="mt-6">
        <thead>
          <tr>
            <th className={`${th} w-[8mm] text-left`}>No.</th>
            <th className={`${th} text-left`}>Item</th>
            <th className={`${th} text-left`}>Design</th>
            <th className={`${th} text-left`}>HSN</th>
            <th className={`${th} text-right`}>GST</th>
            <th className={`${th} text-right`}>Quantity</th>
            <th className={`${th} text-right`}>Rate</th>
            <th className={`${th} text-right`}>Amount</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {lines.map((l) => (
            <tr key={l.id}>
              <td className={td}>{l.lineNo}</td>
              <td className={`${td} font-sans font-bold`}>{l.description}</td>
              <td className={td}>{l.designNo}</td>
              <td className={td}>{l.hsnCode}</td>
              <td className={`${td} text-right`}>{formatBp(l.gstRateBp)}</td>
              <td className={`${td} text-right whitespace-nowrap`}>
                {l.qty} {l.unit}
              </td>
              <td className={`${td} text-right`}>{formatPaise(l.rate)}</td>
              <td className={`${td} text-right`}>{formatPaise(l.gross)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 grid grid-cols-[1fr_70mm] items-start gap-8">
        <div>
          <p>Amount in words</p>
          <p className="text-[13pt] font-bold">{amountInWords(invoice.grandTotal)}</p>

          <table className="mt-5 text-[9.5pt]">
            <thead>
              <tr>
                <th className={`${th} border-y text-left`}>HSN</th>
                <th className={`${th} border-y text-right`}>Taxable</th>
                {sameState ? (
                  <>
                    <th className={`${th} border-y text-right`}>CGST</th>
                    <th className={`${th} border-y text-right`}>SGST</th>
                  </>
                ) : (
                  <th className={`${th} border-y text-right`}>IGST</th>
                )}
                <th className={`${th} border-y text-right`}>Total tax</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {taxSummary.map((t) => (
                <tr key={t.id}>
                  <td className={td}>{t.hsnCode}</td>
                  <td className={`${td} text-right`}>{formatPaise(t.taxable)}</td>
                  {sameState ? (
                    <>
                      <td className={`${td} text-right`}>
                        {formatPaise(t.cgst)} at {formatBp(t.gstRateBp / 2)}
                      </td>
                      <td className={`${td} text-right`}>
                        {formatPaise(t.sgst)} at {formatBp(t.gstRateBp / 2)}
                      </td>
                    </>
                  ) : (
                    <td className={`${td} text-right`}>
                      {formatPaise(t.igst)} at {formatBp(t.gstRateBp)}
                    </td>
                  )}
                  <td className={`${td} text-right`}>{formatPaise(t.cgst + t.sgst + t.igst)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <table className="font-mono">
            <tbody>
              <tr>
                <td className="py-1 font-sans">Gross</td>
                <td className="py-1 text-right">{formatPaise(invoice.gross)}</td>
              </tr>
              {invoice.discounts.map((d) => (
                <tr key={d.seq}>
                  <td className="py-1 font-sans">Less discount {formatPercentMilli(d.percentMilli)}</td>
                  <td className="py-1 text-right">{formatPaise(-d.amount)}</td>
                </tr>
              ))}
              <tr className="border-t border-neutral-500">
                <td className="py-1 font-sans">Taxable value</td>
                <td className="py-1 text-right">{formatPaise(invoice.taxable)}</td>
              </tr>
              {sameState ? (
                <>
                  <tr>
                    <td className="py-1 font-sans">CGST</td>
                    <td className="py-1 text-right">{formatPaise(invoice.cgst)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-sans">SGST</td>
                    <td className="py-1 text-right">{formatPaise(invoice.sgst)}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td className="py-1 font-sans">IGST</td>
                  <td className="py-1 text-right">{formatPaise(invoice.igst)}</td>
                </tr>
              )}
              <tr>
                <td className="py-1 font-sans">Round off</td>
                <td className="py-1 text-right">{formatSigned(invoice.roundOff)}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-2 border-y-[3pt] border-black py-2">
            <p>Grand total</p>
            <p className="text-right font-mono text-[22pt] leading-tight font-bold">
              {formatRupees(invoice.grandTotal)}
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-auto pt-8">
        <div className="grid grid-cols-[1fr_1.2fr_1fr] gap-8 border-t-[1.5pt] border-black pt-3 text-[9.5pt]">
          <div>
            <p className="font-bold">Pay to</p>
            <p>
              {firm.bankName}, {firm.bankBranch}
            </p>
            <p>
              Account <span className="font-mono">{firm.bankAccountNo}</span>
            </p>
            <p>
              IFSC <span className="font-mono">{firm.ifsc}</span>
            </p>
          </div>
          <div>
            <p className="font-bold">Terms</p>
            <p className="whitespace-pre-line">{firm.termsText}</p>
          </div>
          <div className="flex min-h-[32mm] flex-col justify-between">
            <p className="font-bold">For {firm.name}</p>
            <p className="border-t border-black pt-1">Authorised signatory</p>
          </div>
        </div>
        <p className="mt-3 text-[8.5pt]">
          Page {page} of {pages}
        </p>
      </footer>
    </article>
  );
}

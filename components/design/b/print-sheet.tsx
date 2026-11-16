import { amountInWords } from "@/lib/amount-in-words";
import {
  formatBp,
  formatDateNumeric,
  formatPaise,
  formatPercentMilli,
  formatPhone,
  formatSigned,
} from "@/lib/money";
import { stateName } from "@/lib/states";
import type { Business, SaleDetail } from "@/lib/types";

const c = "border-r border-black px-1.5 py-1 last:border-r-0";
const h = `${c} border-b font-bold`;

function Pair({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <p className="grid grid-cols-[28mm_1fr]">
      <span>{k}</span>
      <span className="font-mono font-semibold">: {v}</span>
    </p>
  );
}

/** Direction B: the classic bill-book format. One frame, every part a ruled cell, firm name centred. */
export function PrintSheetB({
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
  const totalQty = lines.reduce((sum, l) => sum + l.qty, 0);

  return (
    <article className="sheet text-[10pt]" style={{ padding: "9mm" }}>
      <div className="flex flex-1 flex-col border-2 border-black">
        <div className="grid grid-cols-3 items-center border-b border-black px-2 py-1">
          <p>
            GSTIN: <b className="font-mono">{firm.gstin}</b>
          </p>
          <p className="text-center text-[11pt] font-bold tracking-wide">TAX INVOICE</p>
          <p className="text-right font-semibold uppercase">{copy}</p>
        </div>

        <div className="border-b border-black px-2 py-2 text-center">
          <p className="text-[22pt] leading-tight font-bold">{firm.name}</p>
          <p>{firm.address}</p>
          <p>
            {firm.phone && `Phone: ${formatPhone(firm.phone)}`}
            {firm.pan && `, PAN: ${firm.pan}`}, State: {stateName(firm.stateCode)} ({firm.stateCode})
          </p>
        </div>

        <div className="grid grid-cols-2 border-b border-black">
          <div className="border-r border-black px-2 py-1.5">
            <Pair k="Bill no." v={invoice.invoiceNo} />
            <Pair k="Date" v={formatDateNumeric(invoice.date)} />
            <Pair k="Place of supply" v={`${stateName(invoice.placeOfSupply)} (${invoice.placeOfSupply})`} />
            <Pair k="Reverse charge" v={invoice.reverseCharge ? "Yes" : "No"} />
          </div>
          <div className="px-2 py-1.5">
            <Pair k="Transport" v={invoice.transport ?? ""} />
            <Pair k="GR/RR no." v={invoice.grRrNo ?? ""} />
            <Pair k="Vehicle no." v={invoice.vehicleNo ?? ""} />
            <Pair k="Station" v={invoice.station ?? ""} />
          </div>
        </div>

        <div className="grid grid-cols-2 border-b border-black">
          <div className="border-r border-black px-2 py-1.5">
            <p className="font-semibold underline">Billed to</p>
            <p className="text-[12pt] font-bold">{invoice.billedToName}</p>
            <p>{invoice.billedToAddress}</p>
            <p>
              GSTIN: <span className="font-mono font-semibold">{invoice.billedToGstin ?? "Unregistered"}</span>
            </p>
            <p>
              State: {stateName(invoice.billedToStateCode)} ({invoice.billedToStateCode})
              {invoice.billedToPhone && `, Phone: ${formatPhone(invoice.billedToPhone)}`}
            </p>
          </div>
          <div className="px-2 py-1.5">
            <p className="font-semibold underline">Shipped to</p>
            <p className="text-[12pt] font-bold">{invoice.shippedToName ?? invoice.billedToName}</p>
            <p>{invoice.shippedToName ? invoice.shippedToAddress : invoice.billedToAddress}</p>
          </div>
        </div>

        <div className="flex flex-1">
          <table className="h-full font-mono">
            <thead className="font-sans">
              <tr>
                <th className={`${h} w-[9mm] text-left`}>Sr</th>
                <th className={`${h} text-left`}>Description of goods</th>
                <th className={`${h} w-[20mm] text-left`}>Design</th>
                <th className={`${h} w-[22mm] text-left`}>HSN</th>
                <th className={`${h} w-[13mm] text-right`}>GST</th>
                <th className={`${h} w-[20mm] text-right`}>Qty</th>
                <th className={`${h} w-[22mm] text-right`}>Rate</th>
                <th className={`${h} w-[28mm] text-right`}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.id} className="align-top">
                  <td className={c}>{l.lineNo}</td>
                  <td className={`${c} font-sans font-semibold`}>{l.description}</td>
                  <td className={c}>{l.designNo}</td>
                  <td className={c}>{l.hsnCode}</td>
                  <td className={`${c} text-right`}>{formatBp(l.gstRateBp)}</td>
                  <td className={`${c} text-right whitespace-nowrap`}>
                    {l.qty} {l.unit}
                  </td>
                  <td className={`${c} text-right`}>{formatPaise(l.rate)}</td>
                  <td className={`${c} text-right`}>{formatPaise(l.gross)}</td>
                </tr>
              ))}
              <tr aria-hidden>
                {Array.from({ length: 8 }, (_, i) => (
                  <td key={i} className="border-r border-black last:border-r-0" />
                ))}
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-y border-black font-bold">
                <td className={c} />
                <td className={`${c} font-sans`} colSpan={4}>
                  Total
                </td>
                <td className={`${c} text-right`}>{totalQty}</td>
                <td className={c} />
                <td className={`${c} text-right`}>{formatPaise(invoice.gross)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="grid grid-cols-[1fr_70mm] border-b border-black">
          <div className="border-r border-black">
            <table className="font-mono">
              <thead className="font-sans">
                <tr>
                  <th className={`${h} text-left`}>HSN</th>
                  <th className={`${h} text-right`}>Taxable</th>
                  {sameState ? (
                    <>
                      <th className={`${h} text-right`}>CGST</th>
                      <th className={`${h} text-right`}>SGST</th>
                    </>
                  ) : (
                    <th className={`${h} text-right`}>IGST</th>
                  )}
                  <th className={`${h} text-right`}>Total tax</th>
                </tr>
              </thead>
              <tbody>
                {taxSummary.map((t) => (
                  <tr key={t.id} className="border-b border-black">
                    <td className={c}>{t.hsnCode}</td>
                    <td className={`${c} text-right`}>{formatPaise(t.taxable)}</td>
                    {sameState ? (
                      <>
                        <td className={`${c} text-right`}>
                          {formatBp(t.gstRateBp / 2)}: {formatPaise(t.cgst)}
                        </td>
                        <td className={`${c} text-right`}>
                          {formatBp(t.gstRateBp / 2)}: {formatPaise(t.sgst)}
                        </td>
                      </>
                    ) : (
                      <td className={`${c} text-right`}>
                        {formatBp(t.gstRateBp)}: {formatPaise(t.igst)}
                      </td>
                    )}
                    <td className={`${c} text-right`}>{formatPaise(t.cgst + t.sgst + t.igst)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-b border-black px-2 py-1.5">
              Amount in words: <b>{amountInWords(invoice.grandTotal)}</b>
            </p>
            <div className="px-2 py-1.5">
              <p className="font-semibold underline">Bank details</p>
              <Pair k="Bank" v={`${firm.bankName}, ${firm.bankBranch}`} />
              <Pair k="A/c no." v={firm.bankAccountNo} />
              <Pair k="IFSC" v={firm.ifsc} />
            </div>
          </div>

          <table className="self-start font-mono">
            <tbody>
              <tr>
                <td className="px-2 py-1 font-sans">Gross amount</td>
                <td className="px-2 py-1 text-right">{formatPaise(invoice.gross)}</td>
              </tr>
              {invoice.discounts.map((d) => (
                <tr key={d.seq}>
                  <td className="px-2 py-1 font-sans">Less discount {formatPercentMilli(d.percentMilli)}</td>
                  <td className="px-2 py-1 text-right">{formatPaise(d.amount)}</td>
                </tr>
              ))}
              <tr className="border-t border-black">
                <td className="px-2 py-1 font-sans">Taxable value</td>
                <td className="px-2 py-1 text-right">{formatPaise(invoice.taxable)}</td>
              </tr>
              {sameState ? (
                <>
                  <tr>
                    <td className="px-2 py-1 font-sans">Add CGST</td>
                    <td className="px-2 py-1 text-right">{formatPaise(invoice.cgst)}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 font-sans">Add SGST</td>
                    <td className="px-2 py-1 text-right">{formatPaise(invoice.sgst)}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td className="px-2 py-1 font-sans">Add IGST</td>
                  <td className="px-2 py-1 text-right">{formatPaise(invoice.igst)}</td>
                </tr>
              )}
              <tr>
                <td className="px-2 py-1 font-sans">Round off</td>
                <td className="px-2 py-1 text-right">{formatSigned(invoice.roundOff)}</td>
              </tr>
              <tr className="border-y-2 border-black text-[13pt] font-bold">
                <td className="px-2 py-1.5 font-sans">Grand total ₹</td>
                <td className="px-2 py-1.5 text-right">{formatPaise(invoice.grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-[1fr_70mm]">
          <div className="border-r border-black px-2 py-1.5">
            <p className="font-semibold underline">Terms</p>
            <p className="text-[9pt] whitespace-pre-line">{firm.termsText}</p>
          </div>
          <div className="flex min-h-[30mm] flex-col justify-between px-2 py-1.5 text-right">
            <p className="font-bold">For {firm.name}</p>
            <p>Authorised signatory</p>
          </div>
        </div>
      </div>
      <p className="mt-1 text-center text-[8.5pt]">
        Page {page} of {pages}
      </p>
    </article>
  );
}

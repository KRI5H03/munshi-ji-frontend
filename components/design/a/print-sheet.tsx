import { amountInWords } from "@/lib/amount-in-words";
import {
  formatBp,
  formatDateNumeric,
  formatPaise,
  formatPercentMilli,
  formatPhone,
  formatRupees,
  formatSigned,
} from "@/lib/money";
import { stateName } from "@/lib/states";
import type { Business, SaleDetail } from "@/lib/types";

const cell = "border border-black px-2 py-1.5";
const th = `${cell} font-bold`;

/** Direction A: the reference bill. Separate boxes, firm on the left, bill details on the right. */
export function PrintSheetA({
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
    <article className="sheet">
      <header className="flex items-center justify-between border-b-2 border-black pb-2">
        <h1 className="text-[15pt] font-bold tracking-wide">TAX INVOICE</h1>
        <p className="border-2 border-black px-3 py-1 text-[9.5pt] font-bold uppercase">{copy}</p>
      </header>

      <div className="mt-4 flex justify-between gap-6">
        <div>
          <p className="text-[19pt] leading-tight font-bold">{firm.name}</p>
          <p className="mt-1">{firm.address}</p>
          <p>
            GSTIN: <b>{firm.gstin}</b>, State code: {firm.stateCode}
          </p>
          {firm.phone && <p>Phone: {formatPhone(firm.phone)}</p>}
        </div>
        <table className="num w-auto! shrink-0 self-start">
          <tbody>
            {[
              ["Bill no.", invoice.invoiceNo],
              ["Date", formatDateNumeric(invoice.date)],
              ["Place of supply", `${invoice.placeOfSupply} ${stateName(invoice.placeOfSupply)}`],
              ["Reverse charge", invoice.reverseCharge ? "Yes" : "No"],
            ].map(([k, v]) => (
              <tr key={k}>
                <td className="pr-4">{k}</td>
                <td className="font-bold">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-2 border border-black">
        <div className="border-r border-black p-3">
          <p className="text-[9pt] font-bold">Billed to</p>
          <p className="text-[12pt] font-bold">{invoice.billedToName}</p>
          {invoice.billedToAddress && <p>{invoice.billedToAddress}</p>}
          <p>
            {invoice.billedToGstin ? `GSTIN: ${invoice.billedToGstin}, ` : ""}State code: {invoice.billedToStateCode}
          </p>
          {invoice.billedToPhone && <p>Phone: {formatPhone(invoice.billedToPhone)}</p>}
        </div>
        <div className="p-3">
          <p className="text-[9pt] font-bold">Shipped to</p>
          <p>{invoice.shippedToName ?? "Same as billed to"}</p>
          {invoice.shippedToAddress && <p>{invoice.shippedToAddress}</p>}
          <p className="mt-2">Transport: {invoice.transport ?? "—"}</p>
          <p>
            GR/RR no.: {invoice.grRrNo ?? "—"}, Vehicle: {invoice.vehicleNo ?? "—"}
          </p>
        </div>
      </div>

      <table className="num mt-4">
        <thead>
          <tr>
            <th className={`${th} w-[8mm] text-left`}>Sr</th>
            <th className={`${th} text-left`}>Description</th>
            <th className={`${th} text-left`}>Design</th>
            <th className={`${th} text-left`}>HSN</th>
            <th className={`${th} text-right`}>Qty</th>
            <th className={`${th} text-right`}>Rate</th>
            <th className={`${th} text-right`}>GST</th>
            <th className={`${th} text-right`}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.id} className="align-top">
              <td className={`${cell} border-b-0`}>{l.lineNo}</td>
              <td className={`${cell} border-b-0`}>{l.description}</td>
              <td className={`${cell} border-b-0`}>{l.designNo}</td>
              <td className={`${cell} border-b-0`}>{l.hsnCode}</td>
              <td className={`${cell} border-b-0 text-right whitespace-nowrap`}>
                {l.qty} {l.unit}
              </td>
              <td className={`${cell} border-b-0 text-right`}>{formatPaise(l.rate)}</td>
              <td className={`${cell} border-b-0 text-right`}>{formatBp(l.gstRateBp)}</td>
              <td className={`${cell} border-b-0 text-right`}>{formatPaise(l.gross)}</td>
            </tr>
          ))}
          <tr aria-hidden style={{ height: "62mm" }}>
            {Array.from({ length: 8 }, (_, i) => (
              <td key={i} className="border border-t-0 border-black" />
            ))}
          </tr>
        </tbody>
      </table>

      <div className="mt-4 grid grid-cols-[1fr_72mm] items-start gap-4">
        <div>
          <table className="num">
            <thead>
              <tr>
                <th className={`${th} text-left`}>HSN</th>
                <th className={`${th} text-right`}>Taxable</th>
                {sameState ? (
                  <>
                    <th className={`${th} text-right`}>CGST</th>
                    <th className={`${th} text-right`}>SGST</th>
                  </>
                ) : (
                  <th className={`${th} text-right`}>IGST</th>
                )}
                <th className={`${th} text-right`}>Total tax</th>
              </tr>
            </thead>
            <tbody>
              {taxSummary.map((t) => (
                <tr key={t.id}>
                  <td className={cell}>{t.hsnCode}</td>
                  <td className={`${cell} text-right`}>{formatPaise(t.taxable)}</td>
                  {sameState ? (
                    <>
                      <td className={`${cell} text-right`}>
                        {formatPaise(t.cgst)} <span className="text-[8.5pt]">@{formatBp(t.gstRateBp / 2)}</span>
                      </td>
                      <td className={`${cell} text-right`}>
                        {formatPaise(t.sgst)} <span className="text-[8.5pt]">@{formatBp(t.gstRateBp / 2)}</span>
                      </td>
                    </>
                  ) : (
                    <td className={`${cell} text-right`}>
                      {formatPaise(t.igst)} <span className="text-[8.5pt]">@{formatBp(t.gstRateBp)}</span>
                    </td>
                  )}
                  <td className={`${cell} text-right`}>{formatPaise(t.cgst + t.sgst + t.igst)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 border border-black p-2">
            <b>Amount in words:</b> {amountInWords(invoice.grandTotal)}
          </p>
        </div>

        <table className="num border border-black">
          <tbody>
            <tr className="border-b border-neutral-400">
              <td className="px-3 py-1.5">Gross</td>
              <td className="px-3 py-1.5 text-right">{formatPaise(invoice.gross)}</td>
            </tr>
            {invoice.discounts.map((d) => (
              <tr key={d.seq} className="border-b border-neutral-400">
                <td className="px-3 py-1.5">Less: discount {formatPercentMilli(d.percentMilli)}</td>
                <td className="px-3 py-1.5 text-right">{formatPaise(d.amount)}</td>
              </tr>
            ))}
            <tr className="border-b border-neutral-400">
              <td className="px-3 py-1.5">Taxable value</td>
              <td className="px-3 py-1.5 text-right">{formatPaise(invoice.taxable)}</td>
            </tr>
            {sameState ? (
              <>
                <tr className="border-b border-neutral-400">
                  <td className="px-3 py-1.5">CGST</td>
                  <td className="px-3 py-1.5 text-right">{formatPaise(invoice.cgst)}</td>
                </tr>
                <tr className="border-b border-neutral-400">
                  <td className="px-3 py-1.5">SGST</td>
                  <td className="px-3 py-1.5 text-right">{formatPaise(invoice.sgst)}</td>
                </tr>
              </>
            ) : (
              <tr className="border-b border-neutral-400">
                <td className="px-3 py-1.5">IGST</td>
                <td className="px-3 py-1.5 text-right">{formatPaise(invoice.igst)}</td>
              </tr>
            )}
            <tr>
              <td className="px-3 py-1.5">Round off</td>
              <td className="px-3 py-1.5 text-right">{formatSigned(invoice.roundOff)}</td>
            </tr>
            <tr className="border-t-2 border-black text-[12pt] font-bold">
              <td className="px-3 py-2">Grand total</td>
              <td className="px-3 py-2 text-right">{formatRupees(invoice.grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer className="mt-auto pt-6">
        <div className="grid grid-cols-3 border border-black">
          <div className="border-r border-black p-3">
            <p className="font-bold">Bank details</p>
            <p>
              {firm.bankName}, {firm.bankBranch}
            </p>
            <p className="num">A/c: {firm.bankAccountNo}</p>
            <p className="num">IFSC: {firm.ifsc}</p>
          </div>
          <div className="border-r border-black p-3">
            <p className="font-bold">Terms</p>
            <p className="text-[9pt] whitespace-pre-line">{firm.termsText}</p>
          </div>
          <div className="flex min-h-[34mm] flex-col justify-between p-3 text-right">
            <p className="font-bold">For {firm.name}</p>
            <p>Authorised signatory</p>
          </div>
        </div>
        <p className="mt-2 text-center text-[8.5pt]">
          Page {page} of {pages}
        </p>
      </footer>
    </article>
  );
}

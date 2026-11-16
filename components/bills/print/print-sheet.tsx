import { amountInWords } from "@/lib/amount-in-words";
import { formatBp, formatDateNumeric, formatPaise, formatPercentMilli, formatPhone } from "@/lib/money";
import { formatQty, formatUnit, groupTaxByRate, totalQuantity } from "@/lib/print";
import { stateName } from "@/lib/states";
import type { Business, Invoice, SaleDetail } from "@/lib/types";

type Party = {
  name: string | null;
  address: string | null;
  pan: string | null;
  phone: string | null;
  gstin: string | null;
};

/** Label, colon, value: the colons line up down the column as on a Busy bill. */
function Rows({ rows, labelWidth }: { rows: [string, string | null][]; labelWidth: string }) {
  return (
    <dl className="grid gap-x-2" style={{ gridTemplateColumns: `${labelWidth} auto 1fr` }}>
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt>{label}</dt>
          <span aria-hidden>:</span>
          <dd className="font-bold">{value ?? ""}</dd>
        </div>
      ))}
    </dl>
  );
}

function PartyBox({ title, party }: { title: string; party: Party }) {
  return (
    <div className="p-[2mm]">
      <p className="italic">{title} :</p>
      <p className="text-[11pt] font-bold">{party.name ?? ""}</p>
      <p className="min-h-[2.8em]">{party.address ?? ""}</p>
      <Rows
        labelWidth="31mm"
        rows={[
          ["Party PAN", party.pan],
          ["Party Mobile No", party.phone ? formatPhone(party.phone) : null],
          // The API returns the Aadhaar number only in encrypted form, so it cannot be printed yet.
          ["Party Aadhaar No", null],
          ["GSTIN / UIN", party.gstin],
        ]}
      />
    </div>
  );
}

function shippedTo(invoice: Invoice): Party {
  // Busy repeats the billed-to party when goods go to the same place.
  if (!invoice.shippedToContactId) return billedTo(invoice);
  return {
    name: invoice.shippedToName,
    address: invoice.shippedToAddress,
    pan: invoice.shippedToPan,
    phone: invoice.shippedToPhone,
    gstin: invoice.shippedToGstin,
  };
}

function billedTo(invoice: Invoice): Party {
  return {
    name: invoice.billedToName,
    address: invoice.billedToAddress,
    pan: invoice.billedToPan,
    phone: invoice.billedToPhone,
    gstin: invoice.billedToGstin,
  };
}

const COLS = ["9mm", "auto", "21mm", "19mm", "18mm", "13mm", "22mm", "27mm"];
const HEADS = ["S.N.", "Description of Goods", "HSN/SAC", "D. No.", "Qty.", "Unit", "Price", "Amount"];
const RIGHT = new Set([4, 6, 7]);
/**
 * The printed tax invoice, laid out like the firm's Busy bills. One of these per copy.
 * Every figure comes from the saved bill (GET /sales/:id); nothing is worked out again here.
 */
export function PrintSheet({ firm, sale, copy }: { firm: Business; sale: SaleDetail; copy: string }) {
  const { invoice, lines, taxSummary } = sale;
  const interState = invoice.igst !== 0;
  const rates = groupTaxByRate(taxSummary);
  const col = "border-r border-black px-[1.5mm] last:border-r-0";

  const adjustments: [string, string][] = [
    ...invoice.discounts.map((d): [string, string] => [
      `Less : Discount @ ${formatPercentMilli(d.percentMilli)}`,
      formatPaise(d.amount),
    ]),
    ...rates.flatMap((r): [string, string][] =>
      interState
        ? [[`Add : IGST @ ${formatBp(r.gstRateBp)}`, formatPaise(r.igst)]]
        : [
            [`Add : CGST @ ${formatBp(r.gstRateBp / 2)}`, formatPaise(r.cgst)],
            [`Add : SGST @ ${formatBp(r.gstRateBp / 2)}`, formatPaise(r.sgst)],
          ],
    ),
    [`Add : Rounded Off (${invoice.roundOff < 0 ? "-" : "+"})`, formatPaise(Math.abs(invoice.roundOff))],
  ];

  return (
    <article className="sheet num relative text-[9.5pt] leading-[1.35]">
      {invoice.status === "cancelled" && (
        // A large mark across the copy, like a stamp on a paper bill. Grey ink so the figures stay readable.
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
          <span className="-rotate-[28deg] border-[2.5mm] border-black/30 px-[8mm] py-[2mm] text-[64pt] leading-none font-bold tracking-[0.12em] text-black/30">
            CANCELLED
          </span>
        </div>
      )}
      <header>
        <div className="flex justify-between">
          <p>
            GSTIN : <b>{firm.gstin}</b>
          </p>
          <p className="font-bold">{copy}</p>
        </div>
        <div className="mt-[1mm] text-center">
          <p className="font-bold underline underline-offset-2">TAX INVOICE</p>
          {invoice.status === "cancelled" && (
            <p className="mt-[1mm] inline-block border-2 border-black px-[3mm] text-[12pt] font-bold">CANCELLED</p>
          )}
          <h1 className="mt-[1mm] text-[20pt] leading-tight font-bold">{firm.name}</h1>
          {firm.msmeUdhyamNo && <p>MSME Udyam No. : {firm.msmeUdhyamNo}</p>}
          <p>{firm.address}</p>
          {firm.branchAddress && <p>Branch : {firm.branchAddress}</p>}
          {firm.phone && <p>Phone : {formatPhone(firm.phone)}</p>}
        </div>
      </header>

      <div className="mt-[2mm] flex flex-1 flex-col border border-black">
        <div className="grid grid-cols-2 border-b border-black">
          <div className="border-r border-black p-[2mm]">
            <Rows
              labelWidth="31mm"
              rows={[
                ["Invoice No.", invoice.invoiceNo],
                ["Dated", formatDateNumeric(invoice.date)],
                ["Place of Supply", `${stateName(invoice.placeOfSupply)} (${invoice.placeOfSupply})`],
                ["Reverse Charge", invoice.reverseCharge ? "Y" : "N"],
              ]}
            />
          </div>
          <div className="p-[2mm]">
            <Rows
              labelWidth="24mm"
              rows={[
                ["GR/RR No.", invoice.grRrNo],
                ["Transport", invoice.transport],
                ["Vehicle No.", invoice.vehicleNo],
                ["Station", invoice.station],
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 border-b border-black">
          <div className="border-r border-black">
            <PartyBox title="Billed to" party={billedTo(invoice)} />
          </div>
          <PartyBox title="Shipped to" party={shippedTo(invoice)} />
        </div>

        {/* The empty row stretches, so a short bill still fills the page and the column rules run to the bottom. */}
        <div className="flex-1">
          <table className="h-full">
            <colgroup>
              {COLS.map((width, i) => (
                <col key={i} style={{ width }} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b border-black">
                {HEADS.map((head, i) => (
                  <th key={head} className={`${col} py-[1mm] font-bold ${RIGHT.has(i) ? "text-right" : "text-left"}`}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="align-top">
                  <td className={`${col} pt-[1mm]`}>{line.lineNo}.</td>
                  <td className={`${col} pt-[1mm] font-bold`}>{line.description}</td>
                  <td className={`${col} pt-[1mm]`}>{line.hsnCode}</td>
                  <td className={`${col} pt-[1mm]`}>{line.designNo}</td>
                  <td className={`${col} pt-[1mm] text-right`}>{formatQty(line.qty)}</td>
                  <td className={`${col} pt-[1mm]`}>{formatUnit(line.unit)}</td>
                  <td className={`${col} pt-[1mm] text-right`}>{formatPaise(line.rate)}</td>
                  <td className={`${col} pt-[1mm] text-right`}>{formatPaise(line.gross)}</td>
                </tr>
              ))}
              <tr aria-hidden className="h-full">
                {COLS.map((_, i) => (
                  <td key={i} className={col} />
                ))}
              </tr>
              <tr>
                {COLS.slice(1).map((_, i) => (
                  <td key={i} className={col} />
                ))}
                <td className={`${col} border-t border-black pt-[0.5mm] text-right`}>{formatPaise(invoice.gross)}</td>
              </tr>
              {adjustments.map(([label, amount]) => (
                <tr key={label}>
                  <td className={col} />
                  <td className={`${col} text-right whitespace-nowrap italic`}>{label}</td>
                  {COLS.slice(3).map((_, i) => (
                    <td key={i} className={col} />
                  ))}
                  <td className={`${col} text-right`}>{amount}</td>
                </tr>
              ))}
              <tr aria-hidden className="h-[1.5mm]">
                {COLS.map((_, i) => (
                  <td key={i} className={col} />
                ))}
              </tr>
              <tr className="border-t border-black text-[11pt] font-bold">
                <td className="px-[1.5mm] py-[1mm] text-right" colSpan={4}>
                  Grand Total
                </td>
                <td className="px-[1.5mm] py-[1mm] text-right whitespace-nowrap" colSpan={2}>
                  {totalQuantity(lines)}
                </td>
                <td className="px-[1.5mm] py-[1mm] text-right whitespace-nowrap" colSpan={2}>
                  ₹ {formatPaise(invoice.grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <table className="border-t border-black">
          <thead>
            <tr className="border-b border-black">
              <th className={`${col} py-[0.5mm] text-left font-bold`}>Tax Rate</th>
              <th className={`${col} py-[0.5mm] text-right font-bold`}>Taxable Amt.</th>
              {interState ? (
                <th className={`${col} py-[0.5mm] text-right font-bold`}>IGST Amt.</th>
              ) : (
                <>
                  <th className={`${col} py-[0.5mm] text-right font-bold`}>CGST Amt.</th>
                  <th className={`${col} py-[0.5mm] text-right font-bold`}>SGST Amt.</th>
                </>
              )}
              <th className={`${col} py-[0.5mm] text-right font-bold`}>Total Tax</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((r) => (
              <tr key={r.gstRateBp}>
                <td className={col}>{formatBp(r.gstRateBp)}</td>
                <td className={`${col} text-right`}>{formatPaise(r.taxable)}</td>
                {interState ? (
                  <td className={`${col} text-right`}>{formatPaise(r.igst)}</td>
                ) : (
                  <>
                    <td className={`${col} text-right`}>{formatPaise(r.cgst)}</td>
                    <td className={`${col} text-right`}>{formatPaise(r.sgst)}</td>
                  </>
                )}
                <td className={`${col} text-right`}>{formatPaise(r.cgst + r.sgst + r.igst)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="border-t border-black px-[2mm] py-[1mm] font-bold">{amountInWords(invoice.grandTotal)}</p>

        <p className="flex flex-wrap gap-x-[5mm] border-t border-black px-[2mm] py-[1mm]">
          <b>Bank Details :</b>
          <span>{[firm.bankName, firm.bankBranch].filter(Boolean).join(", ")}</span>
          <span>A/c No. : {firm.bankAccountNo ?? ""}</span>
          <span>IFSC : {firm.ifsc ?? ""}</span>
        </p>

        <footer className="grid min-h-[30mm] grid-cols-[1fr_48mm_56mm] border-t border-black">
          <div className="border-r border-black p-[2mm] text-[8.5pt]">
            <p className="font-bold underline underline-offset-2">Terms &amp; Conditions</p>
            <p>E.&amp; O.E.</p>
            <p className="whitespace-pre-line">{firm.termsText ?? ""}</p>
          </div>
          <div className="border-r border-black p-[2mm]">Receiver&apos;s Signature :</div>
          <div className="flex flex-col justify-between p-[2mm] text-right">
            <p className="font-bold">For {firm.name}</p>
            <p>Authorised Signatory</p>
          </div>
        </footer>
      </div>
    </article>
  );
}

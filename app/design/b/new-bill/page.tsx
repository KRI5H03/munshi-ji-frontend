import { BShell, Kbd, btn, btnPrimary, focusedCls, inputCls, mono } from "@/components/design/b/ui";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { amountInWords } from "@/lib/amount-in-words";
import { formatBp, formatPaise, formatPercentMilli, formatRupees, formatSigned } from "@/lib/money";
import { bill, contacts, items } from "@/lib/mock";

const head = "border-b border-black border-r border-r-border bg-muted px-2 py-2 font-semibold whitespace-nowrap last:border-r-0";
const cell = "border-b border-r border-border p-0 last:border-r-0";
const cellInput =
  "h-11 w-full rounded-none border-0 bg-transparent px-2 text-base md:text-base transition-none focus-visible:bg-accent focus-visible:ring-0";
const label = "block px-2 pt-1 text-muted-foreground";

export default function NewBillB() {
  const { invoice, lines } = bill;
  const customer = contacts[1];
  const half = formatBp(lines[0].gstRateBp / 2);
  const match = items[1];

  return (
    <BShell
      active="new-bill"
      keys={[
        ["Enter", "Next field"],
        ["↑ ↓", "Pick item"],
        ["Ctrl+S", "Save"],
        ["Ctrl+P", "Save and print"],
        ["Ctrl+D", "Delete line"],
        ["Esc", "Cancel"],
      ]}
    >
      <div className="grid border border-black xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0">
          {/* Party, date, number */}
          <div className="grid border-b border-black sm:grid-cols-[minmax(0,1fr)_11rem_10rem]">
            <label className="border-b border-border sm:border-r sm:border-b-0">
              <span className={label}>Party</span>
              <Input defaultValue={customer.name} className={cn(cellInput, "font-bold")} />
            </label>
            <label className="border-b border-border sm:border-r sm:border-b-0">
              <span className={label}>Date</span>
              <Input type="date" defaultValue={invoice.date} className={cn(cellInput, mono)} />
            </label>
            <div>
              <span className={label}>Bill no.</span>
              <p className="flex h-11 items-center px-2 text-muted-foreground">Given on save</p>
            </div>
          </div>
          <p className="border-b border-black bg-muted px-2 py-2">
            {customer.city}, <span className={mono}>GSTIN {customer.gstin}</span>. Same state (UP 09): CGST + SGST.
          </p>

          {/* Entry grid */}
          <table className="w-full table-fixed">
            <thead>
              <tr>
                <th className={cn(head, "hidden w-10 text-left sm:table-cell")}>Sr</th>
                <th className={cn(head, "text-left")}>Item</th>
                <th className={cn(head, "hidden w-24 text-left lg:table-cell")}>Design</th>
                <th className={cn(head, "hidden w-28 text-left lg:table-cell")}>HSN</th>
                <th className={cn(head, "hidden w-20 text-right lg:table-cell")}>Stock</th>
                <th className={cn(head, "w-14 text-right sm:w-20")}>Qty</th>
                <th className={cn(head, "w-22 text-right sm:w-28")}>Rate ₹</th>
                <th className={cn(head, "w-24 text-right sm:w-32")}>Amount ₹</th>
              </tr>
            </thead>
            <tbody className={mono}>
              {lines.map((l) => (
                <tr key={l.id}>
                  <td className={cn(cell, "hidden px-2 text-muted-foreground sm:table-cell")}>{l.lineNo}</td>
                  <td className={cn(cell, "px-2 py-1 font-sans font-semibold")}>
                    {l.description}
                    <span className={cn(mono, "block font-normal text-muted-foreground lg:hidden")}>
                      {l.designNo}, {items[0].stockQty} left
                    </span>
                  </td>
                  <td className={cn(cell, "hidden px-2 lg:table-cell")}>{l.designNo}</td>
                  <td className={cn(cell, "hidden px-2 lg:table-cell")}>{l.hsnCode}</td>
                  <td className={cn(cell, "hidden px-2 text-right lg:table-cell")}>{items[0].stockQty}</td>
                  <td className={cell}>
                    <Input aria-label="Qty" inputMode="numeric" defaultValue={l.qty} className={cn(cellInput, "text-right")} />
                  </td>
                  <td className={cell}>
                    <Input
                      aria-label="Rate"
                      inputMode="decimal"
                      defaultValue={formatPaise(l.rate)}
                      className={cn(cellInput, "text-right")}
                    />
                  </td>
                  <td className={cn(cell, "px-2 text-right font-semibold")}>{formatPaise(l.gross)}</td>
                </tr>
              ))}

              {/* The line being typed: item search is open */}
              <tr>
                <td className={cn(cell, "hidden px-2 text-muted-foreground sm:table-cell")}>2</td>
                <td className={cn(cell, "relative font-sans")}>
                  <Input
                    role="combobox"
                    aria-label="Item"
                    aria-expanded
                    aria-controls="b-item-matches"
                    defaultValue="leg"
                    className={cn(inputCls, focusedCls, "border-0")}
                  />
                  <ul
                    id="b-item-matches"
                    role="listbox"
                    className="absolute top-full left-0 z-10 w-[min(32rem,calc(100vw-2rem))] border-2 border-black bg-white"
                  >
                    <li
                      role="option"
                      aria-selected
                      className="flex min-h-11 items-center justify-between gap-3 bg-black px-2 py-1 text-white"
                    >
                      <span className="font-semibold">{match.description}</span>
                      <span className={mono}>
                        {match.designNo}, {match.stockQty} {match.unit} left
                      </span>
                    </li>
                    <li className="flex min-h-11 items-center gap-2 px-2 py-1 text-muted-foreground">
                      <Kbd>↑ ↓</Kbd> move, <Kbd>Enter</Kbd> pick
                    </li>
                  </ul>
                </td>
                <td className={cn(cell, "hidden lg:table-cell")} />
                <td className={cn(cell, "hidden lg:table-cell")} />
                <td className={cn(cell, "hidden lg:table-cell")} />
                <td className={cell} />
                <td className={cell} />
                <td className={cell} />
              </tr>

              {[3, 4, 5].map((n) => (
                <tr key={n} className="h-11">
                  <td className={cn(cell, "hidden px-2 text-muted-foreground sm:table-cell")}>{n}</td>
                  <td className={cell} />
                  <td className={cn(cell, "hidden lg:table-cell")} />
                  <td className={cn(cell, "hidden lg:table-cell")} />
                  <td className={cn(cell, "hidden lg:table-cell")} />
                  <td className={cell} />
                  <td className={cell} />
                  <td className={cell} />
                </tr>
              ))}
            </tbody>
          </table>

          {/* Transport: always on screen, all optional */}
          <div className="grid grid-cols-2 border-t border-black lg:grid-cols-4">
            {["GR/RR no.", "Transport", "Vehicle no.", "Station"].map((name) => (
              <label key={name} className="border-r border-b border-border lg:border-b-0 lg:last:border-r-0">
                <span className={label}>{name}</span>
                <Input className={cellInput} />
              </label>
            ))}
          </div>
        </div>

        {/* Totals dock */}
        <aside className="border-t border-black xl:border-t-0 xl:border-l">
          <div className="grid grid-cols-2 border-b border-black">
            <label className="border-r border-border">
              <span className={label}>Discount 1 %</span>
              <Input inputMode="decimal" defaultValue="10" className={cn(cellInput, mono, "text-right")} />
            </label>
            <label>
              <span className={label}>Discount 2 %</span>
              <Input inputMode="decimal" placeholder="0" className={cn(cellInput, mono, "text-right")} />
            </label>
          </div>
          <dl className={cn(mono, "grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-3 py-3")}>
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
          <p className="flex items-baseline justify-between gap-3 bg-black px-3 py-3 font-bold text-white">
            Total
            <span className={cn(mono, "text-3xl")}>{formatRupees(invoice.grandTotal)}</span>
          </p>
          <p className="border-b border-border px-3 py-2">{amountInWords(invoice.grandTotal)}</p>
          <div className="grid gap-2 p-2">
            <button type="button" className={cn(btnPrimary, "h-12 justify-between")}>
              Save <Kbd>Ctrl+S</Kbd>
            </button>
            <button type="button" className={cn(btn, "justify-between")}>
              Save and print <Kbd>Ctrl+P</Kbd>
            </button>
          </div>
          <p className="px-3 pb-3 text-muted-foreground">Preview. The saved bill shows the final figures.</p>
        </aside>
      </div>
    </BShell>
  );
}

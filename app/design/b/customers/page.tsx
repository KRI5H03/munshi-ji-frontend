import {
  BShell,
  Field,
  Kbd,
  Pane,
  Row,
  btn,
  btnPrimary,
  inputCls,
  mono,
  selectCls,
  selectedRow,
  td,
  th,
} from "@/components/design/b/ui";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatPhone } from "@/lib/money";
import { contacts } from "@/lib/mock";
import { STATES } from "@/lib/states";

const TYPES = ["Customer", "Supplier", "Both"] as const;

export default function CustomersB() {
  return (
    <BShell
      active="customers"
      keys={[
        ["↑ ↓", "Move"],
        ["Enter", "Edit"],
        ["Del", "Delete"],
        ["/", "Search"],
        ["Alt+A", "Add new"],
        ["Ctrl+S", "Save"],
      ]}
    >
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_27rem]">
        <Pane title="Customers" right={<span className={mono}>{contacts.length} parties, A to Z</span>}>
          <div className="flex flex-wrap items-center gap-2 border-b border-black p-2">
            <Kbd>/</Kbd>
            <Input
              type="search"
              aria-label="Search customers"
              placeholder="Search name or city"
              className={cn(inputCls, "min-w-40 flex-1")}
            />
            <button type="button" className={btn}>
              Edit <Kbd className="hidden md:inline">Enter</Kbd>
            </button>
            <button type="button" className={cn(btn, "text-destructive")}>
              Delete <Kbd className="hidden md:inline">Del</Kbd>
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className={th}>Name</th>
                <th className={th}>City</th>
                <th className={cn(th, "hidden sm:table-cell")}>State</th>
                <th className={cn(th, "hidden md:table-cell")}>GSTIN</th>
                <th className={cn(th, "hidden lg:table-cell")}>Phone</th>
                <th className={cn(th, "hidden lg:table-cell")}>Type</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c, i) => (
                <tr key={c.id} aria-selected={i === 0} className={cn(i === 0 && selectedRow)}>
                  <td className={cn(td, "font-semibold")}>
                    {c.name}
                    <span className={cn(mono, "block font-normal text-muted-foreground md:hidden")}>
                      {c.gstin ?? "No GSTIN"}
                    </span>
                  </td>
                  <td className={td}>{c.city}</td>
                  <td className={cn(td, mono, "hidden sm:table-cell")}>{c.stateCode}</td>
                  <td className={cn(td, mono, "hidden md:table-cell")}>{c.gstin ?? "none"}</td>
                  <td className={cn(td, mono, "hidden whitespace-nowrap lg:table-cell")}>
                    {c.phone ? formatPhone(c.phone) : ""}
                  </td>
                  <td className={cn(td, "hidden capitalize lg:table-cell")}>{c.contactType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Pane>

        <Pane title="Add customer" right={<Kbd>Alt+A</Kbd>}>
          <form className="grid gap-2 p-3">
            <Field label="Name *" defaultValue="SHREE RAM TEXTILES" />
            <Row label="Type *">
              <div className="grid grid-cols-3">
                {TYPES.map((t, i) => (
                  <label
                    key={t}
                    className="-ml-px flex h-11 cursor-pointer items-center justify-center border border-input bg-white font-medium first:ml-0 has-checked:border-black has-checked:bg-black has-checked:text-white has-focus-visible:bg-accent has-focus-visible:text-black"
                  >
                    <input type="radio" name="contactType" className="sr-only" defaultChecked={i === 0} />
                    {t}
                  </label>
                ))}
              </div>
            </Row>
            <Field label="City *" defaultValue="Kanpur" />
            <Field
              label="GSTIN"
              defaultValue="09ABCDE1234F1Z"
              className={cn(mono, "uppercase")}
              focused
              error="Needs 15 characters. This has 14."
            />
            <Row label="State" htmlFor="b-state" hint="Used only when there is no GSTIN.">
              <select id="b-state" defaultValue="09" className={selectCls}>
                {Object.entries(STATES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {code} {name}
                  </option>
                ))}
              </select>
            </Row>
            <Field label="Phone" inputMode="numeric" placeholder="10 digits" className={mono} />
            <div className="mt-1 grid grid-cols-2 gap-2">
              <button type="button" className={cn(btnPrimary, "justify-between")}>
                Save <Kbd>Ctrl+S</Kbd>
              </button>
              <button type="button" className={cn(btn, "justify-between")}>
                Clear <Kbd>Esc</Kbd>
              </button>
            </div>
          </form>
        </Pane>
      </div>
    </BShell>
  );
}

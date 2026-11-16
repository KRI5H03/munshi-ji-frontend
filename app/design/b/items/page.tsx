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
import { LOW_STOCK_AT, items } from "@/lib/mock";

export default function ItemsB() {
  return (
    <BShell
      active="items"
      keys={[
        ["↑ ↓", "Move"],
        ["Enter", "Edit"],
        ["/", "Search"],
        ["Alt+A", "Add new"],
        ["Ctrl+S", "Save"],
      ]}
    >
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_27rem]">
        <Pane title="Items" right={<span>Stock goes down when a bill is saved</span>}>
          <div className="flex items-center gap-2 border-b border-black p-2">
            <Kbd>/</Kbd>
            <Input
              type="search"
              aria-label="Search items"
              placeholder="Search name or design no."
              className={cn(inputCls, "flex-1")}
            />
            <button type="button" className={btn}>
              Edit <Kbd className="hidden md:inline">Enter</Kbd>
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className={th}>Item</th>
                <th className={th}>Design</th>
                <th className={cn(th, "hidden sm:table-cell")}>HSN</th>
                <th className={cn(th, "hidden sm:table-cell")}>Unit</th>
                <th className={cn(th, "text-right")}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const low = item.stockQty <= LOW_STOCK_AT;
                return (
                  <tr key={item.id} aria-selected={i === 0} className={cn(i === 0 && selectedRow)}>
                    <td className={cn(td, "font-semibold")}>{item.description}</td>
                    <td className={cn(td, mono, "whitespace-nowrap")}>{item.designNo}</td>
                    <td className={cn(td, mono, "hidden sm:table-cell")}>{item.hsnCode}</td>
                    <td className={cn(td, "hidden sm:table-cell")}>{item.unit}</td>
                    <td className={cn(td, mono, "text-right font-semibold whitespace-nowrap")}>
                      {low && <span className="mr-2 border border-black px-1 font-sans">Low</span>}
                      {item.stockQty}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Pane>

        <Pane title="Add item" right={<Kbd>Alt+A</Kbd>}>
          <form className="grid gap-2 p-3">
            <Field label="Item name *" defaultValue="KURTA SET" />
            <Field
              label="Design no. *"
              defaultValue="BC-101"
              className={mono}
              focused
              error="BC-101 is already used by KURTA PAJAMA."
            />
            <Field label="HSN code *" inputMode="numeric" defaultValue="62114290" className={mono} />
            <Row label="Unit *" htmlFor="b-unit">
              <select id="b-unit" defaultValue="PCS" className={selectCls}>
                <option>PCS</option>
                <option>SET</option>
                <option>MTR</option>
                <option>DOZ</option>
              </select>
            </Row>
            <Field
              label="Opening stock"
              inputMode="numeric"
              defaultValue="50"
              className={cn(mono, "text-right")}
              hint="Only when adding. Later it changes through bills."
            />
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

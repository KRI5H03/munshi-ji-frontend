import {
  CShell,
  Field,
  FieldShell,
  Sheet,
  btnPlain,
  btnPrimary,
  inputCls,
  mono,
  selectCls,
} from "@/components/design/c/ui";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LOW_STOCK_AT, items } from "@/lib/mock";

export default function ItemsC() {
  return (
    <CShell active="items">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">Items</h1>
        <button type="button" className={btnPlain}>
          Add item
        </button>
      </div>
      <p className="mt-3 text-xl">Stock goes down by itself each time you save a bill.</p>

      <Sheet className="mt-6 border-2 border-foreground">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
          <h2 className="text-2xl font-bold">New item</h2>
          <button type="button" className="h-11 underline underline-offset-4">
            Close
          </button>
        </div>
        <form className="grid gap-6 p-5">
          <Field label="Item name" defaultValue="KURTA SET" />
          <Field
            label="Design number"
            defaultValue="BC-101"
            inputClassName={mono}
            error="BC-101 is already used by KURTA PAJAMA. Give this item a different number."
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              label="HSN code"
              inputMode="numeric"
              defaultValue="62114290"
              inputClassName={mono}
              hint="4 to 8 digits, from your purchase bill."
            />
            <FieldShell label="Sold by" htmlFor="c-unit">
              <select id="c-unit" defaultValue="PCS" className={selectCls}>
                <option value="PCS">Piece (PCS)</option>
                <option value="SET">Set (SET)</option>
                <option value="MTR">Metre (MTR)</option>
                <option value="DOZ">Dozen (DOZ)</option>
              </select>
            </FieldShell>
          </div>
          <Field
            label="Pieces in the shop now"
            inputMode="numeric"
            defaultValue="50"
            inputClassName={cn(mono, "w-40")}
            hint="Set this once. After that, stock changes only through bills."
          />
          <button type="button" className={cn(btnPrimary, "h-16 text-xl")}>
            Save item
          </button>
        </form>
      </Sheet>

      <Input
        type="search"
        aria-label="Find an item"
        placeholder="Find an item by name or design number"
        className={cn(inputCls, "mt-8")}
      />

      <Sheet className="mt-4">
        <ul className="divide-y divide-border">
          {items.map((item) => {
            const low = item.stockQty <= LOW_STOCK_AT;
            return (
              <li
                key={item.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
              >
                <div className="min-w-0">
                  <p className="text-xl font-bold">{item.description}</p>
                  <p className={cn(mono, "text-base text-muted-foreground")}>
                    Design {item.designNo}, HSN {item.hsnCode}
                  </p>
                </div>
                <p className="text-right leading-tight">
                  <span className={cn(mono, "block text-xl font-bold")}>
                    {item.stockQty} {item.unit}
                  </span>
                  <span className={cn("block text-base", low ? "font-bold underline underline-offset-4" : "text-muted-foreground")}>
                    {low ? "Running low" : "in stock"}
                  </span>
                </p>
                <button type="button" className={cn(btnPlain, "col-span-2 h-12 border px-5 sm:col-span-1")}>
                  Edit
                </button>
              </li>
            );
          })}
        </ul>
      </Sheet>
    </CShell>
  );
}

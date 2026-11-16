import { Search } from "lucide-react";
import {
  AShell,
  Card,
  Field,
  FieldShell,
  PageHeader,
  btnOutline,
  btnPrimary,
  inputCls,
  selectCls,
} from "@/components/design/a/ui";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LOW_STOCK_AT, items } from "@/lib/mock";

export default function ItemsA() {
  return (
    <AShell active="items">
      <PageHeader title="Items" sub="Stock goes down by itself when you save a bill" />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              aria-label="Search items"
              placeholder="Search name or design no."
              className={cn(inputCls, "pl-12")}
            />
          </div>

          <ul className="mt-6 grid gap-3">
            {items.map((item) => {
              const low = item.stockQty <= LOW_STOCK_AT;
              return (
                <li key={item.id}>
                  <Card className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                    <div className="min-w-0">
                      <p className="text-lg font-bold">{item.description}</p>
                      <p className="num text-muted-foreground">
                        Design {item.designNo}, HSN {item.hsnCode}
                      </p>
                    </div>
                    <p className="text-right">
                      <span className="num block text-lg font-bold">
                        {item.stockQty} {item.unit}
                      </span>
                      <span className={cn("block", low ? "font-semibold text-amber-800" : "text-muted-foreground")}>
                        {low ? "Low stock" : "In stock"}
                      </span>
                    </p>
                    <button type="button" className={cn(btnOutline, "col-span-2 sm:col-span-1")}>
                      Edit
                    </button>
                  </Card>
                </li>
              );
            })}
          </ul>
        </div>

        <Card>
          <h2 className="text-xl font-bold">Add item</h2>
          <form className="mt-5 grid gap-5">
            <Field label="Item name *" defaultValue="KURTA SET" />
            <Field
              label="Design no. *"
              defaultValue="BC-101"
              inputClassName="num"
              error="BC-101 is already used by KURTA PAJAMA"
            />
            <div className="grid grid-cols-2 gap-4">
              <Field label="HSN code *" inputMode="numeric" defaultValue="62114290" inputClassName="num" />
              <FieldShell label="Unit *" htmlFor="a-unit">
                <select id="a-unit" defaultValue="PCS" className={selectCls}>
                  <option>PCS</option>
                  <option>SET</option>
                  <option>MTR</option>
                  <option>DOZ</option>
                </select>
              </FieldShell>
            </div>
            <Field
              label="Opening stock"
              inputMode="numeric"
              defaultValue="50"
              inputClassName="num"
              hint="Only when adding. Later, stock changes through bills."
            />
            <button type="button" className={cn(btnPrimary, "h-14 text-lg")}>
              Save item
            </button>
          </form>
        </Card>
      </div>
    </AShell>
  );
}

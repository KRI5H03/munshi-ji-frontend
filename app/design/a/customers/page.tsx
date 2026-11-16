import { Search } from "lucide-react";
import {
  AShell,
  Card,
  Field,
  FieldShell,
  PageHeader,
  btnDanger,
  btnOutline,
  btnPrimary,
  inputCls,
  selectCls,
} from "@/components/design/a/ui";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatPhone } from "@/lib/money";
import { contacts } from "@/lib/mock";
import { STATES, stateName } from "@/lib/states";

const TYPES = ["Customer", "Supplier", "Both"] as const;

export default function CustomersA() {
  return (
    <AShell active="customers">
      <PageHeader title="Customers" sub={`${contacts.length} parties, A to Z`} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              aria-label="Search customers"
              placeholder="Search name or city"
              className={cn(inputCls, "pl-12")}
            />
          </div>

          <ul className="mt-6 grid gap-3">
            {contacts.map((c) => (
              <li key={c.id}>
                <Card className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-lg font-bold">{c.name}</p>
                    <p className="text-muted-foreground">
                      {c.city}, {stateName(c.stateCode)}
                    </p>
                    <p className="num text-muted-foreground">
                      {c.gstin ? `GSTIN ${c.gstin}` : "No GSTIN"}
                      {c.phone && `, phone ${formatPhone(c.phone)}`}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" className={btnOutline}>
                      Edit
                    </button>
                    <button type="button" className={btnDanger}>
                      Delete
                    </button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </div>

        <Card>
          <h2 className="text-xl font-bold">Add customer</h2>
          <form className="mt-5 grid gap-5">
            <Field label="Name *" defaultValue="SHREE RAM TEXTILES" />

            <fieldset>
              <legend className="mb-2 font-medium">Type *</legend>
              <div className="grid grid-cols-3 gap-2">
                {TYPES.map((t, i) => (
                  <label
                    key={t}
                    className={cn(
                      "flex h-12 cursor-pointer items-center justify-center rounded-lg border border-input bg-card font-medium has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                      "has-checked:border-2 has-checked:border-primary has-checked:bg-accent has-checked:font-semibold has-checked:text-accent-foreground",
                    )}
                  >
                    <input type="radio" name="contactType" className="sr-only" defaultChecked={i === 0} />
                    {t}
                  </label>
                ))}
              </div>
            </fieldset>

            <Field label="City *" defaultValue="Kanpur" />
            <Field
              label="GSTIN"
              defaultValue="09ABCDE1234F1Z"
              inputClassName="num uppercase"
              error="GSTIN should be 15 characters. This one has 14."
            />
            <FieldShell label="State (if no GSTIN)" htmlFor="a-state">
              <select id="a-state" defaultValue="09" className={selectCls}>
                {Object.entries(STATES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {code} {name}
                  </option>
                ))}
              </select>
            </FieldShell>
            <Field label="Phone" inputMode="numeric" placeholder="10 digits" inputClassName="num" />
            <button type="button" className={cn(btnPrimary, "h-14 text-lg")}>
              Save customer
            </button>
          </form>
        </Card>
      </div>
    </AShell>
  );
}

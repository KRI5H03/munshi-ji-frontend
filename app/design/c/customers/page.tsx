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
import { formatPhone } from "@/lib/money";
import { contacts } from "@/lib/mock";
import { STATES, stateName } from "@/lib/states";

const TYPES = [
  ["Customer", "buys from you"],
  ["Supplier", "sells to you"],
  ["Both", "buys and sells"],
] as const;

export default function CustomersC() {
  return (
    <CShell active="customers">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">Customers</h1>
        <button type="button" className={btnPlain}>
          Add customer
        </button>
      </div>

      {/* The add form opens here, above the list, when Add customer is pressed. */}
      <Sheet className="mt-6 border-2 border-foreground">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
          <h2 className="text-2xl font-bold">New customer</h2>
          <button type="button" className="h-11 underline underline-offset-4">
            Close
          </button>
        </div>
        <form className="grid gap-6 p-5">
          <Field label="Name" defaultValue="SHREE RAM TEXTILES" />

          <fieldset>
            <legend className="mb-2 font-bold">This party is a</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {TYPES.map(([t, what], i) => (
                <label
                  key={t}
                  className="flex min-h-16 cursor-pointer flex-col justify-center rounded-md border border-input bg-card px-4 py-2 has-checked:border-2 has-checked:border-foreground has-checked:bg-muted has-focus-visible:ring-2 has-focus-visible:ring-foreground"
                >
                  <input type="radio" name="contactType" className="sr-only" defaultChecked={i === 0} />
                  <span className="font-bold">{t}</span>
                  <span className="text-base text-muted-foreground">{what}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field label="City" defaultValue="Kanpur" />
          <Field
            label="GSTIN"
            defaultValue="09ABCDE1234F1Z"
            inputClassName={cn(mono, "uppercase")}
            error="A GSTIN has 15 characters. This one has 14. Check it against their bill."
          />
          <FieldShell label="State" htmlFor="c-state" hint="Needed only when the party has no GSTIN.">
            <select id="c-state" defaultValue="09" className={selectCls}>
              {Object.entries(STATES).map(([code, name]) => (
                <option key={code} value={code}>
                  {name} ({code})
                </option>
              ))}
            </select>
          </FieldShell>
          <Field label="Phone" inputMode="numeric" hint="10 digits. You can leave this empty." inputClassName={mono} />
          <button type="button" className={cn(btnPrimary, "h-16 text-xl")}>
            Save customer
          </button>
        </form>
      </Sheet>

      <Input
        type="search"
        aria-label="Find a customer"
        placeholder="Find a customer by name or city"
        className={cn(inputCls, "mt-8")}
      />

      <Sheet className="mt-4">
        <ul className="divide-y divide-border">
          {contacts.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xl font-bold">{c.name}</p>
                <p className="text-base text-muted-foreground">
                  {c.city}, {stateName(c.stateCode)}
                  {c.phone && `. Phone ${formatPhone(c.phone)}`}
                </p>
                <p className={cn(mono, "text-base text-muted-foreground")}>
                  {c.gstin ? `GSTIN ${c.gstin}` : "No GSTIN"}
                </p>
              </div>
              <button type="button" className={cn(btnPlain, "h-12 border px-5")}>
                Edit
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
      <p className="mt-4 text-base text-muted-foreground">
        {contacts.length} parties, A to Z. To remove one, open Edit. Old bills keep their details.
      </p>
    </CShell>
  );
}

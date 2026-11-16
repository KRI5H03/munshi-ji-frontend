import { BShell, Field, Kbd, Pane, btnPrimary, mono } from "@/components/design/b/ui";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { business } from "@/lib/mock";

export default function SettingsB() {
  return (
    <BShell
      active="settings"
      keys={[
        ["Enter", "Next field"],
        ["Ctrl+S", "Save"],
        ["Esc", "Undo changes"],
      ]}
    >
      <form className="grid items-start gap-4 xl:grid-cols-2">
        <Pane title="Firm" right={<span>Prints on every bill. Owner only.</span>}>
          <div className="grid gap-2 p-3">
            <Field label="Firm name" defaultValue={business.name} />
            <Field
              label="GSTIN"
              defaultValue={business.gstin}
              readOnly
              className={cn(mono, "bg-muted text-muted-foreground")}
              hint="Cannot be changed."
            />
            <Field label="Address" defaultValue={business.address} />
            <Field label="Branch address" defaultValue={business.branchAddress ?? ""} />
            <Field label="Phone" inputMode="numeric" defaultValue={business.phone ?? ""} className={mono} />
            <Field label="PAN" defaultValue={business.pan ?? ""} className={cn(mono, "uppercase")} />
            <Field label="MSME Udyam no." defaultValue={business.msmeUdhyamNo ?? ""} className={mono} />
            <Field label="Jurisdiction" defaultValue={business.jurisdiction ?? ""} />
          </div>
        </Pane>

        <div className="grid gap-4">
          <Pane title="Bank">
            <div className="grid gap-2 p-3">
              <Field label="Bank name" defaultValue={business.bankName ?? ""} />
              <Field label="Branch" defaultValue={business.bankBranch ?? ""} />
              <Field label="Account no." inputMode="numeric" defaultValue={business.bankAccountNo ?? ""} className={mono} />
              <Field label="IFSC" defaultValue={business.ifsc ?? ""} className={cn(mono, "uppercase")} />
            </div>
          </Pane>

          <Pane title="Terms printed on the bill">
            <Textarea
              aria-label="Terms printed on the bill"
              rows={4}
              defaultValue={business.termsText ?? ""}
              className="min-h-28 rounded-none border-0 bg-white px-3 py-2 text-base transition-none focus-visible:bg-accent focus-visible:ring-0 md:text-base"
            />
          </Pane>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={cn(btnPrimary, "h-12")}>
              Save changes <Kbd>Ctrl+S</Kbd>
            </button>
            <p role="status" className="border border-black px-3 py-2 font-semibold">
              Saved
            </p>
          </div>
        </div>
      </form>
    </BShell>
  );
}

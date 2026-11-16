import { CShell, Field, FieldShell, Sheet, btnPrimary, mono } from "@/components/design/c/ui";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { business } from "@/lib/mock";

export default function SettingsC() {
  return (
    <CShell active="settings">
      <h1 className="text-4xl font-bold">Your firm</h1>
      <p className="mt-3 text-xl">These details print on every bill. Only the owner can change them.</p>

      <form className="mt-8 grid gap-8">
        <section>
          <h2 className="mb-3 text-2xl font-bold">Name and address</h2>
          <Sheet className="grid gap-6 p-5 sm:grid-cols-2">
            <Field label="Firm name" defaultValue={business.name} className="sm:col-span-2" />
            <div className="sm:col-span-2">
              <p className="mb-2 font-bold">GSTIN</p>
              <p className={cn(mono, "text-xl")}>{business.gstin}</p>
              <p className="mt-1 text-base text-muted-foreground">The GSTIN cannot be changed.</p>
            </div>
            <Field label="Address" defaultValue={business.address} className="sm:col-span-2" />
            <Field label="Phone" inputMode="numeric" defaultValue={business.phone ?? ""} inputClassName={mono} />
            <Field label="PAN" defaultValue={business.pan ?? ""} inputClassName={cn(mono, "uppercase")} />
            <Field
              label="MSME Udyam number"
              defaultValue={business.msmeUdhyamNo ?? ""}
              hint="Leave empty if you do not have one."
              inputClassName={mono}
            />
            <Field label="Jurisdiction" defaultValue={business.jurisdiction ?? ""} />
            <Field
              label="Branch address"
              defaultValue={business.branchAddress ?? ""}
              hint="Leave empty if you have only one shop."
              className="sm:col-span-2"
            />
          </Sheet>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold">Bank</h2>
          <Sheet className="grid gap-6 p-5 sm:grid-cols-2">
            <Field label="Bank name" defaultValue={business.bankName ?? ""} />
            <Field label="Branch" defaultValue={business.bankBranch ?? ""} />
            <Field
              label="Account number"
              inputMode="numeric"
              defaultValue={business.bankAccountNo ?? ""}
              inputClassName={mono}
            />
            <Field label="IFSC" defaultValue={business.ifsc ?? ""} inputClassName={cn(mono, "uppercase")} />
          </Sheet>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold">Terms</h2>
          <Sheet className="p-5">
            <FieldShell label="Printed at the bottom of every bill" htmlFor="c-terms">
              <Textarea
                id="c-terms"
                rows={4}
                defaultValue={business.termsText ?? ""}
                className="min-h-36 rounded-md border-input bg-card px-4 py-3 text-lg focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground md:text-lg"
              />
            </FieldShell>
          </Sheet>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className={cn(btnPrimary, "h-16 px-8 text-xl")}>
            Save changes
          </button>
          <p role="status" className="font-bold">
            Saved. New bills will print these details.
          </p>
        </div>
      </form>
    </CShell>
  );
}

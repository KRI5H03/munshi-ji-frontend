import { Check } from "lucide-react";
import { AShell, Card, Field, FieldShell, PageHeader, btnPrimary } from "@/components/design/a/ui";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { business } from "@/lib/mock";

export default function SettingsA() {
  return (
    <AShell active="settings">
      <PageHeader title="Firm settings" sub="Everything here prints on every bill. Only the owner can change it." />

      <form className="grid max-w-4xl gap-6">
        <Card>
          <h2 className="text-xl font-bold">Firm</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Firm name" defaultValue={business.name} />
            <Field
              label="GSTIN"
              defaultValue={business.gstin}
              readOnly
              inputClassName="num bg-muted text-muted-foreground"
              hint="Cannot be changed"
            />
            <Field label="Address" defaultValue={business.address} className="sm:col-span-2" />
            <Field label="Phone" inputMode="numeric" defaultValue={business.phone ?? ""} placeholder="10 digits" inputClassName="num" />
            <Field label="PAN" defaultValue={business.pan ?? ""} inputClassName="num uppercase" />
            <Field label="MSME Udyam no." defaultValue={business.msmeUdhyamNo ?? ""} placeholder="UDYAM-UP-..." />
            <Field label="Jurisdiction" defaultValue={business.jurisdiction ?? ""} />
            <Field label="Branch address" defaultValue={business.branchAddress ?? ""} className="sm:col-span-2" />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Bank details</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Bank name" defaultValue={business.bankName ?? ""} />
            <Field label="Branch" defaultValue={business.bankBranch ?? ""} />
            <Field label="Account no." inputMode="numeric" defaultValue={business.bankAccountNo ?? ""} inputClassName="num" />
            <Field label="IFSC" defaultValue={business.ifsc ?? ""} inputClassName="num uppercase" />
          </div>
        </Card>

        <Card>
          <FieldShell label="Terms printed on the bill" htmlFor="a-terms">
            <Textarea
              id="a-terms"
              rows={4}
              defaultValue={business.termsText ?? ""}
              className="min-h-32 rounded-lg border-input bg-card px-4 py-3 text-base md:text-base"
            />
          </FieldShell>
        </Card>

        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className={cn(btnPrimary, "h-14 px-8 text-lg")}>
            Save changes
          </button>
          <p role="status" className="flex items-center gap-2 font-semibold text-green-800">
            <Check className="size-5" aria-hidden />
            Saved
          </p>
        </div>
      </form>
    </AShell>
  );
}

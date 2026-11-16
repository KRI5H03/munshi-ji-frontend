import { Suspense } from "react";
import { BillView, BillViewPlaceholder } from "@/components/bills/print/bill-view";
import { BackLink } from "@/components/shell/back-link";

export const metadata = { title: "Bill — Munshi Ji" };

// "Open / Print" on the bills list, and where a new bill lands after saving.
export default function BillPage() {
  return (
    <>
      <div className="no-print mb-3">
        <BackLink href="/bills" to="bills" />
      </div>
      <Suspense fallback={<BillViewPlaceholder />}>
        <BillView />
      </Suspense>
    </>
  );
}

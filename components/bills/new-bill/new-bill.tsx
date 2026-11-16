"use client";

import { NewBillForm } from "@/components/bills/new-bill/new-bill-form";
import { Card } from "@/components/ui/kit";
import { useFirmId } from "@/hooks/use-firm-id";
import { useFreshForm } from "@/hooks/use-fresh-form";

/** The form needs the open firm (and today's date), so it renders only in the browser once the firm is known. */
export function NewBill() {
  const firmId = useFirmId();
  const { formKey, markFinished } = useFreshForm();

  if (!firmId) {
    return (
      <div role="status" aria-label="Loading" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-6">
          <Card className="h-32 animate-pulse" />
          <Card className="h-40 animate-pulse" />
        </div>
        <Card className="h-72 animate-pulse" />
      </div>
    );
  }
  // A new firm, or a finished bill, means a fresh form.
  return <NewBillForm key={`${firmId}:${formKey}`} firmId={firmId} onFinished={markFinished} />;
}

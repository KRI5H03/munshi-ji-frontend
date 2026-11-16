"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { NewBillForm } from "@/components/bills/new-bill/new-bill-form";
import { Card } from "@/components/ui/kit";
import { useFirmId } from "@/hooks/use-firm-id";

/**
 * The form needs the open firm (and today's date), so it renders only in the browser once the firm is known.
 *
 * Next.js keeps a page you leave mounted but hidden, with what was typed. A draft you walk away
 * from is kept that way. A bill that was saved, or whose changes were discarded, must not come
 * back: the form is marked, and replaced by a fresh one the moment the page is hidden.
 */
export function NewBill() {
  const firmId = useFirmId();
  const [formKey, setFormKey] = useState(0);
  const resetWhenHidden = useRef(false);

  useLayoutEffect(
    () => () => {
      // Runs when the page is hidden (and on unmount).
      if (resetWhenHidden.current) {
        resetWhenHidden.current = false;
        setFormKey((key) => key + 1);
      }
    },
    [],
  );

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
  return (
    <NewBillForm
      key={`${firmId}:${formKey}`}
      firmId={firmId}
      onFinished={() => {
        resetWhenHidden.current = true;
      }}
    />
  );
}

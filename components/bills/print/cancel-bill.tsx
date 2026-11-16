"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormDialog } from "@/components/ui/form-dialog";
import { TextareaField, btn, btnDanger, btnOutline } from "@/components/ui/kit";
import { errorMessage, isApiError } from "@/lib/api/client";
import { applyFieldErrors } from "@/lib/api/form-errors";
import { cancelSale } from "@/lib/api/sales";
import { formatRupees } from "@/lib/money";
import { keys } from "@/lib/query";
import type { Invoice, SaleDetail } from "@/lib/types";
import { cn } from "@/lib/utils";

const QUICK_REASONS = ["Wrong party", "Wrong rate or quantity", "Goods returned", "Made twice by mistake"];

const reasonSchema = z.object({
  reason: z.string().trim().min(1, "Give a reason, like “Wrong party”").max(200, "At most 200 characters"),
});

function CancelForm({ firmId, invoice, onDone }: { firmId: string; invoice: Invoice; onDone: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<{ reason: string }>({ resolver: zodResolver(reasonSchema), defaultValues: { reason: "" } });
  const { register, setValue, setError, formState } = form;

  const cancel = useMutation({
    mutationFn: (reason: string) => cancelSale(invoice.id, reason),
    onSuccess: (cancelled) => {
      // Show the cancelled bill at once, then refresh: the lists and today's totals change,
      // and every item on the bill got its stock back.
      queryClient.setQueryData<SaleDetail>(keys.sale(firmId, cancelled.id), (old) =>
        old ? { ...old, invoice: cancelled } : old,
      );
      void queryClient.invalidateQueries({ queryKey: keys.sales(firmId) });
      void queryClient.invalidateQueries({ queryKey: keys.items(firmId) });
      toast.success(`Bill ${cancelled.invoiceNo} cancelled. Its stock is back.`);
      onDone();
    },
    onError: (error) => {
      if (applyFieldErrors(error, setError, ["reason"])) return;
      if (isApiError(error) && error.code === "ALREADY_CANCELLED") {
        void queryClient.invalidateQueries({ queryKey: keys.sale(firmId, invoice.id) });
        void queryClient.invalidateQueries({ queryKey: keys.sales(firmId) });
        toast.error(error.message);
        onDone();
        return;
      }
      toast.error(errorMessage(error));
    },
  });

  return (
    <form noValidate onSubmit={form.handleSubmit((v) => cancel.mutate(v.reason.trim()))} className="grid gap-5">
      <div>
        <TextareaField
          label="Reason"
          rows={2}
          data-autofocus
          maxLength={200}
          error={formState.errors.reason?.message}
          {...register("reason")}
        />
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Quick reasons">
          {QUICK_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setValue("reason", r, { shouldValidate: formState.isSubmitted, shouldDirty: true })}
              className="h-10 rounded-full border border-input bg-card px-4 font-medium hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" disabled={cancel.isPending} onClick={onDone} className={btnOutline}>
          Keep bill
        </button>
        <button
          type="submit"
          disabled={cancel.isPending}
          className={cn(btn, "bg-destructive text-white hover:bg-destructive/90")}
        >
          {cancel.isPending ? "Cancelling" : "Cancel bill"}
        </button>
      </div>
    </form>
  );
}

/** "Cancel bill" with a dialog asking for the reason. Only offered to the firm's owner. */
export function CancelBillButton({ firmId, invoice }: { firmId: string; invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnDanger}>
        Cancel bill
      </button>
      <FormDialog
        open={open}
        title={`Cancel bill ${invoice.invoiceNo}?`}
        description={
          <>
            {invoice.billedToName}, <span className="num">{formatRupees(invoice.grandTotal)}</span>. The bill keeps
            its number and stays in the list marked cancelled. Its stock goes back, and the customer’s account gets a
            matching credit. This cannot be undone.
          </>
        }
        onClose={() => setOpen(false)}
      >
        <CancelForm firmId={firmId} invoice={invoice} onDone={() => setOpen(false)} />
      </FormDialog>
    </>
  );
}

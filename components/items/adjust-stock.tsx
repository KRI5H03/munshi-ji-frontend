"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormDialog } from "@/components/ui/form-dialog";
import { Field, btnOutline, btnPrimary } from "@/components/ui/kit";
import { errorMessage, isApiError } from "@/lib/api/client";
import { applyFieldErrors } from "@/lib/api/form-errors";
import { adjustStock } from "@/lib/api/items";
import { keys } from "@/lib/query";
import type { Item } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_CHANGE = 1_000_000;

type AdjustValues = { direction: "add" | "remove"; qty: string; note: string };

function adjustSchema(stock: number) {
  return z
    .object({
      direction: z.enum(["add", "remove"]),
      qty: z
        .string()
        .trim()
        .regex(/^\d{1,7}$/, "Whole pieces, like 50")
        .refine((v) => Number(v) >= 1, "At least 1 piece")
        .refine((v) => Number(v) <= MAX_CHANGE, "At most 10,00,000 at a time"),
      note: z.string().trim().min(1, "Say why, like “New stock from Surat”").max(200, "At most 200 characters"),
    })
    .superRefine((v, ctx) => {
      if (v.direction === "remove" && /^\d+$/.test(v.qty.trim()) && Number(v.qty) > stock) {
        ctx.addIssue({ code: "custom", path: ["qty"], message: `Only ${stock} in stock, so at most ${stock} can be removed` });
      }
    });
}

function AdjustStockForm({ firmId, item, onDone }: { firmId: string; item: Item; onDone: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<AdjustValues>({
    resolver: zodResolver(adjustSchema(item.stockQty)),
    defaultValues: { direction: "add", qty: "", note: "" },
  });
  const { register, control, setError, formState } = form;
  const { errors } = formState;
  const direction = useWatch({ control, name: "direction" });
  const qtyText = useWatch({ control, name: "qty" });
  const qty = /^\d{1,7}$/.test(qtyText.trim()) ? Number(qtyText.trim()) : null;
  const after = qty === null ? null : direction === "add" ? item.stockQty + qty : item.stockQty - qty;
  const unit = item.unit.toLowerCase();

  const save = useMutation({
    mutationFn: (v: AdjustValues) =>
      adjustStock(item.id, { change: (v.direction === "add" ? 1 : -1) * Number(v.qty.trim()), note: v.note.trim() }),
    onSuccess: (updated) => {
      queryClient.setQueryData(keys.item(firmId, updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: keys.itemLists(firmId) });
      toast.success(`${updated.description} (${updated.designNo}): stock is now ${updated.stockQty} ${unit}`);
      onDone();
    },
    onError: (error) => {
      const fieldFor = (f: string) => (f === "change" ? "qty" : f === "note" ? "note" : undefined);
      if (applyFieldErrors(error, setError, fieldFor)) return;
      if (isApiError(error) && error.code === "INSUFFICIENT_STOCK") {
        // Someone sold or removed stock since the list was loaded.
        void queryClient.invalidateQueries({ queryKey: keys.items(firmId) });
        setError("qty", { message: error.message }, { shouldFocus: true });
        return;
      }
      toast.error(errorMessage(error));
    },
  });

  return (
    <form noValidate onSubmit={form.handleSubmit((v) => save.mutate(v))} className="grid gap-5">
      <fieldset>
        <legend className="mb-2 font-medium">Stock</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "add", label: "Add", icon: ArrowUp },
              { value: "remove", label: "Remove", icon: ArrowDown },
            ] as const
          ).map(({ value, label, icon: Icon }) => (
            <label
              key={value}
              className={cn(
                "flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-input bg-card font-medium has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                "has-checked:border-primary has-checked:bg-accent has-checked:font-semibold has-checked:text-accent-foreground has-checked:outline has-checked:outline-primary",
              )}
            >
              <input type="radio" value={value} className="sr-only" {...register("direction")} />
              <Icon className="size-5" aria-hidden />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label={direction === "add" ? `Pieces to add (${unit})` : `Pieces to remove (${unit})`}
        inputMode="numeric"
        autoComplete="off"
        data-autofocus
        inputClassName="num text-lg"
        error={errors.qty?.message}
        {...register("qty")}
      />

      <Field
        label="Note"
        autoComplete="off"
        placeholder={direction === "add" ? "e.g. New stock from Surat" : "e.g. Damaged pieces"}
        hint="Saved with the change, so you know later why stock moved."
        error={errors.note?.message}
        {...register("note")}
      />

      <p className="num rounded-lg bg-muted px-4 py-3 text-lg" aria-live="polite">
        Stock now <b>{item.stockQty}</b>
        {after !== null && after >= 0 && (
          <>
            , after saving <b>{after}</b> {unit}
          </>
        )}
        {(after === null || after < 0) && ` ${unit}`}
      </p>

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" disabled={save.isPending} onClick={onDone} className={btnOutline}>
          Close
        </button>
        <button type="submit" disabled={save.isPending} className={btnPrimary}>
          {save.isPending ? "Saving" : "Save stock"}
        </button>
      </div>
    </form>
  );
}

/** "Adjust stock" button with its dialog: add or remove pieces by hand, with a note. */
export function AdjustStockButton({ firmId, item, className }: { firmId: string; item: Item; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Adjust stock of ${item.description}, ${item.designNo}`}
        className={cn(btnOutline, className)}
      >
        Adjust stock
      </button>
      <FormDialog
        open={open}
        title="Adjust stock"
        description={
          <>
            {item.description}, <span className="num">{item.designNo}</span>
          </>
        }
        onClose={() => setOpen(false)}
      >
        <AdjustStockForm firmId={firmId} item={item} onDone={() => setOpen(false)} />
      </FormDialog>
    </>
  );
}

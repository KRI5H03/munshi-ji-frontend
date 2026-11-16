"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AdjustStockButton } from "@/components/items/adjust-stock";
import { StockText } from "@/components/items/stock-badge";
import { useUnsavedChanges } from "@/components/shell/navigation-guard";
import { Card, Field, btnPrimary } from "@/components/ui/kit";
import { errorMessage, isApiError } from "@/lib/api/client";
import { applyFieldErrors } from "@/lib/api/form-errors";
import { createItem, updateItem } from "@/lib/api/items";
import { keys } from "@/lib/query";
import {
  ITEM_FIELDS,
  UNIT_SUGGESTIONS,
  changedItemFields,
  itemDefaults,
  itemSchema,
  openingStock,
  toItemBody,
  type ItemFormValues,
} from "@/lib/schemas/item";
import type { Item } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Add item (no `saved`) or edit one. Opening stock is asked only when adding;
 * after that stock moves only through bills. After saving: back to the list with a "Saved" toast.
 */
export function ItemForm({
  firmId,
  saved,
  onFinished,
  footer,
}: {
  firmId: string;
  saved?: Item;
  onFinished: () => void;
  footer?: React.ReactNode;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const form = useForm<ItemFormValues>({ resolver: zodResolver(itemSchema), defaultValues: itemDefaults(saved) });
  const { register, setError, formState } = form;
  const { errors, isDirty } = formState;
  useUnsavedChanges(isDirty && !done, onFinished);

  const save = useMutation({
    mutationFn: (values: ItemFormValues) => {
      const body = toItemBody(values);
      if (!saved) return createItem({ ...body, openingStock: openingStock(values) });
      const changes = changedItemFields(body, saved);
      return Object.keys(changes).length ? updateItem(saved.id, changes) : Promise.resolve(saved);
    },
    onSuccess: (item) => {
      setDone(true);
      onFinished();
      void queryClient.invalidateQueries({ queryKey: keys.itemLists(firmId) });
      queryClient.setQueryData(keys.item(firmId, item.id), item);
      toast.success("Saved");
      router.push("/items");
    },
    onError: (error, values) => {
      if (applyFieldErrors(error, setError, ITEM_FIELDS)) return;
      if (isApiError(error) && error.code === "ALREADY_EXISTS") {
        setError(
          "designNo",
          { message: `Design no. ${values.designNo.trim()} is already used by another item` },
          { shouldFocus: true },
        );
        return;
      }
      const message =
        isApiError(error) && error.code === "VALIDATION_FAILED"
          ? "Some details are not right. Check the fields marked in red."
          : errorMessage(error);
      setServerError(message);
      toast.error(message);
    },
  });

  const busy = save.isPending || done;

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(
        (values) => {
          setServerError(null);
          save.mutate(values);
        },
        () => setServerError(null),
      )}
      className="grid max-w-3xl gap-6"
    >
      <Card className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Item name"
          autoComplete="off"
          autoFocus={!saved}
          placeholder="e.g. KURTA PAJAMA"
          className="sm:col-span-2"
          hint="Printed on the bill as the description of goods."
          error={errors.description?.message}
          {...register("description")}
        />
        <Field
          label="Design no."
          autoComplete="off"
          spellCheck={false}
          placeholder="e.g. BC-101"
          inputClassName="num"
          hint="Each item needs its own design no."
          error={errors.designNo?.message}
          {...register("designNo")}
        />
        <Field
          label="HSN code"
          inputMode="numeric"
          autoComplete="off"
          placeholder="e.g. 62114290"
          inputClassName="num"
          error={errors.hsnCode?.message}
          {...register("hsnCode")}
        />
        <Field
          label="Unit"
          autoComplete="off"
          autoCapitalize="characters"
          list="unit-suggestions"
          maxLength={10}
          inputClassName="uppercase"
          error={errors.unit?.message}
          {...register("unit")}
        />
        <datalist id="unit-suggestions">
          {UNIT_SUGGESTIONS.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>

        {saved ? (
          <div>
            <p className="mb-2 font-medium">In stock</p>
            <div className="flex min-h-12 flex-wrap items-center gap-4 text-lg">
              <StockText qty={saved.stockQty} unit={saved.unit} />
              <AdjustStockButton firmId={firmId} item={saved} className="h-11" />
            </div>
            <p className="mt-2 text-muted-foreground">Bills move stock by themselves. Adjust it here for new goods or damage.</p>
          </div>
        ) : (
          <Field
            label="Opening stock (optional)"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            inputClassName="num"
            hint="Pieces you have now. After this, bills move the stock."
            error={errors.openingStock?.message}
            {...register("openingStock")}
          />
        )}
      </Card>

      {serverError && (
        <p
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 font-medium text-destructive"
        >
          <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          {serverError}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="submit" disabled={busy} className={cn(btnPrimary, "h-14 px-8 text-lg")}>
          {busy ? "Saving" : saved ? "Save changes" : "Save item"}
        </button>
        {footer}
      </div>
    </form>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, Trash2 } from "lucide-react";
import { useFieldArray, useForm, useWatch, type Path } from "react-hook-form";
import { toast } from "sonner";
import { TotalsPanel } from "@/components/bills/new-bill/totals-panel";
import { useUnsavedChanges } from "@/components/shell/navigation-guard";
import { Card, Field, btnOutline } from "@/components/ui/kit";
import { SearchSelect } from "@/components/ui/search-select";
import { getProfile } from "@/lib/api/business";
import { errorMessage, isApiError } from "@/lib/api/client";
import { canBeBilled, listContacts } from "@/lib/api/contacts";
import { applyFieldErrors } from "@/lib/api/form-errors";
import { listItems } from "@/lib/api/items";
import { createSale } from "@/lib/api/sales";
import { previewBill, type PreviewLine } from "@/lib/bill/calc";
import { parsePercent, parseQty, parseRupees } from "@/lib/bill/parse";
import { formatBp, formatPaise, formatRupees, todayIso } from "@/lib/money";
import { keys } from "@/lib/query";
import {
  MAX_LINES,
  billFieldFor,
  billSchema,
  discountProblem,
  qtyProblem,
  rateProblem,
  stockProblems,
  toCreateSaleBody,
  type BillFormValues,
} from "@/lib/schemas/sale";
import { stateName } from "@/lib/states";
import { stockLevel } from "@/lib/stock";
import type { Business, Contact, Item } from "@/lib/types";
import { cn } from "@/lib/utils";

const ADD_ITEM_ID = "add-item-search";
const LINE_COLS = "@2xl:grid-cols-[1.5rem_minmax(0,1fr)_6.5rem_8rem_8rem_3rem]";

function ContactOption({ contact }: { contact: Contact }) {
  return (
    <span className="block">
      <span className="block text-lg font-bold">{contact.name}</span>
      <span className="num block text-muted-foreground">
        {contact.city}, {contact.gstin ? `GSTIN ${contact.gstin}` : "no GSTIN"}
      </span>
    </span>
  );
}

function ItemOption({ item }: { item: Item }) {
  const level = stockLevel(item.stockQty);
  const out = level === "out";
  const low = level === "low";
  return (
    <span className="flex items-start justify-between gap-4">
      <span className="min-w-0">
        <span className="block text-lg font-bold">{item.description}</span>
        <span className="num block text-muted-foreground">
          {item.designNo}, HSN {item.hsnCode}
        </span>
      </span>
      <span
        className={cn(
          "num shrink-0 text-right whitespace-nowrap",
          out ? "font-semibold text-destructive" : low ? "font-semibold text-amber-800" : "text-muted-foreground",
        )}
      >
        {out ? "Out of stock" : `${item.stockQty} ${item.unit.toLowerCase()} in stock`}
      </span>
    </span>
  );
}

/** The chosen party, with a button to choose again. */
function ChosenParty({
  contact,
  firm,
  onChange,
  changeLabel,
  showTaxNote,
}: {
  contact: Contact;
  firm: Business | undefined;
  onChange: () => void;
  changeLabel: string;
  showTaxNote?: boolean;
}) {
  const sameState = firm ? contact.stateCode === firm.stateCode : undefined;
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
      <div className="min-w-0">
        <p className="text-lg font-bold">{contact.name}</p>
        <p className="num text-muted-foreground">
          {contact.city}, {stateName(contact.stateCode)}, {contact.gstin ? `GSTIN ${contact.gstin}` : "no GSTIN"}
        </p>
        {showTaxNote && sameState !== undefined && (
          <p className="mt-1 font-medium">
            {sameState
              ? `Same state as your firm, so CGST and SGST.`
              : `Other state (${stateName(contact.stateCode)}), so IGST.`}
          </p>
        )}
      </div>
      <button type="button" onClick={onChange} className={cn(btnOutline, "h-11")}>
        {changeLabel}
      </button>
    </div>
  );
}

function newLineKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

/** Enter moves to the next field instead of submitting, like Busy and Tally. */
function moveToNextField(event: React.KeyboardEvent<HTMLFormElement>) {
  if (event.key !== "Enter" || event.defaultPrevented || event.nativeEvent.isComposing) return;
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || ["checkbox", "radio", "submit", "button"].includes(target.type)) return;
  event.preventDefault();
  const fields = [
    ...event.currentTarget.querySelectorAll<HTMLElement>(
      "input:not([type=hidden]):not([disabled]):not([readonly]), select:not([disabled]), button[type=submit]",
    ),
  ].filter((el) => el.checkVisibility());
  fields[fields.indexOf(target) + 1]?.focus();
}

export function NewBillForm({ firmId, onFinished }: { firmId: string; onFinished: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const customerSearchRef = useRef<HTMLInputElement>(null);
  const shippingRef = useRef<HTMLDetailsElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const isMac = useMemo(() => /Mac|iPhone|iPad/.test(navigator.userAgent), []);

  const profile = useQuery({
    queryKey: keys.profile(firmId),
    queryFn: ({ signal }) => getProfile(signal),
    staleTime: 5 * 60_000,
  });

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      date: todayIso(),
      billedTo: null,
      shippedTo: null,
      lines: [],
      discounts: ["", ""],
      grRrNo: "",
      transport: "",
      vehicleNo: "",
      station: "",
    },
  });
  const { control, register, setValue, setError, clearErrors, formState } = form;
  const { errors, isDirty } = formState;
  const lines = useFieldArray({ control, name: "lines" });
  const values = useWatch({ control }) as BillFormValues;

  useUnsavedChanges(isDirty && !saved, onFinished);

  // Each time the page is shown with no customer yet, start in the customer search.
  // (Effects run again when Next.js shows a hidden page; autoFocus does not.)
  useEffect(() => {
    if (!form.getValues("billedTo")) customerSearchRef.current?.focus();
  }, [form]);

  // A mistake in a folded-away shipping field must be visible.
  const shippingError = Boolean(
    errors.shippedTo || errors.transport || errors.grRrNo || errors.vehicleNo || errors.station,
  );
  useEffect(() => {
    if (shippingError && shippingRef.current) shippingRef.current.open = true;
  }, [shippingError]);

  // Ctrl+S (Cmd+S on a Mac) saves the bill.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const save = useMutation({
    mutationFn: createSale,
    onSuccess: (invoice) => {
      setSaved(true);
      onFinished();
      // The list and today's totals change, and so does the stock of every item sold.
      void queryClient.invalidateQueries({ queryKey: keys.sales(firmId) });
      void queryClient.invalidateQueries({ queryKey: keys.items(firmId) });
      toast.success(`Bill ${invoice.invoiceNo} saved, ${formatRupees(invoice.grandTotal)}`);
      router.push(`/bills/${invoice.id}`);
    },
    onError: (error) => {
      const placed = applyFieldErrors(error, setError, (field) => billFieldFor(field) as Path<BillFormValues>);
      if (placed) return;
      if (isApiError(error) && error.code === "INSUFFICIENT_STOCK") {
        // Stock changed since the item was picked (another bill was saved meanwhile).
        void queryClient.invalidateQueries({ queryKey: keys.items(firmId) });
      }
      const message =
        isApiError(error) && error.code === "VALIDATION_FAILED"
          ? "Some details are not right. Check the fields marked in red."
          : errorMessage(error);
      setServerError(message);
      toast.error(message);
    },
  });

  // ---- Live preview, integer maths only ----
  const complete: { index: number; line: PreviewLine }[] = [];
  values.lines.forEach((l, index) => {
    const qty = parseQty(l.qty);
    const rate = parseRupees(l.rate);
    if (qty && qty >= 1 && rate !== null && !qtyProblem(l.qty) && !rateProblem(l.rate)) {
      complete.push({ index, line: { qty, rate, hsnCode: l.item.hsnCode } });
    }
  });
  const percents: number[] = [];
  for (const d of values.discounts) {
    if (!d.trim()) break;
    const milli = parsePercent(d);
    if (milli === null) break;
    percents.push(milli);
  }
  const interState = Boolean(values.billedTo && profile.data && values.billedTo.stateCode !== profile.data.stateCode);
  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(values.date);
  const preview =
    complete.length > 0 && dateOk
      ? previewBill(
          complete.map((c) => c.line),
          percents,
          values.date,
          interState,
        )
      : null;
  const lineRate = new Map(complete.map((c, i) => [c.index, preview?.lineRates[i]]));
  const liveStock = new Map(stockProblems(values.lines).map((p) => [p.index, p.message]));

  function chooseCustomer(contact: Contact) {
    setValue("billedTo", contact, { shouldDirty: true });
    clearErrors("billedTo");
    // Pieces and rate come next.
    window.setTimeout(() => document.getElementById(ADD_ITEM_ID)?.focus(), 0);
  }

  function addItem(item: Item) {
    if (lines.fields.length >= MAX_LINES) return;
    clearErrors("lines");
    lines.append({ key: newLineKey(), item, qty: "", rate: "" }, { focusName: `lines.${lines.fields.length}.qty` });
  }

  const firm = profile.data;

  return (
    <form
      ref={formRef}
      noValidate
      onKeyDown={moveToNextField}
      onSubmit={form.handleSubmit(
        (v) => {
          setServerError(null);
          save.mutate(toCreateSaleBody(v));
        },
        () => setServerError(null),
      )}
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <div className="grid min-w-0 gap-6">
        <Card className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="min-w-0">
            {values.billedTo ? (
              <>
                <p className="mb-2 font-medium">Customer</p>
                <ChosenParty
                  contact={values.billedTo}
                  firm={firm}
                  showTaxNote
                  changeLabel="Change"
                  onChange={() => {
                    setValue("billedTo", null, { shouldDirty: true });
                    window.setTimeout(() => customerSearchRef.current?.focus(), 0);
                  }}
                />
              </>
            ) : (
              <SearchSelect<Contact>
                label="Customer"
                placeholder="Search customer name or city"
                inputRef={customerSearchRef}
                enabled
                queryKey={(s) => keys.contactsSearch(firmId, s)}
                fetch={listContacts}
                filter={canBeBilled}
                getKey={(c) => c.id}
                getText={(c) => `${c.name}, ${c.city}`}
                renderOption={(c) => <ContactOption contact={c} />}
                onSelect={chooseCustomer}
                emptyText={(s) => (s ? `No customer matches “${s}”` : "No customers yet. Add one under Customers.")}
                error={errors.billedTo?.message}
              />
            )}
          </div>
          <Field label="Bill date" type="date" error={errors.date?.message} {...register("date")} />
        </Card>

        <Card className="@container p-0 sm:p-0">
          <h2 className="sr-only">Items</h2>
          {lines.fields.length > 0 && (
            <div
              aria-hidden
              className={cn(
                "hidden gap-3 border-b border-border bg-muted/60 px-6 py-3 font-semibold text-muted-foreground @2xl:grid",
                LINE_COLS,
              )}
            >
              <span>#</span>
              <span>Item</span>
              <span className="text-right">Pieces</span>
              <span className="text-right">Rate (₹)</span>
              <span className="text-right">Amount (₹)</span>
              <span />
            </div>
          )}

          <ol>
            {lines.fields.map((field, index) => {
              const line = values.lines[index] ?? field;
              const qty = parseQty(line.qty);
              const rate = parseRupees(line.rate);
              const amount = qty !== null && rate !== null ? qty * rate : null;
              const qtyError = errors.lines?.[index]?.qty?.message ?? liveStock.get(index);
              const rateError = errors.lines?.[index]?.rate?.message;
              const gst = lineRate.get(index);
              return (
                <li
                  key={field.id}
                  className={cn(
                    "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_3rem] items-start gap-3 border-b border-border px-4 py-4 @2xl:px-6",
                    LINE_COLS,
                  )}
                >
                  <span className="num hidden pt-3 text-muted-foreground @2xl:block">{index + 1}</span>
                  <div className="col-span-3 min-w-0 @2xl:col-span-1 @2xl:pt-1">
                    <p className="text-lg font-bold">{field.item.description}</p>
                    <p className="num text-muted-foreground">
                      {field.item.designNo}, HSN {field.item.hsnCode}, {field.item.stockQty} in stock
                    </p>
                  </div>
                  <Field
                    label="Pieces"
                    aria-label={`Pieces, line ${index + 1}`}
                    className="[&>label]:text-muted-foreground @2xl:[&>label]:sr-only"
                    inputMode="numeric"
                    autoComplete="off"
                    inputClassName="num text-right"
                    error={qtyError}
                    {...register(`lines.${index}.qty`)}
                  />
                  <Field
                    label="Rate (₹)"
                    aria-label={`Rate in rupees, line ${index + 1}`}
                    className="[&>label]:text-muted-foreground @2xl:[&>label]:sr-only"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0.00"
                    inputClassName="num text-right"
                    error={rateError}
                    {...register(`lines.${index}.rate`)}
                  />
                  <div className="order-last col-span-3 text-right @2xl:order-none @2xl:col-span-1 @2xl:pt-2.5">
                    <p className="num text-lg font-bold">
                      <span className="font-normal text-muted-foreground @2xl:hidden">Amount </span>
                      {amount === null ? "—" : formatPaise(amount)}
                    </p>
                    {gst !== undefined && <p className="num text-muted-foreground">GST {formatBp(gst)}</p>}
                  </div>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => lines.remove(index)}
                    aria-label={`Remove ${field.item.description} from the bill`}
                    className="flex size-12 items-center justify-center self-end rounded-lg text-destructive hover:bg-destructive/5 @2xl:self-start"
                  >
                    <Trash2 className="size-5" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="p-4 @2xl:px-6">
            {lines.fields.length < MAX_LINES ? (
              <SearchSelect<Item>
                label={lines.fields.length ? "Add another item" : "Add item"}
                placeholder="Search item by name or design no."
                enabled
                queryKey={(s) => keys.itemsSearch(firmId, s)}
                fetch={listItems}
                getKey={(i) => i.id}
                getText={(i) => `${i.description}, ${i.designNo}, ${i.stockQty} in stock`}
                isDisabled={(i) => i.stockQty <= 0}
                renderOption={(i) => <ItemOption item={i} />}
                onSelect={addItem}
                emptyText={(s) => (s ? `No item matches “${s}”` : "No items yet. Add one under Items.")}
                error={errors.lines?.message ?? errors.lines?.root?.message}
                inputClassName="border-dashed"
                id={ADD_ITEM_ID}
              />
            ) : (
              <p className="text-muted-foreground">A bill can have at most {MAX_LINES} items.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Discount</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field
              label="Discount 1 (%)"
              inputMode="decimal"
              autoComplete="off"
              placeholder="e.g. 10"
              inputClassName="num"
              error={errors.discounts?.[0]?.message ?? discountProblem(values.discounts[0]) ?? undefined}
              {...register("discounts.0")}
            />
            <Field
              label="Discount 2 (%)"
              inputMode="decimal"
              autoComplete="off"
              placeholder="e.g. 4.762"
              inputClassName="num"
              hint="Optional. Taken off after discount 1."
              error={errors.discounts?.[1]?.message ?? discountProblem(values.discounts[1]) ?? undefined}
              {...register("discounts.1")}
            />
          </div>
        </Card>

        <Card className="p-0 sm:p-0">
          <details ref={shippingRef}>
            <summary className="flex min-h-14 cursor-pointer items-center px-5 text-lg font-semibold sm:px-6">
              Shipping and transport (optional)
            </summary>
            <div className="grid gap-5 border-t border-border p-5 sm:grid-cols-2 sm:p-6">
              <div className="sm:col-span-2">
                {values.shippedTo ? (
                  <>
                    <p className="mb-2 font-medium">Ship to</p>
                    <ChosenParty
                      contact={values.shippedTo}
                      firm={firm}
                      changeLabel="Remove"
                      onChange={() => setValue("shippedTo", null, { shouldDirty: true })}
                    />
                  </>
                ) : (
                  <SearchSelect<Contact>
                    label="Ship to"
                    placeholder="Search party name or city"
                    hint="Leave empty when goods go to the customer."
                    enabled
                    queryKey={(s) => keys.contactsSearch(firmId, s)}
                    fetch={listContacts}
                    getKey={(c) => c.id}
                    getText={(c) => `${c.name}, ${c.city}`}
                    renderOption={(c) => <ContactOption contact={c} />}
                    onSelect={(c) => setValue("shippedTo", c, { shouldDirty: true })}
                    emptyText={(s) => (s ? `No party matches “${s}”` : "No parties yet.")}
                    error={errors.shippedTo?.message}
                  />
                )}
              </div>
              <Field label="Transport" autoComplete="off" error={errors.transport?.message} {...register("transport")} />
              <Field label="GR/RR no." autoComplete="off" error={errors.grRrNo?.message} {...register("grRrNo")} />
              <Field
                label="Vehicle no."
                autoComplete="off"
                inputClassName="uppercase"
                error={errors.vehicleNo?.message}
                {...register("vehicleNo")}
              />
              <Field label="Station" autoComplete="off" error={errors.station?.message} {...register("station")} />
            </div>
          </details>
        </Card>
      </div>

      <TotalsPanel
        preview={preview}
        interState={interState}
        hasLines={lines.fields.length > 0}
        dateHasNoRule={complete.length > 0 && dateOk && preview === null}
        incompleteLines={lines.fields.length - complete.length}
        saving={save.isPending || saved}
        shortcut={isMac ? "⌘S" : "Ctrl+S"}
        error={
          serverError && (
            <p
              role="alert"
              className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 font-medium text-destructive"
            >
              <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
              {serverError}
            </p>
          )
        }
      />
    </form>
  );
}

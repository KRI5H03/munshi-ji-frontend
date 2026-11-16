"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useUnsavedChanges } from "@/components/shell/navigation-guard";
import { Card, Field, SelectField, TextareaField, btnPrimary } from "@/components/ui/kit";
import { errorMessage, isApiError } from "@/lib/api/client";
import { createContact, updateContact } from "@/lib/api/contacts";
import { applyFieldErrors } from "@/lib/api/form-errors";
import { keys } from "@/lib/query";
import {
  CONTACT_FIELDS,
  changedFields,
  CONTACT_TYPES,
  contactDefaults,
  contactSchema,
  stateFromGstin,
  toContactBody,
  type ContactFormValues,
} from "@/lib/schemas/contact";
import { STATES, stateName } from "@/lib/states";
import type { Contact } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Add customer (no `saved`) or edit one (`saved` is the stored party).
 * After saving: back to the list with a "Saved" toast.
 */
export function CustomerForm({
  firmId,
  saved,
  onFinished,
  footer,
}: {
  firmId: string;
  saved?: Contact;
  onFinished: () => void;
  /** Extra controls under the form, like Delete on the edit page. */
  footer?: React.ReactNode;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const schema = useMemo(() => contactSchema(saved), [saved]);

  const form = useForm<ContactFormValues>({ resolver: zodResolver(schema), defaultValues: contactDefaults(saved) });
  const { register, control, setError, setValue, formState } = form;
  const { errors, isDirty } = formState;
  useUnsavedChanges(isDirty && !done, onFinished);

  const gstin = useWatch({ control, name: "gstin" });
  const gstinState = stateFromGstin(gstin);
  // A valid GSTIN decides the state; keep the State box showing it.
  useEffect(() => {
    if (gstinState) setValue("stateCode", gstinState, { shouldValidate: formState.isSubmitted });
  }, [gstinState, setValue, formState.isSubmitted]);

  const save = useMutation({
    mutationFn: (values: ContactFormValues) => {
      const body = toContactBody(values);
      if (!saved) return createContact(body);
      const changes = changedFields(body, saved);
      // Nothing changed: no request, just go back.
      return Object.keys(changes).length ? updateContact(saved.id, changes) : Promise.resolve(saved);
    },
    onSuccess: (contact) => {
      setDone(true);
      onFinished();
      void queryClient.invalidateQueries({ queryKey: keys.contactLists(firmId) });
      queryClient.setQueryData(keys.contact(firmId, contact.id), contact);
      toast.success("Saved");
      router.push("/customers");
    },
    onError: (error) => {
      if (applyFieldErrors(error, setError, CONTACT_FIELDS)) return;
      if (isApiError(error)) {
        if (error.code === "ALREADY_EXISTS") {
          setError("gstin", { message: "A party with this GSTIN is already saved" }, { shouldFocus: true });
          return;
        }
        if (error.code === "STATE_MISMATCH") {
          setError("gstin", { message: error.message }, { shouldFocus: true });
          return;
        }
        if (error.code === "INVALID_STATE") {
          setError("stateCode", { message: "Choose a state from the list" }, { shouldFocus: true });
          return;
        }
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
          label="Name"
          autoComplete="off"
          autoFocus={!saved}
          className="sm:col-span-2"
          error={errors.name?.message}
          {...register("name")}
        />

        <fieldset className="sm:col-span-2">
          <legend className="mb-2 font-medium">Type</legend>
          <div className="grid grid-cols-3 gap-2">
            {CONTACT_TYPES.map((t) => (
              <label
                key={t.value}
                className={cn(
                  "flex h-12 cursor-pointer items-center justify-center rounded-lg border border-input bg-card font-medium has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                  "has-checked:border-primary has-checked:bg-accent has-checked:font-semibold has-checked:text-accent-foreground has-checked:outline has-checked:outline-primary",
                )}
              >
                <input type="radio" value={t.value} className="sr-only" {...register("contactType")} />
                {t.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-muted-foreground">Only customers and “Both” can be billed.</p>
        </fieldset>

        <Field label="City" autoComplete="off" error={errors.city?.message} {...register("city")} />
        <Field
          label="Phone (optional)"
          inputMode="numeric"
          autoComplete="off"
          placeholder="10 digits"
          inputClassName="num"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <TextareaField
          label="Address (optional)"
          rows={2}
          className="sm:col-span-2"
          hint="Printed under the name on the bill."
          error={errors.address?.message}
          {...register("address")}
        />
      </Card>

      <Card className="grid gap-5 sm:grid-cols-2">
        <h2 className="text-xl font-bold sm:col-span-2">Tax details</h2>
        <Field
          label="GSTIN (optional)"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={15}
          inputClassName="num uppercase"
          hint={
            gstinState
              ? `State: ${stateName(gstinState)}, taken from the GSTIN.`
              : "Leave empty for a party without GST."
          }
          error={errors.gstin?.message}
          {...register("gstin")}
        />
        <SelectField
          label="State"
          disabled={Boolean(gstinState)}
          hint={gstinState ? "Set by the GSTIN." : "Needed when there is no GSTIN."}
          error={errors.stateCode?.message}
          {...register("stateCode")}
        >
          <option value="">Choose state</option>
          {Object.entries(STATES).map(([code, name]) => (
            <option key={code} value={code}>
              {code} {name}
            </option>
          ))}
        </SelectField>
        <Field
          label="PAN (optional)"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={10}
          inputClassName="num uppercase"
          error={errors.pan?.message}
          {...register("pan")}
        />
        <Field
          label="Aadhaar (optional)"
          inputMode="numeric"
          autoComplete="off"
          maxLength={14}
          inputClassName="num"
          placeholder={saved?.aadhaarEncrypted ? "Saved. Type a new one to replace it." : "12 digits"}
          hint={saved?.aadhaarEncrypted ? "An Aadhaar number is saved. It is not shown here." : undefined}
          error={errors.aadhaar?.message}
          {...register("aadhaar")}
        />
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
          {busy ? "Saving" : saved ? "Save changes" : "Save customer"}
        </button>
        {footer}
      </div>
    </form>
  );
}

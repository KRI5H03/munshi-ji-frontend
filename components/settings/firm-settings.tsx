"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, Lock } from "lucide-react";
import { useForm, useWatch, type Control } from "react-hook-form";
import { toast } from "sonner";
import { useUnsavedChanges } from "@/components/shell/navigation-guard";
import { Card, Field, PageHeader, TextareaField, btnPrimary } from "@/components/ui/kit";
import { ListError } from "@/components/ui/list-states";
import { useFirmId } from "@/hooks/use-firm-id";
import { getProfile, updateProfile } from "@/lib/api/business";
import { errorMessage, isApiError } from "@/lib/api/client";
import { applyFieldErrors } from "@/lib/api/form-errors";
import { formatPhone } from "@/lib/money";
import { keys } from "@/lib/query";
import {
  PROFILE_FIELDS,
  changedProfileFields,
  profileDefaults,
  profileSchema,
  type ProfileFormValues,
} from "@/lib/schemas/business";
import { currentBusiness, useSession } from "@/lib/session";
import { stateName } from "@/lib/states";
import type { Business } from "@/lib/types";
import { cn } from "@/lib/utils";

/** A value that can never change, shown like a field but locked. */
function Locked({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div>
      <p className="mb-2 font-medium">{label}</p>
      <p className="num flex h-12 items-center gap-2 rounded-lg border border-border bg-muted px-4 text-muted-foreground">
        <Lock className="size-4 shrink-0" aria-hidden />
        {value}
      </p>
      <p className="mt-2 text-muted-foreground">{hint}</p>
    </div>
  );
}

/** The top of the printed bill as it will look, from what is typed now. */
function BillTopPreview({ control, firm }: { control: Control<ProfileFormValues>; firm: Business }) {
  const v = useWatch({ control });
  const phone = (v.phone ?? "").replace(/\s/g, "");
  return (
    <Card className="xl:sticky xl:top-6" aria-labelledby="bill-top-title">
      <h2 id="bill-top-title" className="text-xl font-bold">
        On the bill
      </h2>
      <p className="mt-1 text-muted-foreground">The top of every printed copy, as you type.</p>
      <div className="mt-4 rounded-md border border-border bg-white p-4 text-[13px] leading-snug text-black" aria-hidden>
        <div className="flex justify-between gap-2">
          <span>
            GSTIN : <b>{firm.gstin}</b>
          </span>
          <b>Original Copy</b>
        </div>
        <div className="mt-1 text-center">
          <p className="font-bold underline">TAX INVOICE</p>
          <p className="mt-1 text-xl leading-tight font-bold break-words">{v.name || " "}</p>
          {v.msmeUdhyamNo?.trim() && <p>MSME Udyam No. : {v.msmeUdhyamNo.toUpperCase()}</p>}
          <p className="break-words">{v.address}</p>
          {v.branchAddress?.trim() && <p className="break-words">Branch : {v.branchAddress}</p>}
          {/^\d{10}$/.test(phone) && <p>Phone : {formatPhone(phone)}</p>}
        </div>
        <div className="mt-3 border-t border-black pt-2 text-[12px]">
          <p>
            <b>Bank Details :</b> {[v.bankName, v.bankBranch].filter((x) => x?.trim()).join(", ")}
            {v.bankAccountNo?.trim() && <> A/c No. : {v.bankAccountNo}</>}
            {v.ifsc?.trim() && <> IFSC : {v.ifsc.toUpperCase()}</>}
          </p>
          <p className="mt-2 font-bold underline">Terms &amp; Conditions</p>
          <p>E.&amp; O.E.</p>
          <p className="whitespace-pre-line">{v.termsText}</p>
        </div>
      </div>
    </Card>
  );
}

function SettingsForm({ firmId, saved, canEdit }: { firmId: string; saved: Business; canEdit: boolean }) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [current, setCurrent] = useState(saved);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema(current)),
    defaultValues: profileDefaults(saved),
  });
  const { register, control, setError, reset, formState } = form;
  const { errors, isDirty } = formState;
  useUnsavedChanges(canEdit && isDirty);

  const save = useMutation({
    mutationFn: (values: ProfileFormValues) => {
      const changes = changedProfileFields(values, current);
      // Nothing changed: no request.
      return Object.keys(changes).length ? updateProfile(changes) : Promise.resolve(current);
    },
    onSuccess: (business) => {
      // New bills and printed bills read the firm from this cache.
      queryClient.setQueryData(keys.profile(firmId), business);
      setCurrent(business);
      reset(profileDefaults(business));
      toast.success("Saved");
    },
    onError: (error) => {
      if (applyFieldErrors(error, setError, PROFILE_FIELDS)) return;
      const message =
        isApiError(error) && error.code === "VALIDATION_FAILED"
          ? "Some details are not right. Check the fields marked in red."
          : errorMessage(error);
      setServerError(message);
      toast.error(message);
    },
  });

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <form
        noValidate
        onSubmit={form.handleSubmit(
          (values) => {
            setServerError(null);
            save.mutate(values);
          },
          () => setServerError(null),
        )}
        className="grid min-w-0 gap-6"
      >
        {!canEdit && (
          <p className="flex items-start gap-3 rounded-lg border border-border bg-muted px-4 py-3 text-lg">
            <Lock className="mt-1 size-5 shrink-0" aria-hidden />
            Only the owner can change these details. You can see them here.
          </p>
        )}

        <fieldset disabled={!canEdit || save.isPending} className="grid min-w-0 gap-6">
          <Card className="grid gap-5 sm:grid-cols-2">
            <h2 className="text-xl font-bold sm:col-span-2">Firm</h2>
            <Field
              label="Firm name"
              autoComplete="organization"
              className="sm:col-span-2"
              error={errors.name?.message}
              {...register("name")}
            />
            <Locked label="GSTIN" value={current.gstin} hint="Cannot be changed." />
            <Locked
              label="State"
              value={`${current.stateCode} ${stateName(current.stateCode)}`}
              hint="Comes from the GSTIN."
            />
            <TextareaField
              label="Shop address"
              rows={2}
              className="sm:col-span-2"
              error={errors.address?.message}
              {...register("address")}
            />
            <TextareaField
              label="Branch address (optional)"
              rows={2}
              className="sm:col-span-2"
              error={errors.branchAddress?.message}
              {...register("branchAddress")}
            />
            <Field
              label="Phone (optional)"
              inputMode="numeric"
              autoComplete="off"
              placeholder="10 digits"
              inputClassName="num"
              error={errors.phone?.message}
              {...register("phone")}
            />
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
              label="MSME Udyam no. (optional)"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={30}
              placeholder="UDYAM-UP-00-0000000"
              inputClassName="num uppercase"
              error={errors.msmeUdhyamNo?.message}
              {...register("msmeUdhyamNo")}
            />
            <Field
              label="Jurisdiction (optional)"
              autoComplete="off"
              placeholder="e.g. Kanpur"
              hint="The city whose courts handle disputes."
              error={errors.jurisdiction?.message}
              {...register("jurisdiction")}
            />
          </Card>

          <Card className="grid gap-5 sm:grid-cols-2">
            <h2 className="text-xl font-bold sm:col-span-2">Bank details</h2>
            <p className="-mt-3 text-muted-foreground sm:col-span-2">Printed on every bill so customers can pay you.</p>
            <Field label="Bank name" autoComplete="off" error={errors.bankName?.message} {...register("bankName")} />
            <Field label="Branch" autoComplete="off" error={errors.bankBranch?.message} {...register("bankBranch")} />
            <Field
              label="Account no."
              inputMode="numeric"
              autoComplete="off"
              inputClassName="num"
              error={errors.bankAccountNo?.message}
              {...register("bankAccountNo")}
            />
            <Field
              label="IFSC"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={11}
              inputClassName="num uppercase"
              error={errors.ifsc?.message}
              {...register("ifsc")}
            />
          </Card>

          <Card>
            <TextareaField
              label="Terms on the bill"
              rows={4}
              hint="One per line. Printed under “E.& O.E.” at the bottom of every bill."
              placeholder={"Goods once sold will not be taken back.\nAll disputes subject to Kanpur jurisdiction."}
              error={errors.termsText?.message}
              {...register("termsText")}
            />
          </Card>
        </fieldset>

        {serverError && (
          <p
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 font-medium text-destructive"
          >
            <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
            {serverError}
          </p>
        )}

        {canEdit && (
          <div>
            <button type="submit" disabled={save.isPending} className={cn(btnPrimary, "h-14 px-8 text-lg")}>
              {save.isPending ? "Saving" : "Save changes"}
            </button>
          </div>
        )}
      </form>

      <BillTopPreview control={control} firm={current} />
    </div>
  );
}

function SettingsPlaceholder() {
  return (
    <div role="status" aria-label="Loading firm settings" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="grid gap-6">
        <Card className="h-96 animate-pulse" />
        <Card className="h-56 animate-pulse" />
      </div>
      <Card className="h-80 animate-pulse" />
    </div>
  );
}

export function FirmSettings() {
  const firmId = useFirmId();
  const canEdit = currentBusiness(useSession())?.role === "owner";
  const profile = useQuery({
    queryKey: keys.profile(firmId ?? ""),
    queryFn: ({ signal }) => getProfile(signal),
    enabled: Boolean(firmId),
  });

  let body: React.ReactNode;
  if (profile.isError) {
    body = <ListError what="Firm settings" error={profile.error} onRetry={() => profile.refetch()} />;
  } else if (!firmId || !profile.data) {
    body = <SettingsPlaceholder />;
  } else {
    // A fresh form for each firm; after saving, the form itself takes the saved values.
    body = <SettingsForm key={firmId} firmId={firmId} saved={profile.data} canEdit={canEdit} />;
  }

  return (
    <>
      <PageHeader title="Firm settings" sub="These details print on every bill." />
      {body}
    </>
  );
}

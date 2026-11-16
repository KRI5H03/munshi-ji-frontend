"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CustomerForm } from "@/components/customers/customer-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, btnDanger, btnOutline } from "@/components/ui/kit";
import { ListError } from "@/components/ui/list-states";
import { useFirmId } from "@/hooks/use-firm-id";
import { useFreshForm } from "@/hooks/use-fresh-form";
import { errorMessage, isApiError } from "@/lib/api/client";
import { deleteContact, getContact } from "@/lib/api/contacts";
import { keys } from "@/lib/query";
import type { Contact } from "@/lib/types";

function FormPlaceholder() {
  return (
    <div role="status" aria-label="Loading customer" className="grid max-w-3xl gap-6">
      <Card className="h-80 animate-pulse" />
      <Card className="h-56 animate-pulse" />
    </div>
  );
}

function DeleteCustomer({ firmId, contact, onDeleted }: { firmId: string; contact: Contact; onDeleted: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [asking, setAsking] = useState(false);
  const remove = useMutation({
    mutationFn: () => deleteContact(contact.id),
    onSuccess: () => {
      onDeleted();
      setAsking(false);
      // Refresh the lists only: asking again for the deleted customer would just get "not found".
      void queryClient.invalidateQueries({ queryKey: keys.contactLists(firmId) });
      toast.success(`${contact.name} deleted`);
      router.push("/customers");
    },
    onError: (error) => {
      setAsking(false);
      toast.error(errorMessage(error));
    },
  });

  return (
    <>
      <button type="button" className={btnDanger} onClick={() => setAsking(true)}>
        Delete customer
      </button>
      <ConfirmDialog
        open={asking}
        title={`Delete ${contact.name}?`}
        keepLabel="Keep"
        confirmLabel={remove.isPending ? "Deleting" : "Delete"}
        busy={remove.isPending}
        onKeep={() => setAsking(false)}
        onConfirm={() => remove.mutate()}
      >
        They will no longer appear in lists or searches. Bills already made keep their details.
      </ConfirmDialog>
    </>
  );
}

function EditCustomerLoaded({ firmId, id }: { firmId: string; id: string }) {
  const { formKey, markFinished } = useFreshForm();
  const contact = useQuery({
    queryKey: keys.contact(firmId, id),
    queryFn: ({ signal }) => getContact(id, signal),
  });

  if (contact.isError) {
    if (isApiError(contact.error) && (contact.error.status === 404 || contact.error.code === "INVALID_ID")) {
      return (
        <Card className="flex max-w-2xl flex-col items-start gap-4">
          <p className="text-xl font-bold">This customer was not found</p>
          <p className="text-muted-foreground">It may have been deleted, or the link is wrong.</p>
          <Link href="/customers" className={btnOutline}>
            Go to customers
          </Link>
        </Card>
      );
    }
    return <ListError what="This customer" error={contact.error} onRetry={() => contact.refetch()} />;
  }
  if (!contact.data) return <FormPlaceholder />;

  return (
    <CustomerForm
      key={`${contact.data.id}:${formKey}`}
      firmId={firmId}
      saved={contact.data}
      onFinished={markFinished}
      footer={<DeleteCustomer firmId={firmId} contact={contact.data} onDeleted={markFinished} />}
    />
  );
}

/** Reads the id from the address. Rendered inside Suspense, since the id is only known when the page opens. */
export function EditCustomer() {
  const firmId = useFirmId();
  const { id } = useParams<{ id: string }>();
  if (!firmId) return <FormPlaceholder />;
  return <EditCustomerLoaded key={firmId} firmId={firmId} id={id} />;
}

export function NewCustomer() {
  const firmId = useFirmId();
  const { formKey, markFinished } = useFreshForm();
  if (!firmId) return <FormPlaceholder />;
  return <CustomerForm key={`${firmId}:${formKey}`} firmId={firmId} onFinished={markFinished} />;
}

export { FormPlaceholder as CustomerFormPlaceholder };

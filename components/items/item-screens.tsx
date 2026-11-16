"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ItemForm } from "@/components/items/item-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, btnDanger, btnOutline } from "@/components/ui/kit";
import { ListError } from "@/components/ui/list-states";
import { useFirmId } from "@/hooks/use-firm-id";
import { useFreshForm } from "@/hooks/use-fresh-form";
import { errorMessage, isApiError } from "@/lib/api/client";
import { deleteItem, getItem } from "@/lib/api/items";
import { keys } from "@/lib/query";
import type { Item } from "@/lib/types";

export function ItemFormPlaceholder() {
  return (
    <div role="status" aria-label="Loading item" className="grid max-w-3xl gap-6">
      <Card className="h-80 animate-pulse" />
    </div>
  );
}

function DeleteItem({ firmId, item, onDeleted }: { firmId: string; item: Item; onDeleted: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [asking, setAsking] = useState(false);
  const remove = useMutation({
    mutationFn: () => deleteItem(item.id),
    onSuccess: () => {
      onDeleted();
      setAsking(false);
      // Refresh the lists only: asking again for the deleted item would just get "not found".
      void queryClient.invalidateQueries({ queryKey: keys.itemLists(firmId) });
      toast.success(`${item.description} (${item.designNo}) deleted`);
      router.push("/items");
    },
    onError: (error) => {
      setAsking(false);
      toast.error(errorMessage(error));
    },
  });

  return (
    <>
      <button type="button" className={btnDanger} onClick={() => setAsking(true)}>
        Delete item
      </button>
      <ConfirmDialog
        open={asking}
        title={`Delete ${item.description} (${item.designNo})?`}
        keepLabel="Keep"
        confirmLabel={remove.isPending ? "Deleting" : "Delete"}
        busy={remove.isPending}
        onKeep={() => setAsking(false)}
        onConfirm={() => remove.mutate()}
      >
        {item.stockQty > 0 && (
          <span className="mb-2 block font-medium text-foreground">
            It still has {item.stockQty} {item.unit.toLowerCase()} in stock.
          </span>
        )}
        It will no longer appear in lists or when making a bill. Bills already made keep its details.
      </ConfirmDialog>
    </>
  );
}

function EditItemLoaded({ firmId, id }: { firmId: string; id: string }) {
  const { formKey, markFinished } = useFreshForm();
  const item = useQuery({ queryKey: keys.item(firmId, id), queryFn: ({ signal }) => getItem(id, signal) });

  if (item.isError) {
    if (isApiError(item.error) && (item.error.status === 404 || item.error.code === "INVALID_ID")) {
      return (
        <Card className="flex max-w-2xl flex-col items-start gap-4">
          <p className="text-xl font-bold">This item was not found</p>
          <p className="text-muted-foreground">It may have been deleted, or the link is wrong.</p>
          <Link href="/items" className={btnOutline}>
            Go to items
          </Link>
        </Card>
      );
    }
    return <ListError what="This item" error={item.error} onRetry={() => item.refetch()} />;
  }
  if (!item.data) return <ItemFormPlaceholder />;

  return (
    <ItemForm
      key={`${item.data.id}:${formKey}`}
      firmId={firmId}
      saved={item.data}
      onFinished={markFinished}
      footer={<DeleteItem firmId={firmId} item={item.data} onDeleted={markFinished} />}
    />
  );
}

/** Reads the id from the address. Rendered inside Suspense, since the id is only known when the page opens. */
export function EditItem() {
  const firmId = useFirmId();
  const { id } = useParams<{ id: string }>();
  if (!firmId) return <ItemFormPlaceholder />;
  return <EditItemLoaded key={firmId} firmId={firmId} id={id} />;
}

export function NewItem() {
  const firmId = useFirmId();
  const { formKey, markFinished } = useFreshForm();
  if (!firmId) return <ItemFormPlaceholder />;
  return <ItemForm key={`${firmId}:${formKey}`} firmId={firmId} onFinished={markFinished} />;
}

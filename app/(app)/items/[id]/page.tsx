import { Suspense } from "react";
import { EditItem, ItemFormPlaceholder } from "@/components/items/item-screens";
import { BackLink } from "@/components/shell/back-link";
import { PageHeader } from "@/components/ui/kit";

export const metadata = { title: "Edit item — Munshi Ji" };

// After saving: back to /items with a "Saved" toast. Delete is at the bottom of the form.
export default function EditItemPage() {
  return (
    <>
      <PageHeader title="Edit item" back={<BackLink href="/items" to="items" />} />
      <Suspense fallback={<ItemFormPlaceholder />}>
        <EditItem />
      </Suspense>
    </>
  );
}

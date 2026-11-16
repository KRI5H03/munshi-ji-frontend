import { NewItem } from "@/components/items/item-screens";
import { BackLink } from "@/components/shell/back-link";
import { PageHeader } from "@/components/ui/kit";

export const metadata = { title: "Add item — Munshi Ji" };

// After saving: back to /items with a "Saved" toast.
export default function NewItemPage() {
  return (
    <>
      <PageHeader title="Add item" back={<BackLink href="/items" to="items" />} />
      <NewItem />
    </>
  );
}

import { NewBill } from "@/components/bills/new-bill/new-bill";
import { BackLink } from "@/components/shell/back-link";
import { PageHeader } from "@/components/ui/kit";

export const metadata = { title: "New bill — Munshi Ji" };

// After saving, a new bill opens its print page (/bills/[id]).
export default function NewBillPage() {
  return (
    <>
      <PageHeader
        title="New bill"
        sub="The bill number is given when you save"
        back={<BackLink href="/bills" to="bills" />}
      />
      <NewBill />
    </>
  );
}

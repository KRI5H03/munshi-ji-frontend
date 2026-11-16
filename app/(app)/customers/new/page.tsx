import { NewCustomer } from "@/components/customers/customer-screens";
import { BackLink } from "@/components/shell/back-link";
import { PageHeader } from "@/components/ui/kit";

export const metadata = { title: "Add customer — Munshi Ji" };

// After saving: back to /customers with a "Saved" toast.
export default function NewCustomerPage() {
  return (
    <>
      <PageHeader title="Add customer" back={<BackLink href="/customers" to="customers" />} />
      <NewCustomer />
    </>
  );
}

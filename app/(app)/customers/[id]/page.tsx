import { Suspense } from "react";
import { CustomerFormPlaceholder, EditCustomer } from "@/components/customers/customer-screens";
import { BackLink } from "@/components/shell/back-link";
import { PageHeader } from "@/components/ui/kit";

export const metadata = { title: "Edit customer — Munshi Ji" };

// After saving: back to /customers with a "Saved" toast. Delete is at the bottom of the form.
export default function EditCustomerPage() {
  return (
    <>
      <PageHeader title="Edit customer" back={<BackLink href="/customers" to="customers" />} />
      <Suspense fallback={<CustomerFormPlaceholder />}>
        <EditCustomer />
      </Suspense>
    </>
  );
}

import { NotBuiltYet } from "@/components/shell/not-built-yet";

export const metadata = { title: "Add customer — Munshi Ji" };

// After saving: back to /customers with a "Saved" toast.
export default function Page() {
  return <NotBuiltYet title="Add customer" mockup="customers" back={{ href: "/customers", to: "customers" }} />;
}

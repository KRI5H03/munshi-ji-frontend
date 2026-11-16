import { NotBuiltYet } from "@/components/shell/not-built-yet";

export const metadata = { title: "Bill — Munshi Ji" };

// Opening a bill shows it ready to print. That screen is built last.
export default function BillPage() {
  return <NotBuiltYet title="Open / Print bill" mockup="print" back={{ href: "/bills", to: "bills" }} />;
}

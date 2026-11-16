import { NotBuiltYet } from "@/components/shell/not-built-yet";

export const metadata = { title: "New bill — Munshi Ji" };

// After saving, a new bill opens its print page (/bills/[id]).
export default function Page() {
  return <NotBuiltYet title="New bill" mockup="new-bill" back={{ href: "/bills", to: "bills" }} />;
}

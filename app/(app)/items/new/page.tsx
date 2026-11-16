import { NotBuiltYet } from "@/components/shell/not-built-yet";

export const metadata = { title: "Add item — Munshi Ji" };

// After saving: back to /items with a "Saved" toast.
export default function Page() {
  return <NotBuiltYet title="Add item" mockup="items" back={{ href: "/items", to: "items" }} />;
}

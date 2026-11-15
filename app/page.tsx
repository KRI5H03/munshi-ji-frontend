import { redirect } from "next/navigation";

// Phase 1: the app is only the design options.
export default function Home() {
  redirect("/design");
}

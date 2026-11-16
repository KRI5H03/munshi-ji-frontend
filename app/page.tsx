import { redirect } from "next/navigation";

// Bills is home. The app layout sends you to login first if needed.
export default function Home() {
  redirect("/bills");
}

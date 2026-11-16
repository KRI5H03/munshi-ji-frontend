import Link from "next/link";
import { Field, Sheet, btnPrimary } from "@/components/design/c/ui";
import { cn } from "@/lib/utils";
import { login } from "@/lib/mock";

export default function LoginC() {
  return (
    <main className="mx-auto grid max-w-4xl items-start gap-6 px-4 py-10 md:grid-cols-2 md:py-20">
      <Sheet className="p-6 sm:p-8">
        <p className="text-4xl leading-none font-bold">Munshi Ji</p>
        <p className="mt-2 text-muted-foreground">Billing for your shop</p>

        <form className="mt-8 grid gap-6">
          <Field label="Email" type="email" defaultValue="krish@example.com" autoComplete="email" />
          <Field label="Password" type="password" defaultValue="password1" autoComplete="current-password" />
          <p role="alert" className="border-l-4 border-destructive pl-3 font-bold text-destructive">
            Email or password is wrong. Check both and try again.
          </p>
          <button type="button" className={cn(btnPrimary, "h-16 text-xl")}>
            Log in
          </button>
        </form>
      </Sheet>

      <Sheet className="p-6 sm:p-8">
        <h2 className="text-3xl font-bold">Which firm today?</h2>
        <p className="mt-2 text-muted-foreground">Asked only if you have more than one. Tap a firm to open it.</p>
        <ul className="mt-6 grid gap-4">
          {login.businesses.map((firm) => (
            <li key={firm.id}>
              <Link
                href="/design/c/bills"
                className={cn(
                  "flex min-h-20 flex-col justify-center rounded-md border border-input bg-card px-5 py-3 transition-colors duration-150 hover:bg-muted",
                  firm.isDefault && "border-2 border-foreground",
                )}
              >
                <span className="text-xl font-bold">{firm.name}</span>
                <span className="text-base text-muted-foreground">
                  {firm.role === "owner" ? "You are the owner" : "You are staff"}
                  {firm.isDefault && ", your main firm"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Sheet>
    </main>
  );
}

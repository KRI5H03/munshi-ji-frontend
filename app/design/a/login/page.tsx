import Link from "next/link";
import { Check, CircleAlert } from "lucide-react";
import { Card, Field, btnPrimary } from "@/components/design/a/ui";
import { cn } from "@/lib/utils";
import { login } from "@/lib/mock";

export default function LoginA() {
  return (
    <main className="mx-auto grid max-w-4xl items-start gap-6 px-4 py-10 md:grid-cols-2 md:py-20">
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-lg bg-primary text-xl font-bold text-primary-foreground">
            म
          </span>
          <div>
            <p className="text-2xl leading-tight font-bold">Munshi Ji</p>
            <p className="text-muted-foreground">Billing for your shop</p>
          </div>
        </div>

        <h1 className="mt-8 text-3xl font-bold tracking-tight">Log in</h1>
        <form className="mt-6 grid gap-5">
          <Field label="Email" type="email" defaultValue="krish@example.com" autoComplete="email" />
          <Field label="Password" type="password" defaultValue="password1" autoComplete="current-password" />
          <button type="button" className={cn(btnPrimary, "h-14 text-lg")}>
            Log in
          </button>
          <p
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 font-medium text-destructive"
          >
            <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
            Email or password is wrong.
          </p>
        </form>
      </Card>

      <Card className="p-6 sm:p-8">
        <p className="font-medium text-accent-foreground">Step 2, only if you have more than one firm</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">Which firm today?</h2>
        <div role="radiogroup" aria-label="Firm" className="mt-6 grid gap-3">
          {login.businesses.map((firm) => (
            <button
              key={firm.id}
              type="button"
              role="radio"
              aria-checked={firm.isDefault}
              className={cn(
                "flex min-h-16 items-center justify-between gap-3 rounded-lg border border-input bg-card px-5 py-3 text-left transition-colors duration-150 hover:bg-muted",
                firm.isDefault && "border-2 border-primary bg-accent hover:bg-accent",
              )}
            >
              <span>
                <span className="block text-lg font-bold">{firm.name}</span>
                <span className="block text-muted-foreground capitalize">{firm.role}</span>
              </span>
              {firm.isDefault && <Check className="size-6 text-primary" aria-hidden />}
            </button>
          ))}
        </div>
        <Link href="/design/a/bills" className={cn(btnPrimary, "mt-6 h-14 w-full text-lg")}>
          Continue
        </Link>
        <p className="mt-4 text-muted-foreground">You can switch firm any time from the top of the menu.</p>
      </Card>
    </main>
  );
}

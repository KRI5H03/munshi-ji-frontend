import Link from "next/link";
import { Field, Kbd, Pane, btnPrimary, mono } from "@/components/design/b/ui";
import { cn } from "@/lib/utils";
import { login } from "@/lib/mock";

export default function LoginB() {
  return (
    <main className="mx-auto grid max-w-4xl items-start gap-4 p-3 md:grid-cols-2 md:py-16">
      <Pane title="Munshi Ji: log in">
        <form className="grid gap-3 p-3">
          <Field label="Email" type="email" defaultValue="krish@example.com" autoComplete="email" />
          <Field label="Password" type="password" defaultValue="password1" autoComplete="current-password" focused />
          <p role="alert" className="border-l-4 border-destructive bg-muted px-3 py-2 font-semibold text-destructive">
            Email or password is wrong.
          </p>
          <button type="button" className={cn(btnPrimary, "justify-between")}>
            Log in
            <Kbd>Enter</Kbd>
          </button>
        </form>
      </Pane>

      <Pane title="Choose firm" right={<span className="text-white/80">only if you have 2 or more</span>}>
        <ol role="listbox" aria-label="Firm">
          {login.businesses.map((firm, i) => (
            <li key={firm.id} role="option" aria-selected={firm.isDefault}>
              <Link
                href="/design/b/bills"
                className={cn(
                  "flex min-h-12 items-center gap-3 border-b border-border px-3 py-2 hover:bg-muted",
                  firm.isDefault && "bg-accent hover:bg-accent",
                )}
              >
                <Kbd>{i + 1}</Kbd>
                <span className="font-bold">{firm.name}</span>
                <span className="ml-auto text-muted-foreground capitalize">{firm.role}</span>
              </Link>
            </li>
          ))}
        </ol>
        <p className={cn(mono, "px-3 py-2 text-muted-foreground")}>
          Press 1 or 2. Or ↑ ↓ and Enter.
        </p>
      </Pane>
    </main>
  );
}

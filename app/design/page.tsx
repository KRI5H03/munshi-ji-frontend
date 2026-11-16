import Link from "next/link";
import { SCREENS } from "@/components/design/screens";

export const metadata = { title: "Munshi Ji — design mock-ups" };

export default function DesignIndex() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Design mock-ups</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Direction A, with sample data. These are the screens not yet built for real; each one is removed here once
        its real screen works.
      </p>
      <ol className="mt-6 divide-y divide-border rounded-xl border border-border bg-card px-5">
        {SCREENS.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/design/a/${s.slug}`}
              className="flex min-h-12 items-center py-2 text-lg font-medium underline-offset-4 hover:underline"
            >
              {s.name}
            </Link>
          </li>
        ))}
      </ol>
      <Link href="/bills" className="mt-6 inline-block text-lg font-semibold text-primary underline underline-offset-4">
        Open the app
      </Link>
    </main>
  );
}

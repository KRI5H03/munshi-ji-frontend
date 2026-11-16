import Link from "next/link";
import { DIRECTIONS, SCREENS } from "@/components/design/screens";

export const metadata = { title: "Munshi Ji — design options" };

export default function DesignIndex() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-neutral-900">
      <h1 className="text-3xl font-bold">Munshi Ji design options</h1>
      <p className="mt-2 max-w-[65ch] text-lg text-neutral-600">
        Three directions, seven screens each. All data is mock. Open any screen, then use the dark
        strip at the top to see the same screen in the other two. Try a phone-width window too.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {DIRECTIONS.map((d) => (
          <section key={d.letter} className="rounded-lg border border-neutral-300 bg-white p-5">
            <h2 className="text-xl font-bold">
              {d.letter.toUpperCase()}. {d.name}
            </h2>
            <p className="mt-1 text-base text-neutral-600">{d.line}</p>
            <ol className="mt-4 divide-y divide-neutral-200 border-t border-neutral-200">
              {SCREENS.map((s, i) => (
                <li key={s.slug}>
                  <Link
                    href={`/design/${d.letter}/${s.slug}`}
                    className="flex min-h-11 items-center gap-3 py-2 text-base font-medium underline-offset-4 hover:underline"
                  >
                    <span className="num w-4 text-neutral-500">{i + 1}</span>
                    {s.name}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <p className="mt-8 text-base text-neutral-600">
        Notes on each direction are in <code>DESIGN.md</code>. To choose one, write{" "}
        <strong>BUILD A</strong>, <strong>BUILD B</strong> or <strong>BUILD C</strong>.
      </p>
    </main>
  );
}

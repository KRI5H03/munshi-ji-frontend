"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DIRECTIONS } from "@/components/design/screens";

/** Review strip above every design screen. Not part of any design. */
export function DesignBar() {
  const [, , current, screen = "bills"] = usePathname().split("/");
  return (
    <div
      className="no-print flex h-9 items-center gap-4 bg-neutral-900 px-3 text-sm text-neutral-200"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <Link href="/design" className="underline underline-offset-2">
        All designs
      </Link>
      <span className="text-neutral-400">Same screen in:</span>
      {DIRECTIONS.map((d) => (
        <Link
          key={d.letter}
          href={`/design/${d.letter}/${screen}`}
          aria-current={d.letter === current ? "page" : undefined}
          className={
            d.letter === current
              ? "rounded-sm bg-white px-2 font-semibold text-neutral-900"
              : "px-2 underline underline-offset-2"
          }
        >
          {d.letter.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}

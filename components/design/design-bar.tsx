import Link from "next/link";

/** Strip above every static mock-up, so it is never mistaken for the real screen. */
export function DesignBar() {
  return (
    <div
      className="no-print flex h-9 items-center gap-4 bg-neutral-900 px-3 text-sm text-neutral-200"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <span>Design mock-up with sample data</span>
      <Link href="/design" className="underline underline-offset-2">
        All mock-ups
      </Link>
      <Link href="/bills" className="underline underline-offset-2">
        Open the app
      </Link>
    </div>
  );
}

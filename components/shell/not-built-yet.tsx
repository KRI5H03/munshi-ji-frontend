import Link from "next/link";
import { Card, PageHead } from "@/components/ui/kit";

/** Stands in for a screen until its turn comes. Deleted when the last screen is built. */
export function NotBuiltYet({ title, mockup }: { title: string; mockup: string }) {
  return (
    <>
      <PageHead title={title} />
      <Card className="max-w-2xl">
        <p className="text-lg">This screen is not built yet. Screens are built one at a time.</p>
        <Link
          href={`/design/a/${mockup}`}
          className="mt-3 inline-block text-lg font-semibold text-primary underline underline-offset-4"
        >
          See its design with sample data
        </Link>
      </Card>
    </>
  );
}

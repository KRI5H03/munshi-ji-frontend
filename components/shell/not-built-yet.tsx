import Link from "next/link";
import { BackLink } from "@/components/shell/back-link";
import { PrimaryAction } from "@/components/shell/list-actions";
import { Card, PageHeader } from "@/components/ui/kit";

type Props = {
  title: string;
  mockup: string;
  /** List page: the section whose primary action goes in the header. */
  listOf?: string;
  /** Create, edit or detail page: where Back goes. */
  back?: { href: string; to: string };
};

/** Stands in for a screen until its turn comes. Deleted when the last screen is built. */
export function NotBuiltYet({ title, mockup, listOf, back }: Props) {
  return (
    <>
      <PageHeader
        title={title}
        back={back && <BackLink href={back.href} to={back.to} />}
        actions={listOf && <PrimaryAction sectionHref={listOf} />}
      />
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
